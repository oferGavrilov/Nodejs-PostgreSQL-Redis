import express from 'express'
import { validate } from '../middleware/validate'
import { loginUserSchema, registerUserSchema, verifyEmailSchema } from '../schemas/user.schema'
import { loginUserHandler, registerUserHandler, verifyEmailHandler } from '../controllers/auth.controller'

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

export default router;