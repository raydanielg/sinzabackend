import { prisma } from "../../config/prisma.js"

export async function listCustomers(filters = {}) {
  const where = {}
  if (filters.companyId) where.companyId = filters.companyId
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ]
  }

  return prisma.customer.findMany({
    where,
    include: { _count: { select: { sales: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function getCustomerById(id) {
  return prisma.customer.findUnique({
    where: { id },
    include: { sales: { include: { items: true, payments: true }, orderBy: { createdAt: "desc" }, take: 20 } },
  })
}

export async function createCustomer(data, user) {
  return prisma.customer.create({
    data: {
      name: data.name,
      phone: data.phone || "",
      email: data.email || "",
      address: data.address || "",
      companyId: data.companyId || user?.companyId || null,
    },
  })
}

export async function updateCustomer(id, data) {
  return prisma.customer.update({ where: { id }, data })
}

export async function deleteCustomer(id) {
  await prisma.customer.delete({ where: { id } })
  return { success: true }
}
