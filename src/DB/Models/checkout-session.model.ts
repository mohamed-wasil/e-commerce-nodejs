import mongoose from "mongoose";
import { ICheckoutSession, PaymentStatus } from "../../Types/Interfaces";

const CheckoutSessionSchema = new mongoose.Schema<ICheckoutSession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    payment_intent: {
      type: String,
    },
    customer_email:String,
    amount_subtotal: {
      type: Number,
    },
    amount_total: {
      type: Number,
    },
    currency: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.unpaid,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    discounts:{
        type:[{String}]
    }
  },
  { timestamps: true }
);

export const CheckoutSessionModel  = mongoose.models.CheckoutSession ||mongoose.model<ICheckoutSession>("CheckoutSession", CheckoutSessionSchema);