import express from "express";
import dotenv from "dotenv";
import { configCors } from "./config/corsConfig.js";
import { addTimeStamp, reqLog } from "./middleware/customMiddleware.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";
import { urlVersion } from "./middleware/apiVersioning.js";
import { basicRateLimiter } from "./middleware/rateLimiting.js";
import itemRoutes from "./routes/item-route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// middleware
app.use(reqLog);
app.use(addTimeStamp);

app.use(basicRateLimiter(4, 15*60*1000));
app.use(configCors());

app.use(urlVersion('v1'));
app.use('/api/v1', itemRoutes);

// custom error handler
app.use(globalErrorHandler)

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});