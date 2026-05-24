import { NextFunction, Request, Response } from "express";
import {readEndpointsData, selectAllProducts} from "./model";

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
  selectAllProducts()
    .then((productsData) => {
      res.status(200).send(productsData);
    })
    .catch((err) => {
      next(err);
    });
};
