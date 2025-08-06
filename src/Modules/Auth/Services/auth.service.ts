import { NextFunction, Request, Response } from "express";
import { IChangePasswordDto, IConfirmOtpDto, ILoginDto, IResetPasswordDto, SignUpDto, IUpdateProfileDto } from "../../../Types/DTO";
import { RevokedTokenRepository, UserRepository } from "../../../DB/Repositories";
import bcrypt from "bcrypt"
import { generateToken, verifyToken } from "../../../Utils";
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import { OtpEnum } from "../../../Types/Enums/enums.type";
import { sendEmail } from "../../../Services";
import { IAuthRequest, ISendMailoptions, IUploadFiles } from "../../../Types/Interfaces";
import { cloudinaryConfig } from "../../../Configs";


class AuthService {

    private userRepo = new UserRepository()
    private revokedTokenRepo = new RevokedTokenRepository()

    signUp = async (req: Request, res: Response) => {
        const files = req.files as IUploadFiles

        const { name, email, password, gender, DOB, mobileNumber, role }: SignUpDto = req.body

        const isUserExist = await this.userRepo.findOne({ filters: { email } })
        if (isUserExist) return res.status(400).json({ message: "User already exist" })

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const hashedOtp = bcrypt.hashSync(otp, +(process.env.SALT_ROUND as string))

        const expirationDate = new Date()
        expirationDate.setMinutes(expirationDate.getMinutes() + 10)

        sendEmail.emit('sendEmail', {
            to: email,
            subject: 'Confirm Email',
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                <h2>Email Verification</h2>
                <p>Use the following code to verify your email address:</p>
                <div style="font-size: 24px; font-weight: bold; color: #007bff; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
                <hr />
                <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
             </div>`
        } as ISendMailoptions)

        const folderName = uuidv4()

        const user = await this.userRepo.create({
            name, email, password, gender, DOB, mobileNumber, role, mediaCloudFolder: folderName,
            OTP: [{ code: hashedOtp, expiresIn: expirationDate, type: OtpEnum.CONFIRM_EMAIL }]
        })

        if (files) {
            const baseFolder = `${process.env.CLOUDINARY_FOLDER}/Users/${folderName}`
            if (files.profilePic) {
                const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(files.profilePic[0].path, { folder: `${baseFolder}/Profile` })
                user.profilePic = { secure_url, public_id }

            }
            if (files.coverPic) {
                const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(files.coverPic[0].path, { folder: `${baseFolder}/Cover` })
                user.coverPic = { secure_url, public_id }
            }

            await user.save()
        }

        res.status(201).json({ message: 'User created successfully' })
    }

    confirmEmail = async (req: Request, res: Response) => {
        const { email, otp }: IConfirmOtpDto = req.body

        const isUserExist = await this.userRepo.findOneByEmail(email)
        if (!isUserExist) return res.status(409).json({ message: "User not found" })

        const userOtp = isUserExist.OTP.find(otp => otp.type == OtpEnum.CONFIRM_EMAIL)
        if (!userOtp) return res.status(400).json({ message: "Invalid OTP" })

        const isOtpMatched = bcrypt.compareSync(otp as string, userOtp.code)
        if (!isOtpMatched) return res.status(400).json({ message: "Invalid OTP" })

        isUserExist.isVerified = true
        isUserExist.OTP = isUserExist.OTP.filter(otp => otp.type != OtpEnum.CONFIRM_EMAIL)
        await isUserExist.save()

        res.status(200).json({ message: "Confirmation successfully" })
    }

    signin = async (req: Request, res: Response) => {
        const { email, password }: ILoginDto = req.body

        const isUserExist = await this.userRepo.findOne({ filters: { email } })
        if (!isUserExist) return res.status(409).json({ message: "Invalid credential" })

        const isPasswordMatched = bcrypt.compareSync(password, isUserExist?.password)
        if (!isPasswordMatched) return res.status(409).json({ message: "Invalid credential" })

        const token = generateToken({
            _id: isUserExist._id,
            role: isUserExist.role
        },
            process.env.JWT_SECRET_LOGIN as string,
            {
                jwtid: uuidv4(),
                expiresIn: String(process.env.ACCESS_TOKEN_EXPIRATION_TIME) as jwt.SignOptions['expiresIn']
            })

        res.status(200).json({ message: 'User login successfully', token: token })

    }

    logout = async (req: Request, res: Response) => {
        const { token } = req.headers

        const decodedData = verifyToken(token as string, process.env.JWT_SECRET_LOGIN as string)

        console.log({ decodedData });

        const revokedToken = await this.revokedTokenRepo.findByTokenId(decodedData.jti as string)
        if (revokedToken) return res.status(400).json({ message: "Token is already revoked" })

        await this.revokedTokenRepo.create({
            tokenId: decodedData.jti,
            expierdAt: decodedData.exp
        })
        res.status(200).json({ message: "Logout successfully" })
    }

    forgetPassword = async (req: Request, res: Response) => {
        const { email } = req.body

        const user = await this.userRepo.findOneByEmail(email)
        if (!user) return res.status(409).json({ message: "User not found" })

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpHashed = bcrypt.hashSync(otp, +(process.env.SALT_ROUND as string))

        const expiresIn = new Date()
        expiresIn.setMinutes(expiresIn.getMinutes() + 10)

        sendEmail.emit('sendEmail', {
            to: email,
            subject: "Reset Password",
            html: `
             <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                <h2>Reset Your Password</h2>
                <p>You have requested to reset your password.</p>
                <p>Please use the code below to complete the password reset process:</p>
                <div style="font-size: 24px; font-weight: bold; color: #dc3545; margin: 20px 0;">
                ${otp}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you did not request a password reset, you can safely ignore this email.</p>
                <hr />
                <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
             </div>`
        } as ISendMailoptions)

        user.OTP = user.OTP.filter(otp => otp.type != OtpEnum.FORGET_PASSWORD)

        user.OTP.push({ code: otpHashed, expiresIn, type: OtpEnum.FORGET_PASSWORD })
        await user.save()

        res.status(200).json({ message: "please Check your mail" })
    }

    resetPassword = async (req: Request, res: Response) => {
        const { email, password, otp }: IResetPasswordDto = req.body

        const user = await this.userRepo.findOneByEmail(email)
        if (!user) return res.status(409).json({ message: "User not found" })

        const userOtp = user.OTP.find(otp => otp.type == OtpEnum.FORGET_PASSWORD)
        if (!userOtp) return res.status(409).json({ message: "Invalid Otp" })

        const isOtpMatched = bcrypt.compareSync(otp, userOtp.code)
        if (!isOtpMatched) return res.status(400).json({ message: "Invalid Otp" })

        user.password = password;
        await user.save()
        res.status(200).json({ message: "Reset Password successfully" })
    }

    updatePassword = async (req: IAuthRequest, res: Response) => {
        const { oldPassword, newPassword }: IChangePasswordDto = req.body;
        const { _id } = req.authUser

        const user = await this.userRepo.findById(_id)
        if (!user) return res.status(400).json({ message: "Invalid cardinial" })

        const isPasswordMatched = bcrypt.compareSync(oldPassword, user?.password as string)
        if (!isPasswordMatched) return res.status(400).json({ message: "Wrong old password" })

        user.password = newPassword
        await user.save();

        sendEmail.emit('sendEmail', {
            to: user.email,
            subject: "Update Profile",
            html: `
             <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                <h2>Password Changed Successfully</h2>
                <p>This is a confirmation that your account password has been changed.</p>
                <p>If you made this change, no further action is needed.</p>
                <p>If you did <strong>not</strong> change your password, please contact our support team immediately to secure your account.</p>
                <hr />
                <p style="font-size: 12px; color: #888;">This message was sent to notify you of a security-related change to your account.</p>
                <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
             </div>
            `
        } as ISendMailoptions)
        res.status(200).json({ message: "Password changed successfully" })
    }
}

export default new AuthService()

