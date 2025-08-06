import { Request, Response } from "express";
import { BrandRepository, CategoryRepository, ProductRepository, SubCategoryRepository } from "../../../DB/Repositories";
import { IAuthRequest } from "../../../Types/Interfaces";
import { ICreateProductDto } from "../../../Types/DTO";
import { Types } from "mongoose";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { cloudinaryConfig, redisClient } from "../../../Configs";
import corn from 'node-cron'
class ProductService {
    private productRepo = new ProductRepository()
    private categoryRepo = new CategoryRepository()
    private subCategoryRepo = new SubCategoryRepository()
    private brandRepo = new BrandRepository()

    create = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { name, description, basePrice, discount, stock, categoryName, subCategoryName, brandName }: ICreateProductDto = req.body
        const files = req.files as Express.Multer.File[];

        // return res.json(files.length?true :false )

        const isExistProduct = await this.productRepo.findOneBySlug(slugify(name, { lower: true, trim: true, strict: true }))
        if (isExistProduct) return res.status(403).json({ message: "Product Name is already exist" })

        const category = await this.categoryRepo.findOneByName(categoryName)
        if (!category) return res.status(403).json({ message: "Category not found" })

        let subCategory
        if (subCategoryName) {
            subCategory = await this.subCategoryRepo.findOneByName(subCategoryName)
            if (!subCategory) return res.status(403).json({ message: "Sub-Category not found" })
        }
        let brand
        if (brandName) {
            brand = await this.brandRepo.findOneByName(brandName)
            if (!brand) return res.status(403).json({ message: "Brand not found" })
        }
        const folderName = uuidv4()

        const product = await this.productRepo.create({
            name,
            description,
            basePrice: +basePrice,
            discount: +discount,
            stock: +stock,
            addedBy: _id,
            categoryId: category?._id,
            brandId: brand?._id,
            subCategoryId: subCategory?._id,
            folderName
        })


        if (files?.length) {

            const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Products/${folderName}`
            // const filesLength = files.length
            for (const file of files) {
                const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(file.path, { folder: baseFolder })
                product.images.push({ public_id, secure_url })
            }
            await product.save()
        }

        res.status(201).json({ message: "Product created successfully" })


    }

    update = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { productId } = req.params
        const { name, description, basePrice, discount, stock, categoryName, subCategoryName, brandName }: ICreateProductDto = req.body
        const files = req.files as Express.Multer.File[]

        const product = await this.productRepo.findById(new Types.ObjectId(productId))
        if (!product) return res.status(400).json({ message: "Product not found" })

        if (name) product.name = name
        if (description) product.description = description
        if (basePrice) product.basePrice = +basePrice
        if (discount) product.discount = +discount
        if (stock) product.stock = +stock
        if (categoryName) {
            const category = await this.categoryRepo.findOneByName(categoryName)
            if (!category) return res.status(400).json({ message: "Category not found" })
            product.categoryId = category._id
        }

        if (subCategoryName) {
            const subCategory = await this.subCategoryRepo.findOneByName(subCategoryName)
            if (!subCategory) return res.status(400).json({ message: "Sub-Category not found" })
            product.subCategoryId = subCategory._id
        }


        if (brandName) {
            const brand = await this.brandRepo.findOneByName(brandName)
            if (!brand) return res.status(400).json({ message: "Brand not found" })
            product.brandId = brand._id
        }

        if (files?.length) {
            const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Products/${product.folderName}`
            for (const file of files) {
                const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(file.path, { folder: baseFolder })
                product.images.push({ public_id, secure_url })
            }
            await product.save()
        }

        product.updatedBy = _id
        await product.save()
        res.status(200).json({ message: "Product updated successfully" })
    }

    getProduct = async (req: Request, res: Response) => {
        const { productId: _id } = req.params

        const product = await this.productRepo.findById(new Types.ObjectId(_id), {
            populateArray: [{
                path: "categoryId",
                select: "name slug image"
            }, {
                path: "subCategoryId",
                select: "name slug image"
            }, {
                path: "brandId",
                select: "name slug logo"
            }]
        })
        if (!product) return res.status(400).json({ message: "Product not found" })

        res.status(200).json({ message: "Product fetched successfully", product })
    }

    listProducts = async (req: Request, res: Response) => {
        const CACHE_EXPIRY = 60 * 60
        const cacheKey = 'products:all'

        const cached = await redisClient.get(cacheKey)
        if (cached) {
            const products = typeof cached === 'string' ? JSON.parse(cached) : cached;

            return res.status(200).json({
                message: "Products fetched successfully",
                data:products
            });
        }

        const products = await this.productRepo.find({
            populateArray: [{
                path: "categoryId",
                select: "name slug image"
            }, {
                path: "subCategoryId",
                select: "name slug image"
            }, {
                path: "brandId",
                select: "name slug logo"
            }]
        })
        if (!products.length) return res.status(400).json({ message: "Not Products Yet" })

        // await redisClient.setEx(cacheKey, CACHE_EXPIRY, JSON.stringify(products))
        await redisClient.set(cacheKey, products, { ex: CACHE_EXPIRY });

        res.status(200).json({ message: "Products fetched successfully", products })
    }

    delete = async (req: Request, res: Response) => {
        const { productId } = req.params

        const _id = new Types.ObjectId(productId)

        const product = await this.productRepo.findById(_id)
        if (!product) return res.status(400).json({ message: "Product not found" })

        await this.productRepo.findOneAndUpdate({
            filters: { _id: new Types.ObjectId(_id) }, setData: {
                deletedAt: new Date(),
                isDeleted: true
            }
        })
        res.status(200).json({ message: "Product deleted successfully" })
    }

}

export default new ProductService