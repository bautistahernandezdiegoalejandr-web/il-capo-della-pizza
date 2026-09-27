import { pool } from '../config/db.js'

// GET /api/direcciones  (requiere sesión)
export async function listarDirecciones(req, res, next) {
  try {
    const [direcciones] = await pool.query(
      'SELECT * FROM direcciones WHERE usuario_id = ? ORDER BY predeterminada DESC, id DESC',
      [req.usuario.id],
    )
    res.json({ direcciones })
  } catch (err) {
    next(err)
  }
}

// POST /api/direcciones
export async function crearDireccion(req, res, next) {
  try {
    const { nombre, direccion, ciudad, codigoPostal, telefono, predeterminada } = req.body
    if (!nombre || !direccion || !ciudad || !telefono) {
      return res.status(400).json({ error: 'Faltan campos obligatorios de la dirección' })
    }
    if (predeterminada) {
      await pool.query('UPDATE direcciones SET predeterminada = FALSE WHERE usuario_id = ?', [req.usuario.id])
    }
    const [resultado] = await pool.query(
      `INSERT INTO direcciones (usuario_id, nombre, direccion, ciudad, codigo_postal, telefono, predeterminada)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.usuario.id, nombre, direccion, ciudad, codigoPostal || null, telefono, !!predeterminada],
    )
    res.status(201).json({ id: resultado.insertId })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/direcciones/:id
export async function eliminarDireccion(req, res, next) {
  try {
    await pool.query('DELETE FROM direcciones WHERE id = ? AND usuario_id = ?', [req.params.id, req.usuario.id])
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}
