require('dotenv').config();
const Fastify = require('fastify');
const fastifyStatic = require('@fastify/static');
const path = require('path');

const fastify = Fastify({ logger: true });

// Enable CORS for all origins (or configure as needed)
fastify.register(require('@fastify/cors'), {
  origin: true // allows all origins
});

// Servir archivos estáticos desde la carpeta actual
fastify.register(fastifyStatic, {
  root: path.join(__dirname),
  prefix: '/', // Acceso directo desde la raíz
});

// Ruta principal para el index.html
fastify.get('/', async (request, reply) => {
  return reply.sendFile('index.prod.html');
});

const nodemailer = require('nodemailer');

// Configuración del transporte SMTP2GO
const transporter = nodemailer.createTransport({
  host: "mail.smtp2go.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "suggero",
    pass: "64PpzUP56gOdToqM"
  }
});

fastify.post('/api/send-email', async (request, reply) => {
  console.log('Incoming request to /api/send-email');
  console.log('Body:', request.body);
  const { type, formData } = request.body;

  if (!formData) {
    console.error('Missing form data');
    return reply.code(400).send({ error: 'Missing form data' });
  }

  const subject = type === 'support'
    ? `[Soporte] Nueva incidencia de ${formData.companyName}`
    : `[Comercial] Nuevo contacto de ${formData.companyName}`;

  const html = `
        <h2>Nuevo mensaje de ${type === 'support' ? 'Soporte' : 'Comercial'}</h2>
        <ul>
            <li><strong>Empresa:</strong> ${formData.companyName}</li>
            <li><strong>Contacto:</strong> ${formData.contactName}</li>
            <li><strong>Email:</strong> ${formData.email}</li>
            <li><strong>Teléfono:</strong> ${formData.phone}</li>
        </ul>
        <h3>Mensaje:</h3>
        <p>${formData.message}</p>
    `;

  try {
    const info = await transporter.sendMail({
      from: ' suggero@relo.ad', // Sender address
      to: "iih10ai@gmail.com", // List of receivers
      subject: subject,
      html: html,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return reply.code(500).send({ error: 'Error sending email', details: error.message });
  }
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