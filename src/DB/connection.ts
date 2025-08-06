import { connect } from "mongoose"

export const databaseConnection = async () => {
    const uri = process.env.DB_URI as string
    return await connect(uri).then(() => {
        console.log('database connected');
    }).catch((err) => {
        console.log('database connection error : ', err);
    })
}