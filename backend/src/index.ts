import 'dotenv/config'
import express from "express"
import { createServer } from 'node:http'
import cors from "cors"
import connectDB from './config/db.js'
import authRoutes from './routes/auth.routes.js'

const app = express()
const httpServer = createServer(app)

const PORT = process.env.PORT || 5000 ; 

// middleware 

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', 
    credentials: true 
}))

// parse incoming JSON request bodies into req.body 

app.use(express.json())

// routes 

app.get(`/api/health`, (req, res) => {
    res.json({
        success: true , 
        message: 'Bookleaf API is running'
    })
})

app.use('/api/auth', authRoutes)

// start 

const start = async (): Promise<void> => {
    await connectDB() ; 
    httpServer.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`)
    })
}

start() ; 