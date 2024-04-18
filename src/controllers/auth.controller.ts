import crypto from 'crypto';
import { CookieOptions, NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { createUser, updateUser } from '../services/user.service';
import Email from '../utils/email';
import { Prisma } from '@prisma/client';

const cookiesOptions: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax'
}

if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true

const accessTokenCookieOptions: CookieOptions = {
    ...cookiesOptions,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}

const refreshTokenCookieOptions: CookieOptions = {
    ...cookiesOptions,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}

export const registerUserHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 12)
        
        const verifyCode = crypto.randomBytes(32).toString('hex')
        const verificationCode = crypto
            .createHash('sha256')
            .update(verifyCode)
            .digest('hex')

        const user = await createUser({
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            password: hashedPassword,
            verificationCode,
        })

        const redirectUrl = `${req.protocol}://${req.get('host')}/verify-email/${verificationCode}`

        try {
            await new Email(user, redirectUrl).sendVerificationCode()
            await updateUser({ id: user.id }, { verificationCode })

            res.status(201).json({
                status: 'success',
                message: 'An email has been sent to your email address. Please verify your email address to continue.'
            })
        } catch (error) {
            await updateUser({ id: user.id }, { verificationCode: null })
            return res.status(500).json({
                status: 'error',
                message: 'Error sending email. Please try again later.'
            })
        }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return res.status(409).json({
                    status: 'error',
                    message: 'Email already exist, please use another email address',
                })
            }
        }
        next(error)
    }
}