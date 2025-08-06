import { ICoupon } from "../../Types/Interfaces";
import DatabaseService from "../database.service";
import { CouponModel } from "../Models";

export class CouponRepository extends DatabaseService<ICoupon> {
    constructor() {
        super(CouponModel)
    }

    async findByCouponId(couponId: string) {
        return await this.__model.findOne({ couponId })
    }
}