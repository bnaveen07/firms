import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { useGetIncidentsQuery } from '../../../features/incidents/incidentsApi';
import useSocket from '../../../hooks/useSocket';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const SEVERITY_COLORS = {
  critical: '#c0392b',
  high: '#e67e22',
  medium: '#f39c12',
  low: '#27ae60',
};

const createIcon = (severity) =>
  L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${SEVERITY_COLORS[severity] || '#888'};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

const IncidentMap = () => {
  const { data, refetch } = useGetIncidentsQuery({ limit: 100, status: 'active' });
  const [incidents, setIncidents] = useState([]);
  const { on, off } = useSocket();

  useEffect(() => {
    if (data?.incidents) setIncidents(data.incidents);
  }, [data]);

  useEffect(() => {
    const handleNew = (incident) => {
      setIncidents((prev) => [incident, ...prev]);
    };
    const handleUpdate = (incident) => {
      setIncidents((prev) => prev.map((i) => (i._id === incident._id ? incident : i)));
    };
    on('incident:new', handleNew);
    on('incident:updated', handleUpdate);
    return () => {
      off('incident:new', handleNew);
      off('incident:updated', handleUpdate);
    };
  }, [on, off]);

  const defaultCenter = [20.5937, 78.9629];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={5}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {incidents.map((incident) => {
        const { lat, lng } = incident.location?.coordinates || {};
        if (!lat || !lng) return null;
        return (
          <React.Fragment key={incident._id}>
            <Marker position={[lat, lng]} icon={createIcon(incident.severity)}>
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <strong style={{ color: '#c0392b' }}>{incident.title}</strong>
                  <p style={{ margin: '4px 0', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: '600' }}>Severity:</span>{' '}
                    <span style={{ color: SEVERITY_COLORS[incident.severity], fontWeight: '700' }}>
                      {incident.severity?.toUpperCase()}
                    </span>
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: '600' }}>Status:</span> {incident.status}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: '600' }}>Type:</span> {incident.type}
                  </p>
                  {incident.location?.city && (
                    <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#6c757d' }}>
                      📍 {incident.location.city}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[lat, lng]}
              radius={
                incident.severity === 'critical' ? 8000 :
                incident.severity === 'high' ? 5000 :
                incident.severity === 'medium' ? 3000 : 1500
              }
              color={SEVERITY_COLORS[incident.severity] || '#888'}
              fillColor={SEVERITY_COLORS[incident.severity] || '#888'}
              fillOpacity={0.08}
              weight={1}
            />
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
};

export default IncidentMap;
