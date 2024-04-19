import jwt, { SignOptions } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { Prisma } from '@prisma/client';
import { omit } from 'lodash';
import redisClient from './connectRedis';
import { excludedFields } from '../services/user.service';

export const signJwt = (
    payload: Object,
    keyName: 'accessTokenPrivateKey' | 'refreshTokenPrivateKey',
    options: SignOptions
) => {
    const filePath = path.join(__dirname, '/../../jwt-keys', `${keyName}.pem`)
    if (!fs.existsSync(filePath)) {
        throw new Error(`${keyName} file is missing`);
    }
    const privateKey = fs.readFileSync(filePath, 'utf8')


    return jwt.sign(payload, privateKey, {
        ...options,
        algorithm: 'RS256',
    });
}

export const verifyJwt = <T>(
    token: string,
    keyName: 'accessTokenPublicKey' | 'refreshTokenPublicKey'
) => {
    try {
        const filePath = path.join(__dirname, '/../../jwt-keys', `${keyName}.pem`)

        if (!fs.existsSync(filePath)) {
            throw new Error(`${keyName} file is missing`);
        }

        const publicKey = fs.readFileSync(filePath, 'utf8')

        if (!publicKey) {
            throw new Error('Public key is missing');
        }

        const decoded = jwt.verify(token, publicKey) as T

        return decoded;
    } catch (error) {
        return null
    }
}
