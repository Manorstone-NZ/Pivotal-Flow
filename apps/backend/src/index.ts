import Fastify from 'fastify';
import swagger from 'fastify-swagger';

const app = Fastify({ logger: true });

await app.register(swagger, {
  routePrefix: '/docs',
  swagger: { info: { title: 'Pivotal Flow API', version: '0.0.1' } },
  exposeRoute: true
});

app.get('/health', async () => ({ status: 'ok' }));
app.get('/v1/hello', async () => ({ message: 'Kia ora' }));

export async function start() {
  const port = Number(process.env.PORT ?? 3000);
  await app.listen({ port, host: '0.0.0.0' });
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}
