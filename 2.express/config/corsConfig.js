import cors from "cors";

export const configCors = () => {
  return cors({
    // origin  -> this will tell which origin user wants to access/allow to use the api
    origin : ( origin, callback ) => {
      const allowOrigin = [
        "http://localhost:3000", // local development 
        "https://someone@example.com" // production url
      ];

      if(!origin || allowOrigin.indexOf(origin) !== -1){
        callback(null, true); // giving permission so that req can be allowed
      } else {
        callback(new Error(`Not allowed by cors`));
      }
    },
    methods : ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders : ['Content-Type', 'Authorization', 'Accept-Version'],
    exposedHeaders : ['X-Total-Count', 'Content-Range'],
    credentials: true, // enable support for cookies
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge : 600, // catch preflight responses for 10mins, avoid sending options req multiple times
  });
}