import { IAddress } from "../../Types/Interfaces";
import DatabaseService from "../database.service";
import { AddressModel } from "../Models";

export class AddressRepository extends DatabaseService<IAddress> {
    constructor() {
        super(AddressModel)
    }
}