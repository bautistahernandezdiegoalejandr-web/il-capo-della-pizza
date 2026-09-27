import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { pool } from '../config/db.js'
import { generarToken, opcionesCookieSesion } from '../utils/token.js'
import { enviarCorreoRecuperacion } from '../utils/email.js'

// POST /api/auth/registro
export async function registrar(req, res, next) {
  try {
    const { nombre, correo, password } = req.body
    if (!nombre || !correo || !password) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })
    }

    const [existentes] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [correo])
    if (existentes.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' })
    }

    // bcrypt con 12 "rounds": suficientemente lento como para dificultar
    // ataques de fuerza bruta, sin volverse molesto para el usuario real.
    const hash = await bcrypt.hash(password, 12)
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, password_hash) VALUES (?, ?, ?)',
      [nombre, correo, hash],
    )

    const usuario = { id: resultado.insertId, nombre, correo, rol: 'cliente' }
    const token = generarToken(usuario)
    res.cookie('token', token, opcionesCookieSesion())
    res.status(201).json({ usuario })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login
export async function iniciarSesion(req, res, next) {
  try {
    const { correo, password } = req.body
    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' })
    }

    const [filas] = await pool.query(
      'SELECT id, nombre, correo, password_hash, rol FROM usuarios WHERE correo = ?',
      [correo],
    )
    const usuarioDb = filas[0]

    // Mismo mensaje de error tanto si el correo no existe como si la
    // contraseña es incorrecta — así no revelamos qué correos están
    // registrados en el sistema.
    if (!usuarioDb) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' })
    }
    const passwordValida = await bcrypt.compare(password, usuarioDb.password_hash)
    if (!passwordValida) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' })
    }

    const usuario = { id: usuarioDb.id, nombre: usuarioDb.nombre, correo: usuarioDb.correo, rol: usuarioDb.rol }
    const token = generarToken(usuario)
    res.cookie('token', token, opcionesCookieSesion())
    res.json({ usuario })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/logout
export async function cerrarSesion(req, res) {
  res.clearCookie('token', opcionesCookieSesion())
  res.json({ ok: true })
}

// GET /api/auth/me  — usado por el frontend al cargar la app para saber si hay sesión activa
export async function obtenerSesionActual(req, res, next) {
  try {
    const [filas] = await pool.query(
      'SELECT id, nombre, correo, rol FROM usuarios WHERE id = ?',
      [req.usuario.id],
    )
    if (!filas[0]) return res.status(401).json({ error: 'Sesión inválida' })
    res.json({ usuario: filas[0] })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/olvide-password
export async function solicitarRecuperacion(req, res, next) {
  try {
    const { correo } = req.body
    const [filas] = await pool.query('SELECT id, nombre FROM usuarios WHERE correo = ?', [correo])
    const usuario = filas[0]

    // Respondemos "ok" siempre exista o no el correo, para no revelar qué
    // correos están registrados (previene enumeración de usuarios).
    if (!usuario) {
      return res.json({ ok: true })
    }

    const tokenPlano = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(tokenPlano).digest('hex')
    const expira = new Date(Date.now() + 30 * 60 * 1000) // 30 minutos

    await pool.query(
      'UPDATE usuarios SET reset_token_hash = ?, reset_token_expira = ? WHERE id = ?',
      [tokenHash, expira, usuario.id],
    )

    const enlace = `${process.env.FRONTEND_URL}/restablecer-password?token=${tokenPlano}&id=${usuario.id}`
    await enviarCorreoRecuperacion(correo, usuario.nombre, enlace)

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/restablecer-password
export async function restablecerPassword(req, res, next) {
  try {
    const { id, token, nuevaPassword } = req.body
    if (!id || !token || !nuevaPassword) {
      return res.status(400).json({ error: 'Falta información para restablecer la contraseña' })
    }
    if (nuevaPassword.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })
    }

    const [filas] = await pool.query(
      'SELECT id, reset_token_hash, reset_token_expira FROM usuarios WHERE id = ?',
      [id],
    )
    const usuario = filas[0]
    if (!usuario || !usuario.reset_token_hash) {
      return res.status(400).json({ error: 'Enlace inválido o ya utilizado' })
    }
    if (new Date(usuario.reset_token_expira) < new Date()) {
      return res.status(400).json({ error: 'El enlace de recuperación venció, solicita uno nuevo' })
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    if (tokenHash !== usuario.reset_token_hash) {
      return res.status(400).json({ error: 'Enlace inválido o ya utilizado' })
    }

    const hash = await bcrypt.hash(nuevaPassword, 12)
    await pool.query(
      'UPDATE usuarios SET password_hash = ?, reset_token_hash = NULL, reset_token_expira = NULL WHERE id = ?',
      [hash, id],
    )

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}
