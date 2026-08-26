import serverless from "serverless-http";
const app = require("../../src/app");

const serverlessApp = serverless(app, {
  binary: ["application/json"],
});

export const handler = async (event: any, context: any) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return await serverlessApp(event, context);
};
