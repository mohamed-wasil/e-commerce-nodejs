import { ICheckoutSession } from "../../Types/Interfaces";
import DatabaseService from "../database.service";
import { CheckoutSessionModel } from "../Models";

export class CheckoutSessionRepository extends DatabaseService<ICheckoutSession> {
    constructor() {
        super(CheckoutSessionModel)
    }
}