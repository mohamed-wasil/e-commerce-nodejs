import Joi from "joi";
import { ObjectIdValidator } from "../Types/Constants";

export const cretaeCategorySchema = {
    body: Joi.object({
        name: Joi.string().required()
    })
}

export const updateCategorySchema = {
    body: Joi.object({
        name: Joi.string().required()
    }),
    params: Joi.object({
        categoryId: ObjectIdValidator
    })
}

export const getCategorySchema = {
    params: Joi.object({
        categoryId: ObjectIdValidator
    })
}

export const updateSubCategorySchema = {
    body: Joi.object({
        name: Joi.string().required()
    }),
    params: Joi.object({
        categoryId: ObjectIdValidator
    })
}

export const getSubCategorySchema = {
    params: Joi.object({
        categoryId: ObjectIdValidator
    })
}