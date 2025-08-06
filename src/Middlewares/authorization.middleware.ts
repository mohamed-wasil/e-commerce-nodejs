import { NextFunction, Response } from "express"
import { IAuthRequest } from "../Types/Interfaces"
import { errorHandllerMiddleware } from "./error-handling.middleware"

export const authorizationMiddleware = () => {
    return errorHandllerMiddleware((req: IAuthRequest, res: Response, next: NextFunction) => {
        const { role } = req.authUser
        
        if (!role || role != 'admin') return res.status(403).json({ message: "Unauthorized" })
        next()
    })
}