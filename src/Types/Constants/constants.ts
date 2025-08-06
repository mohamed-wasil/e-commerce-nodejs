import Joi from "joi";

export const ObjectIdValidator = Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
        "string.pattern.base": "Invalid ObjectId format.",
        "any.required": "{#label} is required.",
    });