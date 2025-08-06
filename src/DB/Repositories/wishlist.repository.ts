import { IWishlist } from "../../Types/Interfaces";
import DatabaseService from "../database.service";
import { WishListModel } from "../Models";

export class WishListRepository extends DatabaseService<IWishlist> {
    constructor() {
        super(WishListModel)
    }
}