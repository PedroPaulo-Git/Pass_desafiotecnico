import fastify from 'fastify'
import cors from '@fastify/cors'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { ZodError } from 'zod'
import { AppError } from './utils/AppError'

const app = fastify().withTypeProvider<ZodTypeProvider>()

// Configuração do CORS
app.register(cors, {
  origin: true, // Em produção, especifique os domínios permitidos
})

// Configuração dos validadores e serializadores Zod
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Error Handler Global
app.setErrorHandler((error, request, reply) => {
  // Erros de validação do Zod
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Erro de validação',
      errors: error.flatten().fieldErrors,
    })
  }

  // Erros customizados da aplicação
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    })
  }

  // Log de erros não tratados (em produção, enviar para serviço de monitoramento)
  if (process.env.NODE_ENV !== 'production') {
    console.error(error)
  }

  // Erro genérico
  return reply.status(500).send({
    message: 'Erro interno do servidor',
  })
})

// Health check endpoint
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Registrar rotas aqui quando forem criadas
// app.register(vehicleRoutes, { prefix: '/vehicles' })

// Iniciar servidor
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333
    const host = '0.0.0.0'

    await app.listen({ port, host })
    console.log(`🚀 Servidor rodando em http://localhost:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
