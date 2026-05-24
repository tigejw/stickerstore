import express from "express"
import {getProducts} from "../controller"
export const productRouter = express.Router()

productRouter.get("/", getProducts)