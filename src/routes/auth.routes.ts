import express from 'express'
import { validate } from '../middleware/validate'
import { registerUserSchema, verifyEmailSchema } from '../schemas/user.schema'
import { registerUserHandler, verifyEmailHandler } from '../controllers/auth.controller'

const router = express.Router()

router.post('/register', validate(registerUserSchema), registerUserHandler)

router.get(
    '/verify-email/:verificationCode',
    validate(verifyEmailSchema),
    verifyEmailHandler
)

export default router;