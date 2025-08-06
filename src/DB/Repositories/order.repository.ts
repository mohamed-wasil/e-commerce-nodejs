import { IOrder } from "../../Types/Interfaces";
import DatabaseService from "../database.service";
import { OrderModel } from "../Models";

export class OrderRepository extends DatabaseService<IOrder> {
    constructor() {
        super(OrderModel)
    }
}