import fastify from "fastify";
import "dotenv/config";
import cors from "@fastify/cors";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { AppError } from "./utils/AppError";

import { vehicleRoutes } from "./http/routes/vehicle.routes";
import { fuelingRoutes } from "./http/routes/fueling.routes";
import { incidentRoutes } from "./http/routes/incident.routes";
import { vehicleDocumentRoutes } from "./http/routes/vehicleDocument.routes";
import { vehicleImageRoutes } from "./http/routes/vehicleImage.routes";

const app = fastify().withTypeProvider<ZodTypeProvider>();

// Configuração do CORS
app.register(cors, {
  origin: true, // Em produção, especifique os domínios permitidos
});

// Configuração dos validadores e serializadores Zod
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.setErrorHandler((error, _request, reply) => {
  // 🔥 Log para debug (mantenha por enquanto)
  if (process.env.NODE_ENV !== "production") {
    console.error("ERRO COMPLETO:", error);
  }

  // 1. Tratamento de Erro do Zod (Validação)
  // Verifica se é instância OU se tem o nome/formato de erro do Zod
  if (
    error instanceof ZodError ||
    error?.name === "ZodError" ||
    Array.isArray((error as any)?.issues)
  ) {
    // Coleta as duas representações possíveis do Zod (format() -> _errors / flatten() -> fieldErrors)
    const formatted =
      typeof (error as any)?.format === "function"
        ? (error as any).format()
        : undefined;

    // Build a simple issues map (field -> first message) from one of the available representations:
    //  - formatted (Zod format() -> { _errors, field: { _errors: [] } })
    //  - flatten()/issues (array of issue objects)
    const simpleIssues: Record<string, string> = {};

    // If we have formatted output, prefer it (it groups _errors under fields)
    if (formatted && typeof formatted === "object") {
      Object.entries(formatted).forEach(([key, val]) => {
        if (key === "_errors") {
          const arr = (val as any)?._errors ?? [];
          if (Array.isArray(arr) && arr.length)
            simpleIssues.general = String(arr[0]);
        } else {
          const first = (val as any)?._errors
            ? (val as any)._errors[0]
            : undefined;
          if (first) simpleIssues[key] = String(first);
        }
      });
    } else if (Array.isArray((error as any)?.issues)) {
      // Fallback: build from error.issues array (Zod Issue objects)
      const issuesArr = (error as any).issues as Array<any>;
      const general: string[] = [];
      issuesArr.forEach((iss) => {
        const msg = iss?.message ? String(iss.message) : undefined;
        const path =
          Array.isArray(iss?.path) && iss.path.length
            ? String(iss.path[0])
            : undefined;
        if (!path) {
          if (msg) general.push(msg);
        } else if (msg && !simpleIssues[path]) {
          simpleIssues[path] = msg;
        }
      });
      if (general.length) simpleIssues.general = general[0];
    }

    // Log legível e resumido para o console (dev)
    if (process.env.NODE_ENV !== "production") {
      try {
        console.error("Validation summary:");
        Object.entries(simpleIssues).forEach(([field, message]) => {
          console.error(`  - ${field}: ${message}`);
        });
      } catch (e) {
        console.error("Error while logging Zod error:", e);
      }
    }

    // Envia apenas `issues` simples (campo -> primeira mensagem).
    return reply.status(400).send({
      message: "Validation error",
      code: "VALIDATION_ERROR",
      issues: Object.keys(simpleIssues).length
        ? simpleIssues
        : formatted ?? (error as any).issues ?? undefined,
    });
  }

  // 3. Erros da Aplicação (AppError)
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message,
      code: error.code,
      details: error.details,
    });
  }

  // 4. Erro Genérico (500)
  return reply.status(500).send({
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
    // Mostra o erro original apenas em desenvolvimento
    originalError:
      process.env.NODE_ENV !== "production" ? error.message : undefined,
  });
});
// Health check endpoint
app.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Registrar rotas aqui quando forem criadas
app.register(vehicleRoutes, { prefix: "/vehicles" });
app.register(fuelingRoutes, { prefix: "/fuelings" });
app.register(incidentRoutes, { prefix: "/incidents" });
app.register(vehicleDocumentRoutes, { prefix: "/documents" });
app.register(vehicleImageRoutes, { prefix: "/images" });

// Iniciar servidor
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333;
    const host = process.env.HOST || "0.0.0.0";

    await app.listen({ port, host });
    console.log(`🚀 Servidor rodando em http://${host}:${port}`);
  } catch (err) {
    // Ensure the error is visible in consoles used by tools like `tsx`
    console.error("Erro ao iniciar servidor:", err);
    app.log.error(err);
    process.exit(1);
  }
};

start();
