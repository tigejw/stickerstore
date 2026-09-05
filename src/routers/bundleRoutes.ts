import express from "express";
import { getBundles } from "../controllers/getBundles";
import { getBundleBySlug } from "../controllers/getBundlesBySlug";

export const bundleRouter = express.Router();

bundleRouter.get("/", getBundles);
bundleRouter.get("/:slug", getBundleBySlug);