import mongoose, { Document } from "mongoose";
import { IProduct } from "../../Types/Interfaces";
import slugify from "slugify";

const productSchema = new mongoose.Schema<IProduct >({
    name: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        default: function () {
            return slugify(this.name, { trim: true, lower: true, strict: true })
        }
    },
    basePrice: {
        type: Number,
        required: true
    },
    discount: Number,
    finalPrice: {
        type: Number,
        default: function () {
            return this.basePrice - (this.basePrice * ((this.discount || 0) / 100))
        }
    },
    stock: {
        type: Number,
        required: true,
        min: 1
    },
    overAllRating: {
        type: Number,
        default: 0
    },

    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
    },
    images: [{
        public_id: String,
        secure_url: String
    }],
    folderName: String,
    isDeleted: {
        type: Boolean,
        default: false
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    deletedAt: Date
}, { timestamps: true })

productSchema.pre('save', function (next) {
    if (this.name || !this.slug) {
        this.slug = slugify(this.name, { lower: true, trim: true, strict: true })
    }
    next()
})

export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema)