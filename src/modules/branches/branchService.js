import { prisma } from "../../config/prisma.js"
import { generateBranchCode } from "../../utils/generators.js"
import { createAuditLog } from "../../utils/audit.js"

export async function listBranches(filters = {}) {
  const where = {}
  if (filters.companyId) where.companyId = filters.companyId

  return prisma.branch.findMany({
    where,
    include: {
      manager: true,
      _count: { select: { users: true, sales: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getBranchById(id) {
  return prisma.branch.findUnique({
    where: { id },
    include: { manager: true, company: true, _count: { select: { users: true, sales: true, stocks: true } } },
  })
}

export async function createBranch(data, createdBy) {
  const code = data.code || generateBranchCode(data.name)
  const existing = await prisma.branch.findUnique({ where: { code } })
  if (existing) throw { status: 409, message: "Branch code already exists" }

  const branch = await prisma.branch.create({
    data: {
      name: data.name,
      code,
      location: data.location || "",
      phone: data.phone || "",
      managerId: data.managerId || null,
      openingBalance: data.openingBalance || 0,
      companyId: data.companyId || createdBy?.companyId || null,
    },
  })

  await createAuditLog({ userId: createdBy.id, companyId: branch.companyId, action: "BRANCH_CREATED", entity: "Branch", entityId: branch.id, newValues: { name: branch.name, code: branch.code } })

  return branch
}

export async function updateBranch(id, data, updatedBy) {
  const branch = await prisma.branch.findUnique({ where: { id } })
  if (!branch) throw { status: 404, message: "Branch not found" }

  const updated = await prisma.branch.update({ where: { id }, data })
  await createAuditLog({ userId: updatedBy.id, companyId: branch.companyId, action: "BRANCH_UPDATED", entity: "Branch", entityId: id, oldValues: { name: branch.name }, newValues: data })

  return updated
}

export async function deleteBranch(id) {
  const branch = await prisma.branch.findUnique({ where: { id } })
  if (!branch) throw { status: 404, message: "Branch not found" }

  await prisma.branch.delete({ where: { id } })
  return { success: true }
}

export async function getCompany(companyId) {
  return prisma.company.findUnique({ where: { id: companyId } })
}

export async function updateCompany(companyId, data, updatedBy) {
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) throw { status: 404, message: "Company not found" }

  const updated = await prisma.company.update({ where: { id: companyId }, data })
  await createAuditLog({ userId: updatedBy.id, companyId, action: "COMPANY_UPDATED", entity: "Company", entityId: companyId, oldValues: { name: company.name }, newValues: data })

  return updated
}
