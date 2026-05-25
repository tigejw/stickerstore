import express from "express"
import {getProducts, getProductBySlug} from "../controller"
export const productRouter = express.Router()

productRouter.get("/", getProducts)
productRouter.get("/:slug", getProductBySlug)