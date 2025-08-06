import mongoose from "mongoose";
import { IAddress } from "../../Types/Interfaces";
import { LabelAddressEnum } from "../../Types/Enums/enums.type";
import { decryption, encryption } from "../../Utils";

const addressSchema = new mongoose.Schema<IAddress>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    street: {
        type: String,
        required: true,
        trim: true
    },
    postalCode: {
        type: String,
        default: ''
    },
    buildingNumber: {
        type: String,
        default: ''
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        enum: Object.values(LabelAddressEnum),
        default: LabelAddressEnum.HOME
    }
}, { timestamps: true })

addressSchema.pre('save', async function () {
    if (this.isModified('phone')) {
        this.phone = await encryption(this.phone)
    }
})


addressSchema.post(/^find/, async (docs) => {
    if (!Array.isArray(docs)) docs = [docs]

    for (const doc of docs) {
        if (doc?.phone) {
            doc.phone = await decryption(doc?.phone);
        }
    }
})


export const AddressModel = mongoose.models.Address || mongoose.model<IAddress>('Address', addressSchema) 