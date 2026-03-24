import React from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import api from '../../services/api';
import { useEffect, useState } from 'react';

const COLORS = ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#9b59b6'];

const AnalyticsDashboard = () => {
  const [dashStats, setDashStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [incMetrics, setIncMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, trendRes, metricsRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/trends/applications'),
          api.get('/analytics/metrics/inspections'),
        ]);
        setDashStats(statsRes.data.stats);
        setTrend(
          trendRes.data.trend.map((t) => ({
            month: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
            total: t.count,
            approved: t.approved,
          }))
        );
        setIncMetrics(metricsRes.data.metrics);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div style={styles.loading}>Loading analytics...</div>;

  const pieData = incMetrics?.byResult?.map((item) => ({
    name: item._id || 'N/A',
    value: item.count,
  })) || [];

  return (
    <div>
      <h1 style={styles.title}>📊 Analytics Dashboard</h1>

      <div style={styles.statsRow}>
        {[
          { label: 'Total Applications', value: dashStats?.totalApplications, color: '#2980b9' },
          { label: 'Pending Review', value: dashStats?.pendingApplications, color: '#f39c12' },
          { label: 'Active Incidents', value: dashStats?.activeIncidents, color: '#c0392b' },
          { label: 'Certificates Issued', value: dashStats?.certificatesIssued, color: '#27ae60' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
            <p style={styles.statLabel}>{label}</p>
            <p style={{ ...styles.statValue, color }}>{value ?? '—'}</p>
          </div>
        ))}
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Application Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#2980b9" strokeWidth={2} name="Total" />
              <Line type="monotone" dataKey="approved" stroke="#27ae60" strokeWidth={2} name="Approved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Inspection Results</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={styles.noData}>No inspection data yet</p>
          )}
          {incMetrics && (
            <div style={styles.metricsRow}>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Pass Rate</span>
                <span style={{ ...styles.metricValue, color: '#27ae60' }}>{incMetrics.passRate}%</span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Avg Score</span>
                <span style={{ ...styles.metricValue, color: '#2980b9' }}>{incMetrics.avgScore}</span>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Total</span>
                <span style={styles.metricValue}>{incMetrics.total}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  title: { fontSize: '1.6rem', color: '#2c3e50', marginBottom: '24px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  statLabel: { color: '#6c757d', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' },
  statValue: { fontSize: '2rem', fontWeight: '700', margin: 0 },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' },
  chartCard: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  chartTitle: { fontSize: '1rem', color: '#2c3e50', marginBottom: '16px' },
  metricsRow: { display: 'flex', justifyContent: 'space-around', marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' },
  metric: { textAlign: 'center' },
  metricLabel: { display: 'block', fontSize: '0.75rem', color: '#6c757d', textTransform: 'uppercase' },
  metricValue: { display: 'block', fontSize: '1.5rem', fontWeight: '700', color: '#2c3e50', marginTop: '4px' },
  noData: { textAlign: 'center', color: '#aaa', padding: '40px 0' },
  loading: { padding: '40px', textAlign: 'center', color: '#7f8c8d' },
};

export default AnalyticsDashboard;
