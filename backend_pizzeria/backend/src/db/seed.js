// Carga datos iniciales en la base de datos: el menú (antes hardcodeado en
// el frontend) y un usuario administrador de ejemplo para poder entrar al
// panel de administración por primera vez.
//
// Uso:  npm run seed

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { pool } from '../config/db.js'

const PRODUCTOS = [
  {
    slug: 'margherita-tradizionale',
    nombre: 'Margherita Tradizionale',
    descripcion: 'Salsa de tomate, mozzarella fresca, albahaca',
    precio: 32000,
    imagen_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80',
    categoria: 'clasicas',
  },
  {
    slug: 'pepperoni-classico',
    nombre: 'Pepperoni Classico',
    descripcion: 'Salsa de tomate, mozzarella, pepperoni picante',
    precio: 36000,
    imagen_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80',
    categoria: 'clasicas',
  },
  {
    slug: 'quattro-formaggi',
    nombre: 'Quattro Formaggi',
    descripcion: 'Mozzarella, gorgonzola, parmesano, provolone',
    precio: 40000,
    imagen_url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=500&q=80',
    categoria: 'clasicas',
  },
  {
    slug: 'prosciutto-e-funghi',
    nombre: 'Prosciutto e Funghi',
    descripcion: 'Salsa de tomate, mozzarella, jamón, champiñones',
    precio: 38000,
    imagen_url: 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?auto=format&fit=crop&w=500&q=80',
    categoria: 'clasicas',
  },
  {
    slug: 'la-capo',
    nombre: 'La Capo',
    descripcion: 'Prosciutto crudo, rúcula, lascas de parmesano',
    precio: 48000,
    imagen_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=80',
    categoria: 'especiales',
  },
  {
    slug: 'diavola-intensa',
    nombre: 'Diavola Intensa',
    descripcion: 'Salami picante, guindillas, aceitunas negras',
    precio: 42000,
    imagen_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=500&q=80',
    categoria: 'especiales',
  },
  {
    slug: 'verdure-grigliate',
    nombre: 'Verdure Grigliate',
    descripcion: 'Calabacín, berenjena, pimientos, cebolla roja',
    precio: 37000,
    imagen_url: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=500&q=80',
    categoria: 'vegetarianas',
  },
  {
    slug: 'orto-verde',
    nombre: 'Orto Verde',
    descripcion: 'Queso vegano de almendras, espinaca, champiñones',
    precio: 38000,
    imagen_url: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=500&q=80',
    categoria: 'veganas',
  },
]

async function seed() {
  const conn = await pool.getConnection()
  try {
    console.log('Insertando productos del menú...')
    for (const p of PRODUCTOS) {
      await conn.query(
        `INSERT INTO productos (slug, nombre, descripcion, precio, imagen_url, categoria)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           nombre = VALUES(nombre), descripcion = VALUES(descripcion),
           precio = VALUES(precio), imagen_url = VALUES(imagen_url), categoria = VALUES(categoria)`,
        [p.slug, p.nombre, p.descripcion, p.precio, p.imagen_url, p.categoria],
      )
    }

    console.log('Creando usuario administrador de ejemplo...')
    const correoAdmin = 'admin@ilcapodellapizza.com.co'
    const passwordAdmin = 'CambiaEstaClave123!'
    const hash = await bcrypt.hash(passwordAdmin, 12)
    await conn.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, rol)
       VALUES (?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)`,
      ['Administrador Capo', correoAdmin, hash],
    )

    console.log('\n✅ Seed completado.')
    console.log(`   Usuario admin: ${correoAdmin}`)
    console.log(`   Contraseña:    ${passwordAdmin}  (cámbiala después de tu primer inicio de sesión)`)
  } finally {
    conn.release()
    await pool.end()
  }
}

seed().catch((err) => {
  console.error('Error al ejecutar el seed:', err)
  process.exit(1)
})
