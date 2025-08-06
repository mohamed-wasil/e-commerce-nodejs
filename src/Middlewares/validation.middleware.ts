import { NextFunction, Request, Response } from "express"
import { errorHandllerMiddleware } from "./error-handling.middleware"
import { ObjectSchema } from "joi"

export const validationMiddleware = (schema: Record<string, ObjectSchema>) => {
    return errorHandllerMiddleware(async (req: Request, res: Response, next: NextFunction) => {
        const schemaKeys = Object.keys(schema)

        const validationErrors: { key: string, errors: string[] }[] = []
        for (const key of schemaKeys) {
            const { error } = schema[key].validate(req[key as keyof Request], { abortEarly: false })

            if (error) {
                validationErrors.push({
                    key,
                    errors: error.details.map(det => det.message)
                })
            }
        }

        if (validationErrors.length) {
            return res.status(400).json({
                message: "Validation error",
                errors: validationErrors
            })
        }
        next()
    })
}



