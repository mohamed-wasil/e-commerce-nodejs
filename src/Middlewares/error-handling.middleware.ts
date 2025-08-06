import { NextFunction, Request, Response } from "express";
import { IError } from "../Types/Interfaces";

export const errorHandllerMiddleware = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
export const errorHandllerGlobalMiddleware = (err: IError, req: Request, res: Response, next: NextFunction) => {
    const errorStatus = err.status || err.cause || 500
    
    res.status(errorStatus).json({
        message: 'something went wrong',
        error: err.message
    })
}