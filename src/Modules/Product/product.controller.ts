import { Router } from "express";
import { authenticationMiddleware, authorizationMiddleware, errorHandllerMiddleware, multerMiddleware } from "../../Middlewares";
import productService from "./services/product.service";
import { ImageExtensions } from "../../Types/Enums/enums.type";

export const productController = Router()

productController.post('/create',
    authenticationMiddleware(),
    authorizationMiddleware(),
    multerMiddleware([ImageExtensions.PNG, ImageExtensions.JPEG, ImageExtensions.JPG]).array('image'),
    errorHandllerMiddleware(productService.create)
)

productController.put('/update/:productId',
    authenticationMiddleware(),
    authorizationMiddleware(),
    multerMiddleware([ImageExtensions.PNG, ImageExtensions.JPEG, ImageExtensions.JPG]).array('image'),
    errorHandllerMiddleware(productService.update)
)

productController.get('/get-product/:productId',
    authenticationMiddleware(),
    errorHandllerMiddleware(productService.getProduct)
)
productController.get('/list-products',
    authenticationMiddleware(),
    errorHandllerMiddleware(productService.listProducts)
)
productController.delete('/delete/:productId',
    authenticationMiddleware(),
    authorizationMiddleware(),
    errorHandllerMiddleware(productService.delete)
)