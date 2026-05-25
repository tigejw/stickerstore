import { NextFunction, Request, Response } from "express";
import {
  readEndpointsData,
  selectAllProducts,
  type ProductsQuery,
  selectProductBySlug,
  selectAllBundles,
  type BundlesQuery,
  selectBundleBySlug,
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
      next(err);
    });
};

export const getBundles = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { sort_by, order, active, is_new } = req.query as BundlesQuery;
  selectAllBundles({ sort_by, order, active, is_new })
    .then((bundlesData) => {
      res.status(200).send(bundlesData);
    })
    .catch((err) => {
      next(err);
    });
};

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
