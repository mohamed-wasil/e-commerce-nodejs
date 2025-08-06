import { Response } from "express"
import { CartRepository, ProductRepository } from "../../../DB/Repositories"
import { IAuthRequest } from "../../../Types/Interfaces"
import { Types } from "mongoose"
import reCalculateCartService from "./recalculate-cart.service"

class CartService {

    private cartRepo = new CartRepository()
    private productRepo = new ProductRepository()

    addToCart = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { productId } = req.body

        if (!productId) return res.status(400).json({ message: "Product ID is required" });
        if (!Types.ObjectId.isValid(productId)) return res.status(400).json({ message: "Invalid productId format" });

        const prodId = new Types.ObjectId(productId as string)

        const product = await this.productRepo.findById(prodId)
        if (!product) return res.status(404).json({ message: "Product not found" })

        let updatedCart = await this.cartRepo.findOneAndUpdate({
            filters: {
                userId: _id,
                'products.productId': prodId
            },
            incData: {
                'products.$.quantity': 1
            }
        });

        if (!updatedCart) {
            updatedCart = await this.cartRepo.findOneAndUpdate({
                filters: { userId: _id, },
                pushData: {
                    products: {
                        productId: prodId,
                        quantity: 1,
                        pfinalPrice: product.finalPrice
                    }
                }, options: {
                    upsert: true
                }
            })
        }

        await reCalculateCartService(updatedCart?._id as Types.ObjectId)
        res.status(201).json({ message: "Product added to cart successfully" })
    }

    getCart = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser

        const cart = await this.cartRepo.findOne({
            filters: { userId: _id }, populateArray: [{
                path: 'products.productId',
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
        if (!cart) return res.status(200).json({ message: "Cart is empty" })

        res.status(200).json({ message: "Cart fetched successfully", data:cart })
    }

    updateCart = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { productId } = req.params
        const { quantity } = req.body

        const product = await this.productRepo.findById(new Types.ObjectId(productId))
        if (!product) return res.status(404).json({ message: "Product not found" })


        const cart = await this.cartRepo.findOneAndUpdate({
            filters: {
                userId: _id,
                'products.productId': productId
            }, setData: {
                'products.$.quantity': quantity
            },

        })
        if (!cart) return res.status(404).json({ message: "Product Not found in User Cart" })

        await reCalculateCartService(cart?._id)
        res.status(200).json({ message: "Cart updated successfully" })
    }

    deleteProduct = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { productId } = req.params

        const product = await this.productRepo.findById(new Types.ObjectId(productId))
        if (!product) return res.status(404).json({ message: "Product not found" })

        const cart = await this.cartRepo.findOneAndUpdate({
            filters: {
                userId: _id,
            }, pullData: {
                products: {
                    productId
                }
            }
        })
        if (!cart) return res.status(404).json({ message: "Product Not found in User Cart" })

        await reCalculateCartService(cart?._id)
        res.status(200).json({ message: "Product deleted from cart successfully" })
    }

    clearCart = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser

        const cart = await this.cartRepo.findOneAndDelete({ filters: { userId: _id } })
        if (!cart) return res.status(403).json({ message: "Cart is already Empty" })

        res.status(403).json({ message: "Cart Cleard" })
    }

}

export default new CartService