import mongoose from "mongoose";
import { ICoupon } from "../../Types/Interfaces";
import { CouponDurationEnum } from "../../Types/Enums/enums.type";

const couponSchema = new mongoose.Schema<ICoupon>({
    couponId: {
        type: String,
        required: true
    },
    amount_off: Number,
    currency: String,
    duration: {
        type: String,
        enum: Object.values(CouponDurationEnum),
        default: CouponDurationEnum.ONCE
    },
}, { timestamps: true })


export const CouponModel = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', couponSchema)