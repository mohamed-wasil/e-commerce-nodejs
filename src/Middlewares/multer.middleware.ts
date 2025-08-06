import { Request } from "express";
import path from 'path'
import fs from 'fs'
import multer, { FileFilterCallback, StorageEngine } from "multer";

export const multerMiddleware = (allowedExtention: string[] = [], fileDestination?: string) => {
    try {
        const storage: StorageEngine = multer.diskStorage({
            destination: (req, file, cb) => {
                const fileDest = fileDestination ? path.join('Assets', fileDestination) : "Assets";

                if (!fs.existsSync(fileDest)) {
                    fs.mkdirSync(fileDest, { recursive: true })
                }
                cb(null, fileDest)
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname)
            }
        })

        const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {            
            const filterExtintion: string[] = allowedExtention.map(ext => 'image/' + ext)

            if (filterExtintion.includes(file.mimetype)) {
                cb(null, true)
            } else {
                cb(new Error("Not allowed extention"));
            }
        }
        const upload = multer({ fileFilter, storage })
        return upload
    } catch (error) {
        console.log('error in multer middleware :', error);
        throw error;
    }
}




















