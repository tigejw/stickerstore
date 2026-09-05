import { NextFunction, Request, Response } from "express";
import { selectAllBundles } from "../models/selectAllBundles";
import { type BundlesQuery } from "../utils/types";

export const getBundles = (req: Request, res: Response, next: NextFunction) => {
  const { sort_by, order, active, is_new } = req.query as BundlesQuery;
  selectAllBundles({ sort_by, order, active, is_new })
    .then((bundlesData) => {
      res.status(200).send(bundlesData);
    })
    .catch((err) => {
      next(err);
    });
};