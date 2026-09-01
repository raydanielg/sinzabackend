import { prisma } from "../../config/prisma.js"

export async function listSettings(companyId) {
  return prisma.setting.findMany({ where: { companyId } })
}

export async function getSetting(companyId, key) {
  return prisma.setting.findUnique({ where: { key_companyId: { key, companyId } } })
}

export async function upsertSetting(companyId, key, value) {
  return prisma.setting.upsert({
    where: { key_companyId: { key, companyId } },
    update: { value },
    create: { key, value, companyId },
  })
}

export async function updateSettings(companyId, settings) {
  const results = []
  for (const [key, value] of Object.entries(settings)) {
    const result = await upsertSetting(companyId, key, String(value))
    results.push(result)
  }
  return results
}
