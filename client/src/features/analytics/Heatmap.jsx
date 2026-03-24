import React from 'react';
import { useGetIncidentsQuery } from '../incidents/incidentsApi';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Heatmap = () => {
  const { data } = useGetIncidentsQuery({ limit: 200 });
  const incidents = data?.incidents || [];

  return (
    <div>
      <h1 style={styles.title}>🗺️ Incident Heatmap</h1>
      <div style={styles.mapContainer}>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
      <p style={styles.note}>
        Showing {incidents.length} incidents on map. Install leaflet.heat for heatmap visualization.
      </p>
    </div>
  );
};

const styles = {
  title: { fontSize: '1.6rem', color: '#2c3e50', marginBottom: '20px' },
  mapContainer: { height: '500px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  note: { marginTop: '12px', color: '#7f8c8d', fontSize: '0.875rem' },
};

export default Heatmap;
