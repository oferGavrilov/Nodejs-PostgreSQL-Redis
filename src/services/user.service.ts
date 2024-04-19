import { PrismaClient, Prisma, User } from "@prisma/client";
import config from "config";
import { omit } from "lodash";
import redisClient from "../utils/connectRedis"
import { signJwt } from "../utils/jwt";

export const excludedFields = [
    "password",
    "verified",
    "verificationCode",
    "passwordResetAt",
    "passwordResetToken",
];

const prisma = new PrismaClient()

export const createUser = async (input: Prisma.UserCreateInput) => {
    return (await prisma.user.create({ data: input })) as User
}

export const findUser = async (
    where: Partial<Prisma.UserWhereInput>,
    select?: Prisma.UserSelect
) => {
    return (await prisma.user.findFirst({ where, select })) as User | null
}

export const findUniqueUser = async (
    where: Prisma.UserWhereUniqueInput,
    select?: Prisma.UserSelect
) => {
    return (await prisma.user.findUnique({ where, select })) as User | null
}

export const updateUser = async (
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
    select?: Prisma.UserSelect
) => {
    return (await prisma.user.update({ where, data, select }));
};

export const signTokens = async (user: Prisma.UserCreateInput) => {
    // create session
    redisClient.set(`${user.id}`, JSON.stringify(omit(user, excludedFields)), {
        EX: parseInt(process.env.redisCacheExpiresIn as string) * 60
    })

    // create access and refresh tokens
    const access_token = signJwt({ sub: user.id }, 'accessTokenPrivateKey', {
        expiresIn: `${process.env.accessTokenExpiresIn}m`
    })

    const refresh_token = signJwt({ sub: user.id }, 'refreshTokenPrivateKey', {
        expiresIn: `${process.env.refreshTokenExpiresIn}m`
    })

    return { access_token, refresh_token }
}