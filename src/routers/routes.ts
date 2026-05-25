import express from "express"
const apiRouter = express.Router()
import {getEndpoints} from "../controller"
import { productRouter } from "./productRoutes"
import { bundleRouter } from "./bundleRoutes"

apiRouter.get("/", getEndpoints)
apiRouter.use("/products", productRouter)
apiRouter.use("/bundles", bundleRouter)

export default apiRouter