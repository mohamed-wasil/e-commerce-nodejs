import { Router } from "express";
import authService from "./Services/auth.service";
import profileService from "./Services/profile.service";
import { authenticationMiddleware, errorHandllerMiddleware, multerMiddleware, validationMiddleware } from "../../Middlewares";
import { confirmOtpSchema, IUpdatePasswordSchema, resetPasswordSchema, SigninSchema, signUpSchema, updateProfileSchema } from "../../Validators/auth.schema";
import { ImageExtensions } from "../../Types/Enums/enums.type";


export const authController = Router()

authController.post('/signup',
    multerMiddleware([ImageExtensions.PNG, ImageExtensions.JPEG, ImageExtensions.JPG], 'Users').fields([{ name: 'profilePic', maxCount: 1 }, { name: 'coverPic', maxCount: 1 }]),
    validationMiddleware(signUpSchema),
    errorHandllerMiddleware(authService.signUp)
)
authController.patch('/confirm-email',
    validationMiddleware(confirmOtpSchema),
    errorHandllerMiddleware(authService.confirmEmail)
)
authController.post('/signin',
    validationMiddleware(SigninSchema),
    errorHandllerMiddleware(authService.signin)
)
authController.post('/logout',
    errorHandllerMiddleware(authService.logout)
)
authController.patch('/forget-password',
    errorHandllerMiddleware(authService.forgetPassword)
)
authController.put('/reset-password',
    validationMiddleware(resetPasswordSchema),
    errorHandllerMiddleware(authService.resetPassword)
)
authController.put('/update-password',
    authenticationMiddleware(),
    validationMiddleware(IUpdatePasswordSchema),
    errorHandllerMiddleware(authService.updatePassword)
)

authController.get('/get-profile',
    authenticationMiddleware(),
    errorHandllerMiddleware(profileService.getProfile)
)

authController.put('/update-profile',
    authenticationMiddleware(),
    validationMiddleware(updateProfileSchema),
    errorHandllerMiddleware(profileService.updateProfile)
)
authController.patch('/update-profile-pic',
    authenticationMiddleware(),
    multerMiddleware([ImageExtensions.PNG, ImageExtensions.JPEG, ImageExtensions.JPG]).single('profilePic'),
    errorHandllerMiddleware(profileService.updateProfilePic)
)
authController.patch('/update-cover-pic',
    authenticationMiddleware(),
    multerMiddleware([ImageExtensions.PNG, ImageExtensions.JPEG, ImageExtensions.JPG]).single('coverPic'),
    errorHandllerMiddleware(profileService.updateCoverPic)
)
authController.delete('/delete-account',
    authenticationMiddleware(),
    errorHandllerMiddleware(profileService.deleteAccount)
)