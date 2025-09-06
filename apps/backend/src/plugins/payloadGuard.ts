import { throwIfMonetaryInMetadata } from "@pivotal-flow/shared";
import type { FastifyInstance, FastifyPluginCallback } from "fastify";

/* Apply to POST and PATCH on quotes and quote lines */
export const payloadGuardPlugin: FastifyPluginCallback = (app: FastifyInstance, _opts, done) => {
  app.addHook("preHandler", async (req) => {
    const url = req.raw.url || "";
    const isWrite =
      req.method === "POST" || req.method === "PATCH" || req.method === "PUT";
    const targetsQuotes =
      url.startsWith("/v1/quotes") || url.startsWith("/v1/quotes/");

    if (!isWrite || !targetsQuotes) return;

    const body: any = req.body || {};
    /* Quote level metadata */
    if (body.metadata !== undefined) {
      throwIfMonetaryInMetadata(body.metadata);
    }
    /* Line level metadata when lines array present */
    if (Array.isArray(body.lines)) {
      for (let i = 0; i < body.lines.length; i++) {
        const ln = body.lines[i];
        if (ln && ln.metadata !== undefined) {
          throwIfMonetaryInMetadata(ln.metadata);
        }
      }
    }
  });
  done();
};
