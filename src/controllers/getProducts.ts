import { NextFunction, Request, Response } from "express";
import { selectAllProducts } from "../models/selectAllProducts";
import { type ProductsQuery } from "../utils/types";

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { sort_by, order, active, is_new } = req.query as ProductsQuery;

selectAllProducts({ sort_by, order, active, is_new })
  .then((productsData) => {
    const elapsedMs = Date.now() - (req as any)._startTime;
    console.log(`[TIMER] ${req.method} ${req.url} - DB query resolved after ${elapsedMs}ms  at ${Date.now()}`);
    res.status(200).send(productsData);
  })
    .catch((err) => {
      next(err);
    });
};
