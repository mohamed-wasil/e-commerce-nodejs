import mongoose, { Document } from "mongoose"
import { GenderEnum, OtpEnum, ProviderEnum, RolesEnum } from "../../Types/Enums/enums.type"
import bcrypt from "bcrypt"
import { decryption, encryption } from "../../Utils"
import { IUser } from "../../Types/Interfaces"
import { cloudinaryConfig } from "../../Configs"

const userSchema = new mongoose.Schema<IUser & Document>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        enum: Object.values(ProviderEnum),
        default: ProviderEnum.SYSTEM
    },
    gender: {
        type: String,
        enum: Object.values(GenderEnum),
        default: GenderEnum.NOT_SPECIFIED
    },
    DOB: {
        type: Date,
    },
    mobileNumber: String,
    role: {
        type: String,
        enum: Object.values(RolesEnum),
        default: RolesEnum.USER
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    isDeleted: { type: Boolean, default: false },
    profilePic: {
        public_id: String,
        secure_url: String
    },
    coverPic: {
        public_id: String,
        secure_url: String
    },
    mediaCloudFolder: String,
    OTP: [{
        code: { type: String, required: true },
        type: { type: String, enum: Object.values(OtpEnum), required: true },
        expiresIn: { type: Date, required: true },
    },]

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

userSchema.virtual('age').get(function () {
    if (!this.DOB) return null

    const today = new Date();
    let age = today.getFullYear() - this.DOB.getFullYear()

    // Check if birthday has passed this year
    const hasBirthdayPassed =
        today.getMonth() > this.DOB.getMonth() ||
        (today.getMonth() === this.DOB.getMonth() && today.getDate() >= this.DOB.getDate());

    if (!hasBirthdayPassed) {
        age--; // Adjust age if birthday hasn't happened yet this year
    }

    return age;
})

userSchema.pre('save', async function () {
    if (this.isModified("password")) {
        this.password = bcrypt.hashSync(this.password, +(process.env.SALT_ROUND as string))
    }
    if (this.isModified('mobileNumber')) {
        this.mobileNumber = await encryption(this.mobileNumber)
    }
})

userSchema.post(/^find/, async function (docs) {
    if (!Array.isArray(docs)) docs = [docs];

    for (const doc of docs) {
        if (doc?.mobileNumber) {
            doc.mobileNumber = await decryption(doc?.mobileNumber);
        }
    }
});

userSchema.post('findOneAndDelete', async function (doc, next) {
    if (doc?.profilePic) {
        const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Users/${doc?.mediaCloudFolder}/Profile`
        await cloudinaryConfig().api.delete_resources_by_prefix(baseFolder)
            .then(async () => {
                await cloudinaryConfig().api.delete_folder(baseFolder)
                    .then(async () => {
                        await cloudinaryConfig().api.delete_folder(`${process.env.CLOUDINARY_FOLDER}/Users/${doc?.mediaCloudFolder}`)
                    }).catch((err) => {
                        console.log('Folder not empty');
                    })
            })
    }
    if (doc?.coverPic) {
        const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Users/${doc?.mediaCloudFolder}/Cover`
        await cloudinaryConfig().api.delete_resources_by_prefix(baseFolder)
            .then(async () => {
                await cloudinaryConfig().api.delete_folder(baseFolder)
                    .then(async () => {
                        await cloudinaryConfig().api.delete_folder(`${process.env.CLOUDINARY_FOLDER}/Users/${doc?.mediaCloudFolder}`)
                    }).catch((err) => {
                        console.log('Folder not empty');
                    })
            })
    }
})

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema)