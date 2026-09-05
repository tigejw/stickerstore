import fs from "fs/promises";
import { type EndpointsData } from "../utils/types";

export function readEndpointsData(): Promise<EndpointsData> {
  return fs
    .readFile(`${__dirname}/../../endpoints.json`, "utf8")
    .then((endpoints) => {
      return JSON.parse(endpoints) as EndpointsData;
    });
}