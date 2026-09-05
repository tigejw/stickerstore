import express from "express"
import { getProducts } from "../controllers/getProducts"
import { getProductBySlug } from "../controllers/getProductsBySlug"
export const productRouter = express.Router()

productRouter.get("/", getProducts)
productRouter.get("/:slug", getProductBySlug)