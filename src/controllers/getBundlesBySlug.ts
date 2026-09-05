import { NextFunction, Request, Response } from "express";
import { selectBundleBySlug } from "../models/selectBundleBySlug";

export const getBundleBySlug = (
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction,
) => {
  const { slug } = req.params;
  selectBundleBySlug(slug)
    .then((bundle) => {
      res.status(200).send({ bundle });
    })
    .catch((err) => {
      next(err);
    });
};