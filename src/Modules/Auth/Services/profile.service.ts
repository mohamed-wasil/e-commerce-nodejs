import { NextFunction, Request, Response } from "express";
import { IUpdateProfileDto } from "../../../Types/DTO";
import { UserRepository } from "../../../DB/Repositories";
import { sendEmail } from "../../../Services";
import { IAuthRequest, ISendMailoptions } from "../../../Types/Interfaces";
import { cloudinaryConfig } from "../../../Configs";


class ProfileService {
    private userRepo = new UserRepository()

    getProfile = async (req: IAuthRequest, res: Response, next: NextFunction) => {

        const { _id } = req.authUser

        const user = await this.userRepo.findById(_id, { select: '-password -__v -OTP -isDeleted' })

        res.status(200).json({ message: "Fetched data successfully", data:user })
    }

    updateProfile = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { name, email, DOB, gender, mobileNumber }: IUpdateProfileDto = req.body;

        const user = await this.userRepo.findById(_id)
        if (!user) return res.status(400).json({ message: "Invalid cardinial" })

        if (email) {
            const isEmailExist = await this.userRepo.findOneByEmail(email)
            if (!isEmailExist) return res.status(400).json({ message: "Email already exist" })
            user.email = email;
        }

        if (name) user.name = name;
        if (DOB) user.DOB = DOB
        if (gender) user.gender = gender
        if (mobileNumber) user.mobileNumber = mobileNumber

        await user.save()

        res.status(200).json({ message: "update profiule successfully" })
    }

    updateProfilePic = async (req: IAuthRequest, res: Response) => {
        const { file } = req
        const { _id } = req.authUser

        const user = await this.userRepo.findById(_id)
        if (!user) return res.status(400).json({ message: "Invalid cardinial" })

        if (!file) return res.status(400).json({ message: "ProfilePic is requierd" })

        const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Users/${user.mediaCloudFolder}`
        const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(file.path, { folder: baseFolder })
        user.profilePic = { public_id, secure_url }

        await user.save()
        res.status(200).json({ message: "Profile pic updated" })
    }

    updateCoverPic = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser
        const { file } = req

        const user = await this.userRepo.findById(_id)
        if (!user) return res.status(400).json({ message: "Invalid cardinial" })

        if (!file) return res.status(400).json({ message: "CoverPic is requierd" })

        const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Users/${user.mediaCloudFolder}`
        const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(file.path, { folder: baseFolder })
        user.coverPic = { public_id, secure_url }
        await user.save()
        res.status(200).json({ message: "Profile pic updated" })
    }

    deleteAccount = async (req: IAuthRequest, res: Response) => {
        const { _id } = req.authUser

        const user = await this.userRepo.findById(_id)
        if (!user) return res.status(400).json({ message: "Invalid cardinial" })

        await this.userRepo.findOneAndUpdate({
            filters: { _id }, setData: {
                deletedAt: new Date(),
                isDeleted: true
            }
        })

        sendEmail.emit('sendEmail', {
            to: user.email,
            subject: "Your Account Was Successfully Removed",
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
              <h2>Account Deleted Successfully</h2>
              <p>This is to confirm that your account has been <strong>permanently deleted</strong>.</p>
              <p>All your data, including profile information and activity, has been removed from our system.</p>
              <p>If you did <strong>not</strong> request this deletion, please contact our support team immediately.</p>
              <hr />
              <p style="font-size: 12px; color: #888;">This message was sent to notify you of an important change related to your account.</p>
              <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} Your Company.All rights reserved.</p>
    </div>
        `
        } as ISendMailoptions)

        res.status(200).json({ messagee: "User deleted successfully" })
    }
}

export default new ProfileService