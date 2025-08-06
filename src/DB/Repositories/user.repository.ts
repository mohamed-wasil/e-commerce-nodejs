
import { IUser } from "../../Types/Interfaces";
import DatabaseService from "../database.service";
import { UserModel } from "../Models";

export class UserRepository extends DatabaseService<IUser> {
    constructor() {
        super(UserModel)
    }


    async findOneByEmail(email: string, select?: string): Promise<IUser | null> {
        return await this.__model.findOne({ email }).select(select || '')
    }
}