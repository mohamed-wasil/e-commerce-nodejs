import { Request, Response } from "express"
import { IAuthRequest } from "../../../Types/Interfaces"
import { CategoryRepository, SubCategoryRepository } from "../../../DB/Repositories"
import mongoose, { Types } from "mongoose"
import { v4 as uuidv4 } from "uuid"
import { cloudinaryConfig } from "../../../Configs"

class SubCategoryService {

    private subCategoryRepo = new SubCategoryRepository()
    private categoryRepo = new CategoryRepository()

    create = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { categoryId } = req.params
        const { name } = req.body
        const { file } = req

        // const catId = new Types.ObjectId(categoryId)
        // return res.json({ catId })
        const catId = new Types.ObjectId(categoryId)
        const category = await this.categoryRepo.findById(catId)
        if (!category) return res.status(400).json({ message: "Category not found" })

        const isExist = await this.subCategoryRepo.findOneByName(name)
        if (isExist) return res.status(400).json({ message: "Sub-Category name is already exist" })


        const folderName = uuidv4()
        const subCategory = await this.subCategoryRepo.create({
            name,
            folderName,
            addedBy: _id,
            categoryId: catId
        })
        if (file) {
            const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Sub_Categories/${folderName}`
            const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(file.path, { folder: baseFolder })
            subCategory.image = {
                secure_url,
                public_id
            }
            await subCategory.save()
        }
        res.status(201).json({ message: "Sub-Category cretaed successfully" })
    }

    update = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { name } = req.body
        const { file } = req
        const { subCategoryId } = req.params


        const subCatId = new Types.ObjectId(subCategoryId)
        const subCategory = await this.subCategoryRepo.findById(subCatId)
        if (!subCategory) return res.status(400).json({ message: "Sub-Category not found" })

        if (name) subCategory.name = name
        if (file) {
            const category = await this.categoryRepo.findById(subCategory.categoryId)
            if (!category) return res.status(400).json({ message: "Category not found" })

            const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Sub_Categories/${subCategory.folderName}`
            const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(file.path, { folder: baseFolder })
            subCategory.image = {
                public_id,
                secure_url
            }
        }
        subCategory.updatedBy = _id

        await subCategory.save()
        res.status(200).json({ message: "Sub-Category updated successfully" })
    }

    getSpacificSubCategory = async (req: Request, res: Response) => {
        const { subCategoryId: _id } = req.params

        const subCategory = await this.subCategoryRepo.findById(new Types.ObjectId(_id), {
            populateArray: [
                {
                    path: 'categoryId',
                    select: 'name slug image'
                }
            ]
        })
        if (!subCategory) return res.status(400).json({ message: "Sub-Category not found" })

        res.status(200).json({ message: "Sub-Category fetched successfully", data: subCategory })
    }

    listSubCategories = async (req: Request, res: Response) => {

        const subCategories = await this.subCategoryRepo.find({
            populateArray: [
                {
                    path: 'categoryId',
                    select: 'name slug image'
                }
            ]
        })
        if (!subCategories) return res.status(400).json({ message: "No Sub-Category Yet" })

        res.status(200).json({ message: "Sub-Categories fetched successfully", subCategories })
    }

    deleteSubCategory = async (req: IAuthRequest, res: Response) => {
        const { subCategoryId: _id } = req.params

        const subcategory = await this.subCategoryRepo.findById(new Types.ObjectId(_id))
        if (!subcategory) return res.status(400).json({ message: "SUb-Category not found" })

        await this.subCategoryRepo.findOneAndUpdate({
            filters: { _id: new Types.ObjectId(_id) }, setData: {
                deletedAt: new Date(),
                isDeleted: true
            }
        })
        res.status(200).json({ message: "Category deleted successfully" })
    }


}
export default new SubCategoryService