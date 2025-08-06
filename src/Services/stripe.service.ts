import Stripe from "stripe";
import { ICheckoutSessionOptions } from "../Types/Interfaces";



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
export const CreateCheckOutSession = async ({
    metadata,
    line_items,
    customer_email,
    discounts
}: Stripe.Checkout.SessionCreateParams): Promise<Stripe.Checkout.Session> => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email,
        mode: "payment",
        metadata,
        line_items,
        discounts,
        success_url: process.env.SUCCESS_URL as string,
        cancel_url: process.env.CANCEL_URL as string,
    });

    return session;
};

export const CreateStripeCoupon = async ({
    amount_off,
    currency,
    percent_off,
    duration = 'once'
}: Stripe.CouponCreateParams) => {

    const data: Stripe.CouponCreateParams = {
        duration
    }
    if (percent_off) {
        data.percent_off = percent_off;
    } else if (amount_off && currency) {
        data.amount_off = amount_off;
        data.currency = currency;
    }
    return await stripe.coupons.create(data)
}
export const RefundPaymentIntent = async (
    payment_intent: string,
    metadata: Record<string, string>,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'expired_uncaptured_charge'
) => {
    return await stripe.refunds.create({
        payment_intent,
        metadata
        // reason
    })
}

