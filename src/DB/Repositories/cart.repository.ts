import { ICart } from "../../Types/Interfaces";
import DatabaseService from "../database.service";
import { CartModel } from "../Models";

export class CartRepository extends DatabaseService<ICart > {
    constructor() {
        super(CartModel)
    }
}