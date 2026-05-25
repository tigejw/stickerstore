import express from "express"
const apiRouter = express.Router()
import {getEndpoints} from "../controller"
import { productRouter } from "./productRoutes"

apiRouter.get("/", getEndpoints)
apiRouter.use("/products", productRouter)

export default apiRouter