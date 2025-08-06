
import { IRevokedToken } from "../../Types/Interfaces";
import DatabaseService from "../database.service";
import { RevokedTokenModel } from "../Models";

export class RevokedTokenRepository extends DatabaseService<IRevokedToken> {
    constructor() {
        super(RevokedTokenModel)
    }
    
    async findByTokenId(tokenId: string): Promise<IRevokedToken | null> {
        return await this.__model.findOne({ tokenId })
    }


} 