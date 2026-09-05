import express from "express"
const apiRouter = express.Router()
import {getEndpoints} from "../controllers/getEndpoints"
import { productRouter } from "./productRoutes"
import { bundleRouter } from "./bundleRoutes"
import { createWebhookSession } from "../controllers/createWebhookSession"

apiRouter.get("/", getEndpoints)
apiRouter.post("/create-webhook-session", createWebhookSession)
apiRouter.use("/products", productRouter)
apiRouter.use("/bundles", bundleRouter)

export default apiRouter