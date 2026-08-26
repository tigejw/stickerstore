import serverless from "serverless-http";
const app = require("../../src/app");

export const handler = serverless(app, {
  binary: ["application/json"],
 request: (_request: unknown, _event: unknown, context: { callbackWaitsForEmptyEventLoop: boolean }) => {
    context.callbackWaitsForEmptyEventLoop = false;
  }
});