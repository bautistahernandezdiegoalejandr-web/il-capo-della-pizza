import { pool } from '../config/db.js'

// GET /api/productos  (público — reemplaza el menuData.js hardcodeado del frontend)
export async function listarProductos(req, res, next) {
  try {
    const { categoria } = req.query
    let sql = 'SELECT * FROM productos WHERE disponible = TRUE'
    const params = []
    if (categoria) {
      sql += ' AND categoria = ?'
      params.push(categoria)
    }
    sql += ' ORDER BY nombre ASC'
    const [productos] = await pool.query(sql, params)
    res.json({ productos })
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/productos  (incluye no disponibles / sin stock, para el panel)
export async function listarProductosAdmin(req, res, next) {
  try {
    const [productos] = await pool.query('SELECT * FROM productos ORDER BY categoria, nombre ASC')
    res.json({ productos })
  } catch (err) {
    next(err)
  }
}

// POST /api/admin/productos
export async function crearProducto(req, res, next) {
  try {
    const { slug, nombre, descripcion, precio, imagen_url, categoria, stock } = req.body
    if (!slug || !nombre || !precio || !categoria) {
      return res.status(400).json({ error: 'slug, nombre, precio y categoría son obligatorios' })
    }
    const [resultado] = await pool.query(
      `INSERT INTO productos (slug, nombre, descripcion, precio, imagen_url, categoria, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [slug, nombre, descripcion || null, precio, imagen_url || null, categoria, stock ?? 100],
    )
    res.status(201).json({ id: resultado.insertId })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un producto con ese slug' })
    }
    next(err)
  }
}

// PUT /api/admin/productos/:id
export async function actualizarProducto(req, res, next) {
  try {
    const { id } = req.params
    const { nombre, descripcion, precio, imagen_url, categoria, disponible, stock } = req.body
    await pool.query(
      `UPDATE productos SET
         nombre = COALESCE(?, nombre),
         descripcion = COALESCE(?, descripcion),
         precio = COALESCE(?, precio),
         imagen_url = COALESCE(?, imagen_url),
         categoria = COALESCE(?, categoria),
         disponible = COALESCE(?, disponible),
         stock = COALESCE(?, stock)
       WHERE id = ?`,
      [nombre, descripcion, precio, imagen_url, categoria, disponible, stock, id],
    )
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/admin/productos/:id
export async function eliminarProducto(req, res, next) {
  try {
    await pool.query('DELETE FROM productos WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}
