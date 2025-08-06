import { Router } from "express";
import orderService from "./Services/order.service";
import { authenticationMiddleware, errorHandllerMiddleware } from "../../Middlewares";
import couponService from "./Services/coupon.service";


export const orderController = Router()

orderController.post('/create',
    authenticationMiddleware(),
    errorHandllerMiddleware(orderService.create)
)
orderController.get('/list-orders',
    authenticationMiddleware(),
    errorHandllerMiddleware(orderService.listOrders)
)
orderController.post('/payment-with-stripe/:orderId',
    authenticationMiddleware(),
    errorHandllerMiddleware(orderService.paymentWithStripe)
)
orderController.post('/payment-with-stripe/:orderId',
    authenticationMiddleware(),
    errorHandllerMiddleware(orderService.paymentWithStripe)
)

orderController.post('/create-coupon',
    authenticationMiddleware(),
    errorHandllerMiddleware(couponService.createCoupon)
)
orderController.post('/webhook',
    // authenticationMiddleware(),
    errorHandllerMiddleware(orderService.webhook)
)
orderController.put('/cancel/:orderId',
    authenticationMiddleware(),
    errorHandllerMiddleware(orderService.cancelOrder)
)