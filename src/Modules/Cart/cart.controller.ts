import { Router } from "express"
import { authenticationMiddleware, errorHandllerMiddleware } from "../../Middlewares"
import cartService from "./Services/cart.service"

export const cartController = Router()

cartController.post('/add-to-cart',
    authenticationMiddleware(),
    errorHandllerMiddleware(cartService.addToCart)
)
cartController.get('/get-cart',
    authenticationMiddleware(),
    errorHandllerMiddleware(cartService.getCart)
)
cartController.patch('/update-cart/:productId',
    authenticationMiddleware(),
    errorHandllerMiddleware(cartService.updateCart)
)
cartController.patch('/delete-product/:productId',
    authenticationMiddleware(),
    errorHandllerMiddleware(cartService.deleteProduct)
)
cartController.delete('/clear-cart',
    authenticationMiddleware(),
    errorHandllerMiddleware(cartService.clearCart)
)