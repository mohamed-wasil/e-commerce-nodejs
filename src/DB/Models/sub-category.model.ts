import mongoose, { Document } from "mongoose";
import slugify from 'slugify';
import { ISubCategory } from "../../Types/Interfaces";
import { cloudinaryConfig } from "../../Configs";

const subCategorySchema = new mongoose.Schema<ISubCategory & Document>({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    slug: String,
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
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    deletedAt: Date
}, {
    timestamps: true
})

subCategorySchema.pre('validate', function (next) {
    if (this.name || !this.slug) {
        this.slug = slugify(this.name, { lower: true, trim: true, strict: true })
    }
    next()
})

let deletedSubCategories: ISubCategory[] = []

subCategorySchema.pre('deleteMany', async function (next) {
    try {
        const docs = await this.model.find(this.getQuery())
        deletedSubCategories = docs
        next()
    } catch (error) {
        console.log('error in subCategory Pre hook deleteMany :', error);
    }
})
subCategorySchema.post('deleteMany', async function () {
    try {

        for (const doc of deletedSubCategories) {
            const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Sub_Categories/${doc?.folderName}`

            await cloudinaryConfig().api.delete_resources_by_prefix(baseFolder)
                .then(async () => { await cloudinaryConfig().api.delete_folder(baseFolder) })
        }

        deletedSubCategories = [];
    } catch (error) {
        console.log('Error in subCategory post deleteMany hook:', error);
    }
})
subCategorySchema.post('findOneAndDelete', async function (doc) {
    try {

        if (doc?.image) {
            const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Sub_Categories/${doc?.folderName}`

            await cloudinaryConfig().api.delete_resources_by_prefix(baseFolder)
                .then(async () => { await cloudinaryConfig().api.delete_folder(baseFolder) })
        }
    } catch (error) {
        console.log('Error in subCategory post findOneAndDelete hook:', error);
    }
})


export const SubCategoryModel = mongoose.models.SubCategory || mongoose.model<ISubCategory & Document>('SubCategory', subCategorySchema)
