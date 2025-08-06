import { Request } from "express";
import { IUser } from "./model.interface";
import Stripe from "stripe";

export interface IError {
    message: string;
    status?: number;
    cause?: number;
    stack?: string
}

export interface IAuthRequest extends Request {
    authUser: IUser
}

export interface ISendMailoptions {
    from?: string;
    to: string;
    subject: string;
    html: string;
    cc?: string;
}

export interface IUploadFiles {
    profilePic?: Express.Multer.File[];
    coverPic?: Express.Multer.File[];
    image?: Express.Multer.File[]
}

export interface ICheckoutSessionOptions {
    metadata?: Stripe.MetadataParam;
    line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
    customer_email?: string,
    discounts?: Stripe.Checkout.SessionCreateParams.Discount[];
}

