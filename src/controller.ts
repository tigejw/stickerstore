import { NextFunction, Request, Response } from "express";
import {
  readEndpointsData,
  selectAllProducts,
  type ProductsQuery,
  selectProductBySlug
} from "./model";

export const getEndpoints = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  readEndpointsData()
    .then((endpointsData) => {
      res.status(200).send({ endpoints: endpointsData });
    })
    .catch((err) => {
      next(err);
    });
};

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { sort_by, order, active, is_new } = req.query as ProductsQuery;
  selectAllProducts({ sort_by, order, active, is_new })
    .then((productsData) => {
      res.status(200).send(productsData);
    })
    .catch((err) => {
      next(err);
    });
};

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
      console.log(err, "slug")
      next(err);
    });
};
