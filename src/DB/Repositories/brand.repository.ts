import { IBrand } from "../../Types/Interfaces";
import DatabaseService from "../database.service";
import { BrandModel } from "../Models";

export class BrandRepository extends DatabaseService<IBrand> {
    constructor() {
        super(BrandModel)
    }

    async findOneByName(name: string): Promise<IBrand | null> {
        return this.__model.findOne({ name })
    }

}