import { Types } from "mongoose";
import { OrderStatusEnum, PaymentMethodsEnum, PaymentStatusEnum } from "../Enums/enums.type";

export interface ICreateOrderDto {
    userId: Types.ObjectId;
    cartId: Types.ObjectId
    addressId: Types.ObjectId;
    totalPrice: number;
    paymentStatus: PaymentStatusEnum;
    paymentMethod: PaymentMethodsEnum;
    orderStatus: OrderStatusEnum;
    sessionId?: string;
    coupon?: string
}