import { Request, Response } from "express"
import { BrandRepository, UserRepository } from "../../../DB/Repositories"
import { IAuthRequest, IUploadFiles } from "../../../Types/Interfaces"
import { IBrandDto } from "../../../Types/DTO"
import { v4 as uuidV4 } from "uuid"
import { cloudinaryConfig } from "../../../Configs"
import { Types } from "mongoose"

class BrandService {

    private brandRepo = new BrandRepository()

    create = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { name }: IBrandDto = req.body
        const { file } = req

        const isBrandExist = await this.brandRepo.findOneByName(name)
        if (isBrandExist) return res.status(403).json({ message: "Brand name is already exist" })

        const folderName = uuidV4()
        const brand = await this.brandRepo.create({ name, brandOwner: _id, folderName })

        if (file) {
            const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Brands/${folderName}`
            const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(file.path, { folder: baseFolder })
            brand.logo = { secure_url, public_id }
            await brand.save()
        }

        res.status(201).json({ message: "Brand created successfully" })
    }

    update = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { name }: IBrandDto = req.body
        const { brandId } = req.params
        const { file } = req

        const brand = await this.brandRepo.findById(new Types.ObjectId(brandId))
        if (!brand) return res.status(403).json({ message: "Brand is not found" })

        if (name) brand.name = name

        if (file) {
            const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Brands/${brand.folderName}`
            const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(file.path, { folder: baseFolder })
            brand.logo = { secure_url, public_id }
        }
        brand.updatedBy = _id
        await brand.save()
        res.status(200).json({ message: "Brand updated successfully" })
    }

    getBrand = async (req: Request, res: Response) => {
        const { brandId } = req.params

        const brand = await this.brandRepo.findById(new Types.ObjectId(brandId), {
            populateArray: [{
                path: 'brandOwner',
                select: 'name profilePic'
            }]
        })
        if (!brand) return res.status(403).json({ message: "Brand is not found" })

        return res.status(200).json({ message: "Brand fetched successfully", data:brand })
    }
    listBrands = async (req: Request, res: Response) => {

        const brands = await this.brandRepo.find({
            populateArray: [{
                path: 'brandOwner',
                select: 'name profilePic'
            }]
        })
        if (!brands.length) return res.status(403).json({ message: "Not brands yet" })

        return res.status(200).json({ message: "Brands fetched successfully", data:brands })
    }

    delete = async (req: IAuthRequest, res: Response) => {
        const { brandId: _id } = req.params

        const brand = await this.brandRepo.findById(new Types.ObjectId(_id))
        if (!brand) return res.status(403).json({ message: "Brand is not found" })

        // await this.brandRepo.findOneAndDelete({ filters: { _id } })
        await this.brandRepo.findOneAndUpdate({
            filters: { _id: new Types.ObjectId(_id) }, setData: {
                deletedAt: new Date(),
                isDeleted: true
            }
        })
        res.status(200).json({ message: "Brand deleted successfully" })
    }
}

export default new BrandService