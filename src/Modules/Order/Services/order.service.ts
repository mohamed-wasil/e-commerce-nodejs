import { Response } from "express"
import { AddressRepository, CartRepository, CheckoutSessionRepository, CouponRepository, OrderRepository, ProductRepository } from "../../../DB/Repositories"
import { IAuthRequest, ICart, IDecimentProducts, IProduct, PaymentStatus } from "../../../Types/Interfaces"
import { ICreateOrderDto } from "../../../Types/DTO"
import { Types } from "mongoose"
import { OrderStatusEnum, PaymentMethodsEnum, PaymentStatusEnum } from "../../../Types/Enums/enums.type"
import { CreateCheckOutSession, CreateStripeCoupon, RefundPaymentIntent } from "../../../Services"

class OrderService {

    private orderRepo = new OrderRepository()
    private cartRepo = new CartRepository()
    private addressRepo = new AddressRepository()
    private couponRepo = new CouponRepository()
    private checkoutSessionRepo = new CheckoutSessionRepository()
    private productRepo = new ProductRepository()

    create = async (req: IAuthRequest, res: Response) => {
        const { _id, email: userEmail } = req.authUser
        const { addressId, cartId, paymentMethod, coupon, sessionId }: ICreateOrderDto = req.body

        const cart = await this.cartRepo.findById(new Types.ObjectId(cartId))
        if (!cart) return res.status(404).json({ message: "Cart not found" })

        const address = await this.addressRepo.findById(new Types.ObjectId(addressId))
        if (!address) return res.status(404).json({ message: "Address not found" })

        const order = await this.orderRepo.create({
            userId: _id,
            cartId: cart._id,
            products: cart.products,
            addressId: address._id,
            paymentMethod,
            totalPrice: cart.subTotal
        })
        if (coupon) {
            const isCouponExist = await this.couponRepo.findByCouponId(coupon)
            if (isCouponExist) {
                order.coupon = coupon
            }
        }
        if (paymentMethod == 'cash') order.orderStatus = OrderStatusEnum.PLACED
        if (paymentMethod == 'credit_card') order.orderStatus = OrderStatusEnum.PENDING
        await order.save()

        if (paymentMethod == PaymentMethodsEnum.CASH) {
            await this.cartRepo.deleteOne({ filters: { _id: cartId } })
        }
        res.status(201).json({ message: "Order created successfully" })
    }

    listOrders = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser

        const orders = await this.orderRepo.find({
            filters: { userId: _id }, populateArray: [{
                path: 'addressId',
            }, {
                path: 'sessionId'
            }]
        })
        res.status(200).json({ message: "Order Fitched successfully" , data :orders})
    }

    paymentWithStripe = async (req: IAuthRequest, res: Response) => {
        const { _id, email } = req.authUser
        const { orderId } = req.params

        const order = await this.orderRepo.findOne({
            filters: {
                _id: new Types.ObjectId(orderId),
                userId: _id,
                orderStatus: OrderStatusEnum.PENDING
            },
            populateArray: [{
                path: 'cartId',
                select: "products subTotal",
                populate: [{
                    path: 'products.productId',
                    select: "name finalPrice images"
                }]
            }]
        })
        const cart = order?.cartId as any;
        if (!order || !cart.products) return res.status(404).json({ message: "Order not found" })

        const line_items = cart.products.map((product: any) => {

            const images = Array.isArray(product.productId.images)
                ? product.productId.images.map((img: any) => img.secure_url)
                : [];
            return {
                quantity: product.quantity,
                price_data: {
                    currency: 'EGP',
                    product_data: {
                        name: product.productId.name,
                        images
                    },
                    unit_amount: product.productId.finalPrice * 100
                }
            }
        })

        const discounts = order.coupon ? [{ coupon: order.coupon }] : [];
        const checkout = await CreateCheckOutSession({
            customer_email: email,
            metadata: {
                orderId: order._id.toString(),
            },
            line_items,
            discounts
        });

        return res.status(200).json({ message: "Data fetshed successfully", checkout: checkout.url })

    }

    webhook = async (req: IAuthRequest, res: Response) => {
        const { object } = req.body.data

        const { orderId } = object.metadata
        const { id, payment_intent, payment_status, currency, amount_subtotal, amount_total, discounts, customer_email } = object

        const session = await this.checkoutSessionRepo.create({
            orderId,
            sessionId: id,
            payment_intent,
            paymentStatus: payment_status as PaymentStatus,
            currency,
            amount_subtotal,
            amount_total,
            discounts,
            customer_email
        })

        const order = await this.orderRepo.findOneAndUpdate({
            filters: {
                _id: orderId
            },
            setData: {
                orderChanges: {
                    paidAt: Date.now()
                },
                paymentStatus: PaymentStatusEnum.PAID,
                orderStatus: OrderStatusEnum.PLACED,
                sessionId: session._id
            }
        })


        this.productRepo.decrimentProducts(order?.products as IDecimentProducts[]);
        await this.cartRepo.deleteOne({ filters: { _id: order?.cartId } })

        res.status(201).json({ message: "Session cretaes successfully", session })
        // res.status(201).json({ message: "Session cretaes successfully", order })

    }

    cancelOrder = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser;
        const { orderId } = req.params;

        const order = await this.orderRepo.findOne({
            filters: {
                _id: orderId,
                userId: _id,
                orderStatus: { $in: [OrderStatusEnum.PENDING, OrderStatusEnum.PLACED, OrderStatusEnum.SHIPPED] }
            }
        })
        if (!order) return res.status(404).json({ message: "Order not found" });

        const timeDiff = new Date().getTime() - order.createdAt.getTime()
        const diffInDays = timeDiff / (1000 * 60 * 60 * 24)
        if (diffInDays > 3) return res.status(400).json({ message: "You can only cancel orders within 24 hours of placing them." });

        order.orderStatus = OrderStatusEnum.CANCELLD
        order.orderChanges.cancelledAt = new Date()

        if (order.paymentMethod == PaymentMethodsEnum.CREDIT_CARD) {
            const checkoutSession = await this.checkoutSessionRepo.findById(new Types.ObjectId(order.sessionId))
            if (!checkoutSession) return res.status(404).json({ message: "Checkout session not found" });

            const refounded = await RefundPaymentIntent(checkoutSession.payment_intent as string, { orderId })

            if (refounded.status == 'succeeded') {
                order.orderStatus = OrderStatusEnum.REFUNDET
                order.orderChanges.refunAt = new Date()

                this.productRepo.incrementProducts(order.products)
            }
        }

        await order.save()
        res.status(200).json({ message: "Order Cancelled" })
    }

}

export default new OrderService