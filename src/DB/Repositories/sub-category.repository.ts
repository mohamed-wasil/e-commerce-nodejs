import { ISubCategory } from "../../Types/Interfaces";
import DatabaseService from "../database.service";
import { SubCategoryModel } from "../Models";

export class SubCategoryRepository extends DatabaseService<ISubCategory> {
    constructor() {
        super(SubCategoryModel)
    }

    async findOneByName(name: string): Promise<ISubCategory | null> {
        return this.__model.findOne({ name })
    }
}