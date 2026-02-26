import { defineConfig } from 'prisma'

// Prisma config for Migrate / CLI. Move connection URLs here instead of in
// the schema datasource `url` property (Prisma v7+).
export default defineConfig({
  datasources: {
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL,
    },
  },
})

// Note: For production you may switch `provider` to 'postgresql' and set
// `DATABASE_URL` accordingly in your environment.
