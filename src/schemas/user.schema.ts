import { object, string, TypeOf, z } from 'zod'

enum RoleEnumType {
    ADMIN = 'admin',
    USER = 'user',
}

export const registerUserSchema = object({
    body: object({
        name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
        email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email' }).max(50, 'Email must be at most 50 characters'),
        password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters').max(50, 'Password must be at most 50 characters'),
        passwordConfirm: z.string({ required_error: 'Password confirm is required' }).min(6, 'Password confirm must be at least 6 characters').max(50, 'Password confirm must be at most 50 characters'),
        role: z.string().min(2).max(50).refine((data) => {
            if (data !== RoleEnumType.ADMIN && data !== RoleEnumType.USER) {
                throw new Error('Invalid role')
            }
            return true
        }),
    }).refine((data) => data.password === data.passwordConfirm, {
        path: ['passwordConfirm'],
        message: 'Passwords do not match',
    }),
})

export const loginUserSchema = object({
    body: object({
        email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email' }).max(50, 'Email must be at most 50 characters'),
        password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters').max(50, 'Password must be at most 50 characters'),
    })
})

export type RegisterUserInput = Omit<TypeOf<typeof registerUserSchema>['body'], 'passwordConfirm'>;
export type LoginUserInput = TypeOf<typeof loginUserSchema>['body'];
