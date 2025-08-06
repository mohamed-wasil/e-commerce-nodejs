import { Response } from "express"
import { CreateStripeCoupon } from "../../../Services"
import { IAuthRequest } from "../../../Types/Interfaces"
import { CouponRepository } from "../../../DB/Repositories"
import { CouponDurationEnum } from "../../../Types/Enums/enums.type"

class CouponService {

    private couponRepo = new CouponRepository()

    createCoupon = async (req: IAuthRequest, res: Response) => {
        const { percent_off, currency, amount_off, duration } = req.body


        let coupon
        if (percent_off) {
            coupon = await CreateStripeCoupon({
                percent_off,
                duration
            })
        }
        else if (amount_off && currency) {
            coupon = await CreateStripeCoupon({
                amount_off,
                currency,
                duration
            })
        } else {
            return res.status(400).json({ message: "Faild to create coupon please check your data" })
        }

        const storedCoupon = await this.couponRepo.create({
            couponId: coupon.id,
            amount_off: coupon.amount_off ?? undefined,
            duration: coupon.duration as CouponDurationEnum,
            currency: coupon.currency ?? undefined
        });
        res.status(201).json({ message: "Coupon created succewssfully", coupon: storedCoupon })
    }

}

export default new CouponService