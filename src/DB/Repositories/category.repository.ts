import { ICategory } from "../../Types/Interfaces";
import DatabaseService from "../database.service";
import { CategoryModel } from "../Models";

export class CategoryRepository extends DatabaseService<ICategory > {
    constructor() {
        super(CategoryModel)
    }

    async findOneByName(name: string): Promise<ICategory | null> {
        return this.__model.findOne({ name })
    }
}