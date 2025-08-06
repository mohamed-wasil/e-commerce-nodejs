import mongoose, { Document } from "mongoose";
import slugify from 'slugify';
import { ICategory } from "../../Types/Interfaces";
import { SubCategoryRepository } from "../Repositories";
import { cloudinaryConfig } from "../../Configs";

const categorySchema = new mongoose.Schema<ICategory>({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    slug: String,
    // slug: {
    //     type: String,
    //     default: function () {
    //         return slugify(this.name, { trim: true, lower: true, strict: true })
    //     }
    // },
    image: {
        public_id: String,
        secure_url: String
    },
    folderName: String,
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    isDeleted: Boolean,
    isSubCategory: {
        type: Boolean,
        index: true
    },
        deletedAt: Date

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

categorySchema.pre('save', function (next) {
    if (this.name || !this.slug) {
        this.slug = slugify(this.name, { lower: true, trim: true, strict: true })
    }
    next()
})
categorySchema.post('findOneAndDelete', async function (doc, next) {
    const subCategoryRepo = new SubCategoryRepository()
    try {
        await subCategoryRepo.deleteMany({ filters: { categoryId: doc?._id } })
        if (doc?.image) {
            await cloudinaryConfig().api.delete_resources_by_prefix(`${process.env.CLOUDINARY_FOLDER}/Categories/${doc?.folderName}`)
                .then(async () => { await cloudinaryConfig().api.delete_folder(`${process.env.CLOUDINARY_FOLDER}/Categories/${doc?.folderName}`) })
        }
        next()
    } catch (error) {
        console.log("Error in post hook in category : ", error);
    }
})

categorySchema.virtual('SubCategory', {
    localField: "_id",
    ref: 'SubCategory',
    foreignField: "categoryId"
})

export const CategoryModel = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema)
