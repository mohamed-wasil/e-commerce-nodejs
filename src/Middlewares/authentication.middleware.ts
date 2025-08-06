import { NextFunction, Request, Response } from "express"
import { errorHandllerMiddleware } from "./error-handling.middleware"
import { verifyToken } from "../Utils"
import { UserRepository, RevokedTokenRepository } from "../DB/Repositories"
import { IAuthRequest } from "../Types/Interfaces"

export const authenticationMiddleware = () => {
    const userRepository = new UserRepository()
    const revokedTokenRepository = new RevokedTokenRepository()
    return errorHandllerMiddleware(async (req: IAuthRequest, res: Response, next: NextFunction) => {

        const { token } = req.headers

        if (!token) return res.status(401).json({ message: "Unauthorized ,Token is requierd" })


        const decodedData = verifyToken(token as string, process.env.JWT_SECRET_LOGIN as string)

        const isRevokedToken = await revokedTokenRepository.findByTokenId(decodedData.jti as string)
        if (isRevokedToken) return res.status(401).json({ message: "Token is expierd ,please signup" })

        const user = await userRepository.findById(decodedData._id)
        if (!user) return res.status(401).json({ message: "Please signup" })

        req.authUser = user
        next()
    })

}