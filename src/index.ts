import { config } from 'dotenv'
config()
import express, { Application } from 'express'
import { controlerHandler } from './Utils'
import { databaseConnection } from './DB/connection'
import './Cron-Jobs'
import { connectRedis } from './Configs'

const app: Application = express()

databaseConnection()
controlerHandler(app)
connectRedis()
const port: number | string = process.env.PORT || 3000


app.listen(port, () => {
    console.log('server is running...', +port);
})