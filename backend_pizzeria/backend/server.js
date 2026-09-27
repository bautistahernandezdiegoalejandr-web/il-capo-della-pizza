import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rutas from './src/routes/index.js'
import { manejadorErrores } from './src/middleware/errorHandler.js'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // debe coincidir exactamente con la URL del frontend
    credentials: true, // permite que el navegador envíe/reciba la cookie httpOnly de sesión
  }),
)

app.get('/api/salud', (req, res) => res.json({ ok: true, mensaje: 'API de Il Capo della Pizza funcionando' }))

app.use('/api', rutas)

app.use(manejadorErrores)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`🍕 API corriendo en http://localhost:${PORT}`)
})
