import CryptoJS from "crypto-js"

export const encryption = async (plainText: string | number): Promise<string> => {
    return CryptoJS.AES.encrypt(plainText as string, process.env.ENCRYPTION_SECRET_KEY as string).toString();
}

export const decryption = async (cipherText: string) => {
    return CryptoJS.AES.decrypt(cipherText, process.env.ENCRYPTION_SECRET_KEY as string).toString(CryptoJS.enc.Utf8)
}