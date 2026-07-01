import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors"
import apiRouter from "./routers/routes";

const app: Application = express();

type AppError = {
  status: number;
  msg: string;
};
type PgError = {
  code?: string;
};

app.use(cors())
app.use(express.json());
app.use("/api", apiRouter);

//invalid url handling

app.all("/{*invalidUrl}", (req: Request, res: Response) => {
  res.status(404).send({ error: "Invalid URL!" });
});

//error handling middleware


app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ error: err.msg });
  } else next(err);
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.log(err, "<<< handle this");
  res.status(500).send({ error: "Server Error!", msg: err });
});

export default app;
