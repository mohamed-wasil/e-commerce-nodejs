import { Types } from "mongoose";
import { IDecimentProducts, IProduct } from "../../Types/Interfaces";
import DatabaseService from "../database.service";
import { ProductModel } from "../Models";

export class ProductRepository extends DatabaseService<IProduct> {
    constructor() {
        super(ProductModel)
    }

    async findOneByName(name: string): Promise<IProduct | null> {
        return this.__model.findOne({ name })
    }
    async findOneBySlug(slug: string): Promise<IProduct | null> {
        return this.__model.findOne({ slug })
    }

    async decrimentProducts(products: IDecimentProducts[]) {
        await Promise.all(products.map(product => {
            // const prod: IProduct = product.productId as IProduct
            return this.__model.findByIdAndUpdate(
                product.productId._id,
                { $inc: { stock: -product.quantity } }
            );
        }));
    }
    async incrementProducts(products: IDecimentProducts[]) {
        await Promise.all(products.map(product => {
            // const prod: IProduct = product.productId as IProduct
            return this.__model.findByIdAndUpdate(
                product.productId._id,
                { $inc: { stock: product.quantity } }
            );
        }));
    }
    
}

