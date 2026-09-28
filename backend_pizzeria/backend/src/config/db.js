import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// ca.pem vive en la raíz del backend; este archivo está en src/config/, así que subimos dos niveles
const rutaCertificado = path.join(__dirname, '..', '..', 'ca.pem')

const sslConfig = fs.existsSync(rutaCertificado)
  ? { ca: fs.readFileSync(rutaCertificado) }
  : undefined // en local (MySQL en localhost) normalmente no necesitas SSL

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
})