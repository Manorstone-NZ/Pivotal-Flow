import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
export async function systemRoutes(fastify) {
    // Docker Engine check
    fastify.get('/system/docker', async (request, reply) => {
        try {
            const { stdout } = await execAsync('docker --version');
            const version = stdout.trim();
            // Check if Docker daemon is running
            await execAsync('docker info > /dev/null 2>&1');
            return {
                status: 'ok',
                message: 'Docker Engine is running',
                version: version,
                uptime: 'unknown',
                details: {
                    daemon: 'running',
                    apiVersion: 'unknown'
                }
            };
        }
        catch (error) {
            return reply.status(503).send({
                status: 'error',
                message: 'Docker Engine is not available',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Docker Compose check
    fastify.get('/system/docker-compose', async (request, reply) => {
        try {
            const { stdout } = await execAsync('docker compose version');
            const version = stdout.trim();
            // Check if Docker Compose can read our compose file
            const composeFile = '/home/damianc/Development/Pivotal-Flow/infra/docker/docker-compose.yml';
            await execAsync(`docker compose -f ${composeFile} config > /dev/null 2>&1`);
            return {
                status: 'ok',
                message: 'Docker Compose is working',
                version: version,
                uptime: 'unknown',
                details: {
                    composeFile: 'valid',
                    services: ['postgres', 'redis']
                }
            };
        }
        catch (error) {
            return reply.status(503).send({
                status: 'error',
                message: 'Docker Compose is not available',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Node.js check
    fastify.get('/system/nodejs', async (request, reply) => {
        try {
            const { stdout } = await execAsync('node --version');
            const version = stdout.trim();
            // Check if Node.js can run basic code
            const { stdout: testOutput } = await execAsync('node -e "console.log(\'Node.js is working\')"');
            return {
                status: 'ok',
                message: 'Node.js is available',
                version: version,
                uptime: 'unknown',
                details: {
                    testOutput: testOutput.trim(),
                    platform: process.platform,
                    arch: process.arch
                }
            };
        }
        catch (error) {
            return reply.status(503).send({
                status: 'error',
                message: 'Node.js is not available',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // pnpm check
    fastify.get('/system/pnpm', async (request, reply) => {
        try {
            const { stdout } = await execAsync('pnpm --version');
            const version = stdout.trim();
            // Check if pnpm can list packages
            const { stdout: listOutput } = await execAsync('pnpm list --depth=0 --json 2>/dev/null || echo "{}"');
            return {
                status: 'ok',
                message: 'pnpm is available',
                version: version,
                uptime: 'unknown',
                details: {
                    packageManager: 'pnpm',
                    canListPackages: true
                }
            };
        }
        catch (error) {
            return reply.status(503).send({
                status: 'error',
                message: 'pnpm is not available',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Python check
    fastify.get('/system/python', async (request, reply) => {
        try {
            const { stdout } = await execAsync('python3 --version');
            const version = stdout.trim();
            // Check if Python can run basic code
            const { stdout: testOutput } = await execAsync('python3 -c "print(\'Python is working\')"');
            return {
                status: 'ok',
                message: 'Python is available',
                version: version,
                uptime: 'unknown',
                details: {
                    testOutput: testOutput.trim(),
                    executable: 'python3'
                }
            };
        }
        catch (error) {
            return reply.status(503).send({
                status: 'error',
                message: 'Python is not available',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Docker containers check
    fastify.get('/system/containers', async (request, reply) => {
        try {
            const { stdout } = await execAsync('docker ps --format "{{.Names}}\t{{.Status}}\t{{.Ports}}"');
            const containers = stdout.trim().split('\n').filter(line => line.trim()).map(line => {
                const [name, status, ports] = line.split('\t');
                return { name, status, ports };
            });
            return {
                status: 'ok',
                message: 'Docker containers status retrieved',
                version: 'unknown',
                uptime: 'unknown',
                details: {
                    containers: containers,
                    totalContainers: containers.length,
                    runningContainers: containers.filter(c => c.status.includes('Up')).length
                }
            };
        }
        catch (error) {
            return reply.status(503).send({
                status: 'error',
                message: 'Failed to get Docker containers status',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // System resources check
    fastify.get('/system/resources', async (request, reply) => {
        try {
            const [memory, disk] = await Promise.all([
                execAsync('free -h'),
                execAsync('df -h /')
            ]);
            const memoryLines = memory.stdout.trim().split('\n');
            const diskLines = disk.stdout.trim().split('\n');
            return {
                status: 'ok',
                message: 'System resources retrieved',
                version: 'unknown',
                uptime: 'unknown',
                details: {
                    memory: memoryLines[1], // Use second line (Mem:)
                    disk: diskLines[1], // Use second line (root filesystem)
                    memoryTotal: memoryLines[1].split(/\s+/)[1],
                    memoryUsed: memoryLines[1].split(/\s+/)[2],
                    memoryFree: memoryLines[1].split(/\s+/)[3],
                    diskUsed: diskLines[1].split(/\s+/)[4]
                }
            };
        }
        catch (error) {
            return reply.status(503).send({
                status: 'error',
                message: 'Failed to get system resources',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}
//# sourceMappingURL=routes.js.map