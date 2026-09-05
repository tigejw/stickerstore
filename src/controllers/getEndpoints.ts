import { NextFunction, Request, Response } from "express";
import { readEndpointsData } from "../models/readEndpointsData";

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