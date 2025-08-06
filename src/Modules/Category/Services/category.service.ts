import { Request, Response } from 'express';
import { CategoryRepository, UserRepository } from "../../../DB/Repositories";
import { IAuthRequest } from "../../../Types/Interfaces";
import { cloudinaryConfig } from '../../../Configs';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
class CategoryService {
    private categoryRepo = new CategoryRepository()
    private userRepo = new UserRepository()

    createCategory = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { name } = req.body
        const { file } = req
        const { role } = req.authUser

        // return res.json({role})
        if (role != 'admin') return res.status(403).json({ message: "Unauthorized" })

        const user = await this.userRepo.findById(_id)
        if (!user) return res.status(400).json({ message: "User not found" })

        const isCategoryExist = await this.categoryRepo.findOneByName(name)
        if (isCategoryExist) return res.status(400).json({ message: "Category name is already exist" })
        const folderName = uuidv4()
        const category = await this.categoryRepo.create({
            name,
            addedBy: _id,
            folderName
        })
        if (file) {
            const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Categories/${folderName}`
            const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(file.path, { folder: baseFolder })
            category.image = {
                public_id,
                secure_url
            }
            await category.save()
        }
        res.status(201).json({ message: "Category created successfullly" })
    }

    updateCategory = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { name } = req.body
        const { file } = req
        const { categoryId } = req.params

        const catId = new Types.ObjectId(categoryId)
        const category = await this.categoryRepo.findById(catId)
        if (!category) return res.status(400).json({ message: "Category not found" })

        if (name) category.name = name
        if (file) {
            const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Categories/${category.folderName}`
            const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(file.path, { folder: baseFolder })
            category.image = {
                public_id,
                secure_url
            }
        }
        category.updatedBy = _id
        await category.save()
        res.status(200).json({ message: "Category updated successfully" })
    }

    getSpacificCategory = async (req: Request, res: Response) => {
        const { categoryId } = req.params

        const catId = new Types.ObjectId(categoryId)
        const category = await this.categoryRepo.findById(catId, { populateArray: [{ path: 'SubCategory', select: 'name slug' }] })
        if (!category) return res.status(400).json({ message: "Category not found" })

        res.status(200).json({ message: "Data fetched successfully", data:category })
    }

    listCategory = async (req: Request, res: Response) => {


        const categories = await this.categoryRepo.find({ populateArray: [{ path: 'SubCategory', select: 'name slug' }] })
        if (!categories) return res.status(400).json({ message: "Category not found" })

        res.status(200).json({ message: "Data fetched successfully", categories })
    }

    deleteCategory = async (req: IAuthRequest, res: Response) => {
        const { categoryId: _id } = req.params

        const category = await this.categoryRepo.findById(new Types.ObjectId(_id))
        // const category = await this.categoryRepo.findOneAndDelete({ filters: { _id: new Types.ObjectId(_id) } })
        if (!category) return res.status(400).json({ message: "Category not found" })

        await this.categoryRepo.findOneAndUpdate( {
             filters: { _id: new Types.ObjectId(_id) }, setData: {
                deletedAt: new Date(),
                isDeleted: true
            }
        })
        res.status(200).json({ message: "Category deleted successfully" })
    }
}
export default new CategoryService