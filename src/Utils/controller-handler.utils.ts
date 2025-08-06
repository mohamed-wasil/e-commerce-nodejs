import { Application, json, Request, Response } from "express";
import * as controllers from '../Modules'
import { errorHandllerGlobalMiddleware } from "../Middlewares";
export const controlerHandler = (app: Application) => {

    app.use(json())
    app.get('/', (req: Request, res: Response) => {
        res.status(200).json({ message: "Welcome in eCommerce app" })
    })
    app.use('/auth', controllers.authController)
    app.use('/category', controllers.categoryController)
    app.use('/brand', controllers.brandController)
    app.use('/product', controllers.productController)
    app.use('/cart', controllers.cartController)
    app.use('/wishlist', controllers.wishlistController)
    app.use('/address', controllers.addressController)
    app.use('/order', controllers.orderController)


    // app.all("*", (req, res) => {
    //     res.status(404).json({ message: "Page Not Found!" });
    // });
    app.use(errorHandllerGlobalMiddleware)


}