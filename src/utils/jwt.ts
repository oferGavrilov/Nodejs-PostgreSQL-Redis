import jwt, { SignOptions } from 'jsonwebtoken';

export const signJwt = (
    payload: Object,
    keyName: 'accessTokenPrivateKey' | 'refreshTokenPrivateKey',
    options: SignOptions
) => {
    const privateKey = Buffer.from(process.env[keyName]!, 'base64').toString('ascii');

    return jwt.sign(payload, privateKey, {
        ...(options && options),
        algorithm: 'RS256',
    });
}

export const verifyJwt = <T>(
    token: string,
    keyName: 'accessTokenPublicKey' | 'refreshTokenPublicKey'
) => {
    try {
        const publicKey = Buffer.from(process.env[keyName]!, 'base64').toString('ascii');
        const decoded = jwt.verify(token, publicKey) as T

        return decoded;
    } catch (error) {
        return null
    }    
}