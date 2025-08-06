import mongoose, { Document } from "mongoose";
import { IRevokedToken } from "../../Types/Interfaces";

const revokedTokenSchema = new mongoose.Schema<IRevokedToken>({
    tokenId: {
        type: String,
        required: true,
        unique: true
    },
    expierdAt: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const RevokedTokenModel = mongoose.models.RevokedToken || mongoose.model<IRevokedToken>('RevokedToken', revokedTokenSchema)
