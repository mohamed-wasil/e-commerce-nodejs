import { Response } from "express"
import { ProductRepository, WishListRepository } from "../../../DB/Repositories"
import { IAuthRequest } from "../../../Types/Interfaces"
import { Types } from "mongoose"

class WishListService {


    private wishlistRepo = new WishListRepository()
    private productRepo = new ProductRepository()


    addToWishlist = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { productId } = req.body

        if (!productId) return res.status(400).json({ message: "Product ID is required" });
        if (!Types.ObjectId.isValid(productId)) return res.status(400).json({ message: "Invalid productId format" });

        const prodId = new Types.ObjectId(productId as string)

        const product = await this.productRepo.findById(prodId)
        if (!product) return res.status(404).json({ message: "Product not found" })

        const wishlist = await this.wishlistRepo.findOneAndUpdate({
            filters: { userId: _id },
            pushData: {
                products: product._id
            }, options: {
                upsert: true
            }
        })


        res.status(201).json({ message: "Product added to Wishlist successfully" })
    }

    getWishlist = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser

        const wishlist = await this.wishlistRepo.findOne({
            filters: { userId: _id }, populateArray: [{
                path: 'products',
                populate: [{
                    path: "categoryId",
                    select: "name slug image"
                }, {
                    path: "subCategoryId",
                    select: "name slug image"
                }, {
                    path: "brandId",
                    select: "name slug logo"
                }]
            }]
        })
        if (!wishlist) return res.status(200).json({ message: "Wishlist is empty" })

        res.status(200).json({ message: "Wishlist fetched successfully", wishlist })
    }

    deleteProduct = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { productId } = req.params

        const product = await this.productRepo.findById(new Types.ObjectId(productId))
        if (!product) return res.status(404).json({ message: "Product not found" })


        const wishlist = await this.wishlistRepo.findOneAndUpdate({
            filters: {
                userId: _id,
                'products': productId
            }, pullData: {
                products: product._id
            }

        })
        if (!wishlist) return res.status(404).json({ message: "Product Not found in User wishlist" })

        res.status(200).json({ message: "Product deleted from wishlist successfully" })
    }

    clearWishlist = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser

        const wishlist = await this.wishlistRepo.findOneAndDelete({ filters: { userId: _id } })
        if (!wishlist) return res.status(403).json({ message: "Wishlist is already Empty" })

        res.status(403).json({ message: "Wishlist Cleard" })
    }
}

export default new WishListService