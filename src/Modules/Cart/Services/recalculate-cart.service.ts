import { Types } from "mongoose"
import { CartRepository, ProductRepository } from "../../../DB/Repositories"
import { ICart } from "../../../Types/Interfaces"

const cartRepo = new CartRepository()
const productRepo = new ProductRepository()

const reCalculateCartService = async (cartId: Types.ObjectId): Promise<ICart | undefined> => {

    try {
        const cart = await cartRepo.findById(cartId)
        if (!cart) throw new Error("Cart not found");

        let total = 0

        for (const item of cart.products) {
            const product = await productRepo.findById(item.productId, {
                select: "finalPrice"
            });

            if (!product || typeof product.finalPrice !== 'number') {
                throw new Error(`Invalid or missing price for product ${item.productId}`);
            }

            const quantity = typeof item.quantity === 'number' ? item.quantity : 1;

            item.finalPrice = product.finalPrice * quantity;
            total += item.finalPrice;
        }

        cart.subTotal = total;
        await cart.save();
        return cart;
    } catch (error) {
        console.log("error in reCalculate cart : ",error);

    }
}

export default reCalculateCartService