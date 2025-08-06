import mongoose, { Document } from "mongoose";
import slugify from "slugify";
import { IBrand } from "../../Types/Interfaces";
import { cloudinaryConfig } from "../../Configs";
import { ProductRepository } from "../Repositories";

const brandSchema = new mongoose.Schema<IBrand>({

    name: {
        type: String,
        index: true,
        unique: true,
        required: true
    },
    slug: String,
    logo: {
        public_id: String,
        secure_url: String
    },
    folderName: String,
    brandOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    isDeleted: Boolean,
    deletedAt: Date
}, {
    timestamps: true
})

brandSchema.pre('validate', function () {
    if (this.name || !this.slug) {
        this.slug = slugify(this.name, { lower: true, trim: true, strict: true })
    }
})

brandSchema.post('findOneAndDelete', async function (doc) {
    try {
        if (doc?.logo) {
            const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Brands/${doc?.folderName}`
            await cloudinaryConfig().api.delete_resources_by_prefix(baseFolder)
                .then(async () => { await cloudinaryConfig().api.delete_folder(baseFolder) })
        }

        const productRepo = new ProductRepository()
        await productRepo.updateMany({ filters: {}, unsetFields: ['brandId'] })

    } catch (error) {
        console.log("error in brand post findOneAndDel;ete hook :", error);

    }
})

export const BrandModel = mongoose.models.Brand || mongoose.model<IBrand>('Brand', brandSchema)