import express, { Express } from "express";
import { resolve as pathResolve } from "path";

import { router as mainRouter } from "./routes/main";
import { router as initRouter } from "./routes/init";
import { router as peopleRouter } from "./routes/people";
import { router as automobilesRouter } from "./routes/automobiles";
import { router as malfunctionsRouter } from "./routes/malfunctions";

const app : Express = express();
const port : number = 8080;

app.set('view engine', 'ejs');
app.use('/public', express.static(pathResolve(__dirname, '..', 'public')));
app.use(express.json());

app.use("/main", mainRouter);
app.use("/init", initRouter);
app.use("/people", peopleRouter);
app.use("/automobiles", automobilesRouter);
app.use("/malfunctions", malfunctionsRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});