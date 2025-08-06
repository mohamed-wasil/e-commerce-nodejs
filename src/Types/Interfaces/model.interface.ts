import { Document, Types } from "mongoose"
import { CouponDurationEnum, GenderEnum, OrderStatusEnum, OtpEnum, PaymentMethodsEnum, PaymentStatusEnum, ProviderEnum, RolesEnum } from "../Enums/enums.type"


interface IBaseModel extends Document {
    _id: Types.ObjectId
    createdAt: Date;
    updatedAt: Date
}
export interface IUser extends IBaseModel {

    name: string
    email: string;
    password: string;
    provider: ProviderEnum
    gender: GenderEnum
    DOB: Date
    mobileNumber: string;
    role: RolesEnum;
    isVerified: boolean;
    deletedAt: Date;
    isDeleted: boolean;
    profilePic: {
        public_id: string;
        secure_url: string
    };
    coverPic: {
        public_id: string;
        secure_url: string
    };
    mediaCloudFolder: string;
    OTP: {
        code: string;
        type: OtpEnum;
        expiresIn: Date;
    }[];
}

export interface IRevokedToken extends IBaseModel {
    tokenId: string;
    expierdAt: string | number;

}

export interface ICategory extends IBaseModel {
    name: string;
    slug: string;
    image: {
        public_id: string;
        secure_url: string
    };
    addedBy: Types.ObjectId;
    isDeleted: boolean;
    folderName: string;
    isSubCategory: boolean;
    updatedBy: Types.ObjectId;
    deletedAt: Date;
}

export interface ISubCategory extends IBaseModel {
    name: string;
    slug: string;
    image: {
        public_id: string;
        secure_url: string
    };
    folderName: string;
    addedBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
    isDeleted: boolean;
    categoryId: Types.ObjectId;
    deletedAt: Date
}

export interface IBrand extends IBaseModel {
    name: string;
    slug: string;
    logo: {
        public_id: string;
        secure_url: string
    };
    folderName: string;
    brandOwner: Types.ObjectId;
    updatedBy: Types.ObjectId;
    isDeleted: boolean;
    deletedAt: Date
}
export interface IProduct extends IBaseModel {
    name: string;
    description: string;
    slug: string;
    images: {
        public_id: string;
        secure_url: string
    }[];
    folderName: string;
    basePrice: number;
    discount: number;
    finalPrice: number;
    stock: number;
    overAllRating: number;
    addedBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
    brandId: Types.ObjectId;
    categoryId: Types.ObjectId;
    subCategoryId: Types.ObjectId
    isDeleted: boolean;
    deletedAt: Date

}
export interface IDecimentProducts {
    productId: IProduct | Types.ObjectId;
    quantity: number
    _id?: Types.ObjectId
    finalPrice: number
}
export interface ICart extends IBaseModel {
    userId: Types.ObjectId
    products: {
        productId: Types.ObjectId,
        quantity: number,
        finalPrice: number
    }[],
    subTotal: number;

}

export interface IWishlist extends IBaseModel {
    userId: Types.ObjectId;
    products: Types.ObjectId[];

}

export interface IAddress extends IBaseModel {
    userId: Types.ObjectId;
    phone: string;
    country: string;
    city: string;
    street: string;
    postalCode?: string;
    buildingNumber?: string;
    isDefault: boolean;
    label?: string;
}

// export interface IOrder extends IBaseModel {
//     userId: Types.ObjectId;
//     cartId: Types.ObjectId;
//     addressId: Types.ObjectId;
//     totalPrice: number;
//     // paymentStatus: OrderStatusEnum;
//     // paymentMethod: PaymentMethodsEnum;
//     // orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
//     sessionId?: string; // Stripe session ID
//     createdAt: Date;
//     updatedAt: Date;
// }

export interface IOrder extends IBaseModel {
    userId: Types.ObjectId;
    cartId: Types.ObjectId;
    products: {
        productId: Types.ObjectId,
        quantity: number,
        finalPrice: number
    }[];
    addressId: Types.ObjectId;
    totalPrice: number;
    paymentStatus: PaymentStatusEnum;
    paymentMethod: PaymentMethodsEnum;
    orderStatus: OrderStatusEnum;
    sessionId?: string;
    orderChanges: {
        paidAt: Date,
        deliverdAt: Date,
        refunAt: Date,
        cancelledAt: Date
    },
    arrivesAt: void,
    coupon: string
}


export interface ICoupon extends IBaseModel {
    couponId: string,
    amount_off: number | string,
    currency: string,
    duration: CouponDurationEnum,
    percent_off: number,
}

export enum PaymentStatus {
    paid = 'paid',
    unpaid = 'unpaid',
    failed = 'failed',
}

export interface ICheckoutSession extends IBaseModel {
    sessionId: string;
    payment_intent?: string;
    customer_email?: string;
    amount_subtotal?: number;
    amount_total?: number;
    currency?: string;
    paymentStatus?: PaymentStatus;
    orderId?: Types.ObjectId;
    discounts: string[]

}