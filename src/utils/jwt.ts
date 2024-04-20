import jwt, { SignOptions } from 'jsonwebtoken';

export const signJwt = (
    payload: Object,
    keyName: 'accessTokenPrivateKey' | 'refreshTokenPrivateKey',
    options: SignOptions
) => {
    const secureKey = keyName === 'accessTokenPrivateKey' ? process.env.JWT_ACCESS_TOKEN_PRIVATE_KEY : process.env.JWT_REFRESH_TOKEN_PRIVATE_KEY
    const privateKey = Buffer.from(secureKey as string, 'base64').toString('ascii')

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
        const secureKey = keyName === 'accessTokenPublicKey' ? process.env.JWT_ACCESS_TOKEN_PUBLIC_KEY : process.env.JWT_REFRESH_TOKEN_PUBLIC_KEY
        const publicKey = Buffer.from(secureKey as string, 'base64').toString('ascii')

        const decoded = jwt.verify(token, publicKey) as T

        return decoded;
    } catch (error) {
        return null
    }
}
