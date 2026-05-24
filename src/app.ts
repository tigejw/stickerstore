import express, {Application} from "express";
import apiRouter from "./routers/routes"

const app: Application = express();

app.use("/api", apiRouter)



app.get("/", (req, res) => {
    res.send("Hello World!")})

export default app;
