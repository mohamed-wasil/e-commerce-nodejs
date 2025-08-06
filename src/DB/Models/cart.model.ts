import mongoose, { Document } from "mongoose";
import { ICart } from "../../Types/Interfaces";
import { ProductRepository } from "../Repositories";

const cartSchema = new mongoose.Schema<ICart>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        },
        finalPrice: Number
    }],
    subTotal: Number
}, { timestamps: true })





export const CartModel = mongoose.models.Cart || mongoose.model<ICart>('Cart', cartSchema)