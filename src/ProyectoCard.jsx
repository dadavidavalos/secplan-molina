function ProyectoCard({ nombre, fondo, estado, avance }) {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
      <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
        {fondo}
      </span>
      <h3 style={{ margin: '8px 0 4px' }}>{nombre}</h3>
      <p style={{ color: '#64748b', margin: '0 0 12px' }}>{estado}</p>
      <div style={{ background: '#e2e8f0', borderRadius: '99px', height: '8px' }}>
        <div style={{ background: '#3b82f6', width: avance + '%', height: '8px', borderRadius: '99px' }}></div>
      </div>
      <p style={{ textAlign: 'right', fontSize: '12px', margin: '4px 0 0' }}>{avance}%</p>
    </div>
  )
}

export default ProyectoCard