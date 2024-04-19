require('dotenv').config()
import express, { NextFunction, Request, Response } from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import morgan from 'morgan'
import validateEnv from './utils/validateEnv'
import { PrismaClient } from '@prisma/client'
import redisClient from './utils/connectRedis'
import ErrorHandler from './utils/ErrorHandler';

import authRouter from './routes/auth.routes'

validateEnv()

const prisma = new PrismaClient() // Prisma client instance
const app = express()

async function bootstrap() {
    // Template engine 
    app.set('view engine', 'pug')
    app.set('views', `${__dirname}/views`)

    // Middleware
    app.use(express.json({ limit: '10kb' }))
    app.use(cookieParser())
    app.use(cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }))

    // Logging
    if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

    // Routes
    app.use('/api/auth', authRouter)

    // Testing
    app.get('/api/healthchecker', async (_, res: Response) => {
        const message = await redisClient.get('try') // to test redis connection
        res.status(200).json({
            status: 'success',
            message
        })
    })

    // UNHANDLED ROUTES
    app.all('*', async (req: Request, res: Response, next: NextFunction) => {
        next(new ErrorHandler(404, `Can't find ${req.originalUrl} on this server!`))
    })

    // ERROR HANDLING
    app.use((err: ErrorHandler, req: Request, res: Response) => {
        err.message = err.message || 'Internal server error'
        res.status(500).json({
            status: 'error',
            message: err.message
        })
    })

    const port = 8000
    app.listen(port, () => console.log(`Server running on port ${port} 🚀`))
}

bootstrap()
    .catch((error) => {
        throw error
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
