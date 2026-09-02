import { prisma } from "../../config/prisma.js"

export async function listGroups(companyId) {
  return prisma.accountGroup.findMany({
    where: { companyId },
    include: { accounts: true },
    orderBy: { name: "asc" },
  })
}

export async function createGroup(data, user) {
  return prisma.accountGroup.create({
    data: {
      name: data.name,
      type: data.type || "asset",
      companyId: user.companyId || "",
    },
  })
}

export async function listAccounts(filters = {}) {
  const where = {}
  if (filters.companyId) where.companyId = filters.companyId
  if (filters.branchId) where.branchId = filters.branchId
  if (filters.groupId) where.groupId = filters.groupId
  if (filters.parentId) where.parentId = filters.parentId

  return prisma.account.findMany({
    where,
    include: {
      group: true,
      parent: true,
      branch: true,
      children: { include: { branch: true } },
    },
    orderBy: { name: "asc" },
  })
}

export async function getAccount(id) {
  return prisma.account.findUnique({
    where: { id },
    include: {
      group: true,
      parent: true,
      branch: true,
      children: { include: { branch: true } },
    },
  })
}

export async function createAccount(data, user) {
  return prisma.account.create({
    data: {
      name: data.name,
      code: data.code || "",
      currency: data.currency || "TZS",
      balance: data.balance || 0,
      status: data.status || "active",
      companyId: user.companyId || "",
      branchId: data.branchId || null,
      groupId: data.groupId || null,
      parentId: data.parentId || null,
    },
    include: { group: true, parent: true, branch: true },
  })
}

export async function updateAccount(id, data) {
  return prisma.account.update({
    where: { id },
    data: {
      name: data.name,
      code: data.code,
      currency: data.currency,
      status: data.status,
      branchId: data.branchId || null,
      groupId: data.groupId || null,
      parentId: data.parentId || null,
    },
    include: { group: true, parent: true, branch: true },
  })
}

export async function deleteAccount(id) {
  return prisma.account.delete({ where: { id } })
}

export async function getBankingOverview(companyId, branchId) {
  const where = { companyId }
  if (branchId) where.branchId = branchId

  const accounts = await prisma.account.findMany({
    where,
    include: {
      group: true,
      parent: true,
      children: { include: { branch: true, group: true } },
    },
    orderBy: { name: "asc" },
  })

  const groups = await prisma.accountGroup.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
  })

  const bankGroup = groups.find((g) => g.name.toLowerCase().includes("bank"))
  const cashGroup = groups.find((g) => g.name.toLowerCase().includes("cash") || g.name.toLowerCase().includes("mobile"))
  const pettyGroup = groups.find((g) => g.name.toLowerCase().includes("petty"))

  const bankAccounts = accounts.filter((a) => {
    if (bankGroup && a.groupId === bankGroup.id) return true
    if (a.parent && a.parent.name && a.parent.name.toLowerCase().includes("bank")) return true
    return a.name.toLowerCase().includes("bank")
  })

  const cashAccounts = accounts.filter((a) => {
    if (cashGroup && a.groupId === cashGroup.id) return true
    if (a.parent && a.parent.name && (a.parent.name.toLowerCase().includes("cash") || a.parent.name.toLowerCase().includes("mobile"))) return true
    return false
  })

  const pettyAccounts = accounts.filter((a) => {
    if (pettyGroup && a.groupId === pettyGroup.id) return true
    if (a.parent && a.parent.name && a.parent.name.toLowerCase().includes("petty")) return true
    return false
  })

  function buildSection(sectionAccounts, sectionName) {
    const parentAccounts = sectionAccounts.filter((a) => !a.parentId)
    const result = []
    for (const parent of parentAccounts) {
      const children = sectionAccounts.filter((a) => a.parentId === parent.id)
      const childBalance = children.reduce((sum, c) => sum + (c.balance || 0), 0)
      result.push({
        ...parent,
        children,
        computedBalance: childBalance,
      })
    }
    return {
      name: sectionName,
      totalBalance: result.reduce((sum, r) => sum + r.computedBalance, 0),
      parentAccounts: result,
    }
  }

  return {
    bank: buildSection(bankAccounts, "Bank"),
    cashOnHand: {
      ...buildSection(cashAccounts, "Cash on Hand"),
      pettyCash: buildSection(pettyAccounts, "Petty Cash"),
    },
    groups,
    allAccounts: accounts,
  }
}
