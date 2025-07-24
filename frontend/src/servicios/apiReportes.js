export const generarReporte = async (filtros) => {
    const respuesta = await fetch('http://localhost:5000/api/reportes/generar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(filtros)
    });
    
    if (!respuesta.ok) throw new Error('Error en la generación');
    return await respuesta.blob();
  };