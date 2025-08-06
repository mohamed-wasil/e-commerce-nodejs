import { Router } from "express";
import { authenticationMiddleware, errorHandllerMiddleware } from "../../Middlewares";
import wishlistService from "./Services/wishlist.service";

export const wishlistController = Router()

wishlistController.post('/add-to-wishlist',
    authenticationMiddleware(),
    errorHandllerMiddleware(wishlistService.addToWishlist)
)

wishlistController.get('/get-wishlist',
    authenticationMiddleware(),
    errorHandllerMiddleware(wishlistService.getWishlist)
)

wishlistController.patch('/delete-product/:productId',
    authenticationMiddleware(),
    errorHandllerMiddleware(wishlistService.deleteProduct)
)

wishlistController.delete('/clear-cart',
    authenticationMiddleware(),
    errorHandllerMiddleware(wishlistService.clearWishlist)
)