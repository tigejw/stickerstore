import express from "express"
const apiRouter = express.Router()
import {getEndpoints, createWebhookSession} from "../controller"
import { productRouter } from "./productRoutes"
import { bundleRouter } from "./bundleRoutes"

apiRouter.get("/", getEndpoints)
apiRouter.post("/create-webhook-session", createWebhookSession)
apiRouter.use("/products", productRouter)
apiRouter.use("/bundles", bundleRouter)

export default apiRouter