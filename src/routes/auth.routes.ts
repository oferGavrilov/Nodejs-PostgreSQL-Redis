import express from 'express'
import { validate } from '../middleware/validate'
import { loginUserSchema, registerUserSchema, verifyEmailSchema } from '../schemas/user.schema'
import { loginUserHandler, logoutUserHandler, registerUserHandler, verifyEmailHandler } from '../controllers/auth.controller'
import { deserializeUser } from '../middleware/deserializeUser'
import { requireUser } from '../middleware/requireUser'

const router = express.Router()

router.post(
    '/register',
    validate(registerUserSchema),
    registerUserHandler
)

router.post(
    '/login',
    validate(loginUserSchema),
    loginUserHandler
)
router.get(
    '/verify-email/:verificationCode',
    validate(verifyEmailSchema),
    verifyEmailHandler
)

router.get(
    '/logout',
    deserializeUser,
    requireUser,
    logoutUserHandler
)

export default router;