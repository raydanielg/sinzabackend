import { app } from "./app.js"
import { config } from "./config/env.js"
import { prisma } from "./config/prisma.js"
import { logger } from "./config/logger.js"

async function start() {
  try {
    await prisma.$connect()
    logger.info("Connected to PostgreSQL")

    app.listen(config.port, () => {
      logger.info(`Sinza Fashion API running on port ${config.port}`)
      logger.info(`Swagger docs at http://localhost:${config.port}/api/docs`)
      logger.info(`Environment: ${config.nodeEnv}`)
    })
  } catch (err) {
    logger.error({ err }, "Failed to start server")
    process.exit(1)
  }
}

start()
