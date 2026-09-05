import { NextFunction, Request, Response } from "express";
import { selectProductBySlug } from "../models/selectProductsBySlug";

export const getProductBySlug = (
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction,
) => {
  const { slug } = req.params;
  selectProductBySlug(slug)
    .then((product) => {
      res.status(200).send({ product: product });
    })
    .catch((err) => {
      next(err);
    });
};