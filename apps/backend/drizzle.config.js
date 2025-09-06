export default {
    schema: './src/lib/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env['DATABASE_URL'] || 'postgresql://pivotal:pivotal@localhost:5432/pivotal',
    },
    verbose: true,
    strict: true,
};
//# sourceMappingURL=drizzle.config.js.map