import express from "express"
const apiRouter = express.Router()
import {getEndpoints} from "../controller"

apiRouter.get("/", getEndpoints)

export default apiRouter