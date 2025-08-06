import mongoose from "mongoose";
import { IWishlist } from "../../Types/Interfaces";

const wishListSchema = new mongoose.Schema<IWishlist>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        index: true,
        unique: true
    }]
}, { timestamps: true })

export const WishListModel = mongoose.models.WishList || mongoose.model<IWishlist>("WishList", wishListSchema)