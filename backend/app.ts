import express from "express";
import { GraphQLError } from "graphql";
import scheduledAuditsRouter from "./src/modules/scheduled-audits/routes/scheduled-audits.routes";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { createContext } from "./src/graphql/context.js";
import { resolvers, typeDefs } from "./src/graphql/schema.js";
import { getAuditReportController } from "./src/modules/audits/controllers/audit-report.controller.js";
import { debugErrorsEnabled, requestLogger } from "./src/shared/http/request-logger.js";

export const app = express();

app.disable("x-powered-by");
app.use(requestLogger);

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok", service: "crawlix-api", requestId: response.locals.requestId });
});
app.use("/api/cron/audits", scheduledAuditsRouter);

export async function startGraphqlApi() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError(formattedError, error) {
      const originalError = error instanceof GraphQLError ? error.originalError : error;
      const code = formattedError.extensions?.code;

      if (code === "INTERNAL_SERVER_ERROR") {
        console.error("GraphQL resolver error:", {
          message: originalError instanceof Error ? originalError.message : formattedError.message,
          path: error instanceof GraphQLError ? error.path : undefined,
          stack: originalError instanceof Error ? originalError.stack : undefined,
        });
      }

      if (!debugErrorsEnabled() || !(originalError instanceof Error)) return formattedError;

      return {
        ...formattedError,
        message: originalError.message,
        extensions: {
          ...formattedError.extensions,
          debug: {
            name: originalError.name,
            stack: originalError.stack,
          },
        },
      };
    },
  });
  await server.start();
  app.use("/graphql",
    express.json({ limit: "1mb" }),
    expressMiddleware(server, { context: ({ req, res }) => createContext({ req, res }) }),
  );

  app.get("/api/audits/:jobId/report", getAuditReportController);

  app.use((_request, response) => {
    response.status(404).json({ error: "Route not found.", requestId: response.locals.requestId });
  });

  app.use((error: unknown, request: express.Request, response: express.Response, _next: express.NextFunction) => {
    const debug = debugErrorsEnabled();
    const errorRecord = typeof error === "object" && error !== null
      ? error as { status?: unknown; statusCode?: unknown }
      : {};
    const candidateStatus = errorRecord.status ?? errorRecord.statusCode;
    const status = typeof candidateStatus === "number" && candidateStatus >= 400 && candidateStatus <= 599
      ? candidateStatus
      : 500;
    const message = error instanceof Error ? error.message : "An unexpected server error occurred.";
    const requestId = response.locals.requestId;

    if (status >= 500) {
      console.error("Unhandled API error:", {
        requestId,
        method: request.method,
        path: request.path,
        message,
        stack: error instanceof Error ? error.stack : undefined,
      });
    }

    response.status(status).json({
      error: debug ? message : "An unexpected server error occurred.",
      requestId,
      ...(debug && error instanceof Error ? { details: error.message, stack: error.stack } : {}),
    });
  });
  return server;
}
