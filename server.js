const Fastify = require('fastify')
const fastifyStatic = require('@fastify/static')
const path = require('path')

const fastify = Fastify({ logger: true })

// 1. Servir los estáticos del widget
fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'dist'),
  prefix: '/widget/',   // tus JS y CSS estarán en /widget/...
})

// 2. Rutas de SPA → solo devuelven index.spa.html
fastify.get('/app/*', (req, reply) => {
  reply.sendFile('index.spa.html', path.join(__dirname))
})

// 2. Rutas de SPA → solo devuelven index.spa.html
fastify.get('/no-standalone/*', (req, reply) => {
  reply.sendFile('index.spa.no-standalone.html', path.join(__dirname))
})

// (opcional) home simple
fastify.get('/', (req, reply) => {
  reply.sendFile('index.spa.html', path.join(__dirname))
})

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' })
    console.log('Servidor iniciado en http://localhost:3001')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
