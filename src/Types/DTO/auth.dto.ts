import { ProviderEnum } from '../../Types/Enums/enums.type';
import { GenderEnum, RolesEnum } from "../../Types/Enums/enums.type"

export interface SignUpDto {
    name: string
    email: string,
    password: string,
    cPassword: string,
    gender: GenderEnum
    DOB: Date
    mobileNumber: string,
    role: RolesEnum,
    provider: ProviderEnum
}
export interface IConfirmOtpDto {
    email: string;
    otp: number | string
}
export interface ILoginDto {
    email: string,
    password: string,
}
export interface IResetPasswordDto {
    email: string;
    password: string;
    otp: string
}
export interface IChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}
export interface IUpdateProfileDto {
    name: string;
    email: string;
    gender: GenderEnum;
    DOB: Date;
    mobileNumber: string;
}