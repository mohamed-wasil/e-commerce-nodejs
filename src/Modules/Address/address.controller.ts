import { Router } from "express";
import addressService from "./Services/address.service";
import { authenticationMiddleware, errorHandllerMiddleware } from "../../Middlewares";


export const addressController = Router()

addressController.post('/create',
    authenticationMiddleware(),
    errorHandllerMiddleware(addressService.create)
)
addressController.put('/update/:addressId',
    authenticationMiddleware(),
    errorHandllerMiddleware(addressService.update)
)
addressController.get('/get-address',
    authenticationMiddleware(),
    errorHandllerMiddleware(addressService.listAdress)
)
addressController.delete('/delete-address/:addressId',
    authenticationMiddleware(),
    errorHandllerMiddleware(addressService.delete)
)
