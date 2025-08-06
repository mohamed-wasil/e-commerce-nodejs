import mongoose from "mongoose";
import { OrderStatusEnum, PaymentMethodsEnum, PaymentStatusEnum } from "../../Types/Enums/enums.type";
import { IOrder } from "../../Types/Interfaces";

const orderSchema = new mongoose.Schema<IOrder>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
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
    totalPrice: Number,

    coupon: String,
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    paymentMethod: {
        type: String,
        enum: Object.values(PaymentMethodsEnum),
        required: true
    },
    paymentStatus: {
        type: String,
        enum: Object.values(PaymentStatusEnum),
    },
    orderStatus: {
        type: String,
        enum: Object.values(OrderStatusEnum),
        default: OrderStatusEnum.PENDING
    },
    arrivesAt: {
        type: Date,
        default: () => { Date.now() + 7 * 24 * 60 * 60 * 1000 }
    },
    orderChanges: {
        paidAt: Date,
        deliverdAt: Date,
        refunAt: Date,
        cancelledAt: Date
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CheckoutSession',
    },

}, { timestamps: true })


export const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema)