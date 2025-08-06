import Joi from "joi";
import { GenderEnum, ProviderEnum, RolesEnum } from "../Types/Enums/enums.type";

export const signUpSchema = {
    body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        provider: Joi.string().valid(...Object.values(ProviderEnum)),
        gender: Joi.string().valid(...Object.values(GenderEnum)).required(),
        DOB: Joi.date().required(),
        mobileNumber: Joi.string().required(),
        role: Joi.string().valid(...Object.values(RolesEnum)),
        password: Joi.string().required(),
        cPassword: Joi.string().valid(Joi.ref('password')).required()
    })
}
export const confirmOtpSchema = {
    body: Joi.object({

        email: Joi.string().email().required(),
        otp: Joi.string().required()
    })
}
export const SigninSchema = {
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
}
export const resetPasswordSchema = {
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        cPassword: Joi.string().valid(Joi.ref('password')).required(),
        otp: Joi.string().required()
    })
}
export const IUpdatePasswordSchema = {
    body: Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required(),
        cNewPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
    })
}


export const updateProfileSchema = {
    body: Joi.object({
        name: Joi.string(),
        email: Joi.string(),
        DOB: Joi.date(),
        gender: Joi.string().valid(...Object.values(GenderEnum)),
        mobileNumber: Joi.string()
    })
}
