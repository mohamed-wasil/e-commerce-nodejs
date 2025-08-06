import jwt from 'jsonwebtoken'
export const generateToken = (
    payload: jwt.JwtPayload,
    secret: jwt.Secret,
    options: jwt.SignOptions
): string => {
    return jwt.sign(payload, secret, options)
}


export const verifyToken = (
    token: string,
    secret: jwt.Secret,
): jwt.JwtPayload => {
    return jwt.verify(token, secret) as jwt.JwtPayload
}