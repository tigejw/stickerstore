import express from "express";
import { getBundleBySlug, getBundles } from "../controller";

export const bundleRouter = express.Router();

bundleRouter.get("/", getBundles);
bundleRouter.get("/:slug", getBundleBySlug);