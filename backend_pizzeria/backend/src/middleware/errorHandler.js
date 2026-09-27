export function manejadorErrores(err, req, res, _next) {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({
    error: status === 500 ? 'Ocurrió un error inesperado en el servidor' : err.message,
  })
}
