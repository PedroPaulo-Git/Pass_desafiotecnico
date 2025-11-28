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

const app = fastify().withTypeProvider<ZodTypeProvider>();

// Configuração do CORS
app.register(cors, {
  origin: true, // Em produção, especifique os domínios permitidos
});

// Configuração dos validadores e serializadores Zod
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Error Handler Global
app.setErrorHandler((error, _request, reply) => {
  // Erros de validação do Zod
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: "Validation error",
      code: "VALIDATION_ERROR",
      status: 400,
      details: error.flatten().fieldErrors,
    });
  }

  //Custom application errors
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.message,
      code: error.code,
      status: error.statusCode,
      details: error.details,
    });
  }

  // Log de erros não tratados (em produção, enviar para serviço de monitoramento)
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  // Erro genérico
  return reply.status(500).send({
    error: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
    status: 500,
  });
});

// Health check endpoint
app.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Registrar rotas aqui quando forem criadas
app.register(vehicleRoutes, { prefix: "/vehicles" });

// Iniciar servidor
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333;
    const host = "0.0.0.0";

    await app.listen({ port, host });
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    console.log("DB URL:", process.env.DATABASE_URL);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
