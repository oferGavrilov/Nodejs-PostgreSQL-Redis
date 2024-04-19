import crypto from 'crypto';
import { CookieOptions, NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { createUser, findUniqueUser, signTokens, updateUser } from '../services/user.service';
import Email from '../utils/email';
import { Prisma } from '@prisma/client';
import { LoginUserInput, VerifyEmailInput } from '../schemas/user.schema';
import ErrorHandler from '../utils/ErrorHandler';

const cookiesOptions: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax'
}

if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true

const accessTokenCookieOptions: CookieOptions = {
    ...cookiesOptions,
    expires: new Date(Date.now() + (parseInt(process.env.accessTokenExpiresIn as string)) * 60 * 1000),
    maxAge: (parseInt(process.env.accessTokenExpiresIn as string)) * 60 * 1000
}

const refreshTokenCookieOptions: CookieOptions = {
    ...cookiesOptions,
    expires: new Date(Date.now() + (parseInt(process.env.refreshTokenExpiresIn as string)) * 60 * 1000),
    maxAge: (parseInt(process.env.refreshTokenExpiresIn as string)) * 60 * 1000
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

        const redirectUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verifyCode}`

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

export const loginUserHandler = async (
    req: Request<LoginUserInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;
        const user = await findUniqueUser(
            { email: email.toLowerCase() },
            { id: true, email: true, verified: true, password: true }
        );

        if (!user) return next(new ErrorHandler(401, 'Invalid email or password'))

        // if user is verified
        if (!user.verified) return next(new ErrorHandler(401, 'Please verify your email address to continue'))

        // compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) return next(new ErrorHandler(401, 'Invalid email or password'))

        // sign tokens
        const { access_token, refresh_token } = signTokens(user);

        res.cookie('access_token', access_token, accessTokenCookieOptions)
        res.cookie('refresh_token', refresh_token, refreshTokenCookieOptions)
        res.cookie('logged_in', true, {
            ...accessTokenCookieOptions,
            httpOnly: false
        })
        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            access_token,
        })
    } catch (error) {
        next(error)
    }
}

export const verifyEmailHandler = async (
    req: Request<VerifyEmailInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const verificationCode = crypto
            .createHash('sha256')
            .update(req.params.verificationCode)
            .digest('hex')

        const user = await updateUser(
            { verificationCode },
            { verified: true, verificationCode: null },
            { email: true }
        );

        if (!user) return next(new ErrorHandler(401, 'Could not verify email. Please try again.'))

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully',
        })

    } catch (error: any) {
        console.log('error', error)
        if (error.code === 'P2025') {
            return res.status(403).json({
                status: 'fail',
                message: "Verification code is invalid or user doesn't exist"
            })
        }

        next(error);
    }
}
