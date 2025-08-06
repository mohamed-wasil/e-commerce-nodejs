import { Router } from "express";
import { authenticationMiddleware, authorizationMiddleware, errorHandllerMiddleware, multerMiddleware } from "../../Middlewares";
import brandService from "./Services/brand.service";
import { ImageExtensions } from "../../Types/Enums/enums.type";

export const brandController = Router()

brandController.post('/create',
    authenticationMiddleware(),
    authorizationMiddleware(),
    multerMiddleware([ImageExtensions.PNG, ImageExtensions.JPEG, ImageExtensions.JPG]).single('logo'),
    errorHandllerMiddleware(brandService.create)
)

brandController.patch('/update/:brandId',
    authenticationMiddleware(),
    authorizationMiddleware(),
    multerMiddleware([ImageExtensions.PNG, ImageExtensions.JPEG, ImageExtensions.JPG]).single('logo'),
    errorHandllerMiddleware(brandService.update)
)
brandController.get('/get-brand/:brandId',
    authenticationMiddleware(),
    errorHandllerMiddleware(brandService.getBrand)
)
brandController.get('/list-brands',
    authenticationMiddleware(),
    errorHandllerMiddleware(brandService.listBrands)
)
brandController.delete('/delete/:brandId',
    authenticationMiddleware(),
    authorizationMiddleware(),
    errorHandllerMiddleware(brandService.delete)
)