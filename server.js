const Fastify = require('fastify');
const fastifyStatic = require('@fastify/static');
const path = require('path');

const fastify = Fastify({ logger: true });

// Servir archivos estáticos desde la carpeta actual
fastify.register(fastifyStatic, {
  root: path.join(__dirname),
  prefix: '/', // Acceso directo desde la raíz
});

// Ruta principal para el index.spa.html
fastify.get('/', async (request, reply) => {
  return reply.sendFile('index.spa.html');
});

const start = async () => {
  try {
    await fastify.listen({ port: 3002, host: '0.0.0.0' });
    console.log('Servidor corriendo en http://localhost:3002');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();