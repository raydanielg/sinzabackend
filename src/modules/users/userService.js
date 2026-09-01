import bcrypt from "bcryptjs"
import { prisma } from "../../config/prisma.js"
import { createAuditLog } from "../../utils/audit.js"

export async function listUsers(filters = {}) {
  const where = {}
  if (filters.companyId) where.companyId = filters.companyId
  if (filters.branchId) where.branchId = filters.branchId
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ]
  }

  return prisma.user.findMany({
    where,
    include: {
      userRoles: { include: { role: true } },
      branch: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: { userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } }, branch: true, company: true },
  })
}

export async function createUser(data, createdBy) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw { status: 409, message: "Email already registered" }

  const hashed = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      phone: data.phone || "",
      companyId: data.companyId || createdBy?.companyId || null,
      branchId: data.branchId || null,
    },
  })

  if (data.roleIds && data.roleIds.length > 0) {
    await prisma.userRole.createMany({
      data: data.roleIds.map((roleId) => ({ userId: user.id, roleId })),
    })
  }

  await createAuditLog({ userId: createdBy.id, companyId: user.companyId, action: "USER_CREATED", entity: "User", entityId: user.id, newValues: { name: user.name, email: user.email } })

  return getUserById(user.id)
}

export async function updateUser(id, data, updatedBy) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw { status: 404, message: "User not found" }

  const updateData = {}
  if (data.name) updateData.name = data.name
  if (data.email) updateData.email = data.email
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.branchId !== undefined) updateData.branchId = data.branchId
  if (data.status) updateData.status = data.status
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10)

  if (Object.keys(updateData).length > 0) {
    await prisma.user.update({ where: { id }, data: updateData })
  }

  if (data.roleIds) {
    await prisma.userRole.deleteMany({ where: { userId: id } })
    if (data.roleIds.length > 0) {
      await prisma.userRole.createMany({ data: data.roleIds.map((roleId) => ({ userId: id, roleId })) })
    }
  }

  await createAuditLog({ userId: updatedBy.id, companyId: user.companyId, action: "USER_UPDATED", entity: "User", entityId: id, oldValues: { name: user.name }, newValues: updateData })

  return getUserById(id)
}

export async function deleteUser(id, deletedBy) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw { status: 404, message: "User not found" }

  await prisma.userRole.deleteMany({ where: { userId: id } })
  await prisma.user.delete({ where: { id } })

  await createAuditLog({ userId: deletedBy.id, companyId: user.companyId, action: "USER_DELETED", entity: "User", entityId: id })

  return { success: true }
}

export async function listRoles() {
  return prisma.role.findMany({
    include: { rolePermissions: { include: { permission: true } }, _count: { select: { userRoles: true } } },
    orderBy: { name: "asc" },
  })
}

export async function createRole(data, createdBy) {
  const existing = await prisma.role.findUnique({ where: { name: data.name } })
  if (existing) throw { status: 409, message: "Role already exists" }

  const role = await prisma.role.create({ data: { name: data.name, description: data.description || "" } })

  if (data.permissionIds && data.permissionIds.length > 0) {
    await prisma.rolePermission.createMany({
      data: data.permissionIds.map((pid) => ({ roleId: role.id, permissionId: pid })),
    })
  }

  await createAuditLog({ userId: createdBy.id, action: "ROLE_CREATED", entity: "Role", entityId: role.id, newValues: { name: role.name } })

  return role
}

export async function updateRole(id, data, updatedBy) {
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) throw { status: 404, message: "Role not found" }
  if (role.isSystem && data.name && data.name !== role.name) throw { status: 400, message: "Cannot rename system role" }

  const updateData = {}
  if (data.name) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description

  if (Object.keys(updateData).length > 0) {
    await prisma.role.update({ where: { id }, data: updateData })
  }

  if (data.permissionIds) {
    await prisma.rolePermission.deleteMany({ where: { roleId: id } })
    if (data.permissionIds.length > 0) {
      await prisma.rolePermission.createMany({ data: data.permissionIds.map((pid) => ({ roleId: id, permissionId: pid })) })
    }
  }

  await createAuditLog({ userId: updatedBy.id, action: "ROLE_UPDATED", entity: "Role", entityId: id })

  return prisma.role.findUnique({ where: { id }, include: { rolePermissions: { include: { permission: true } } } })
}

export async function deleteRole(id) {
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) throw { status: 404, message: "Role not found" }
  if (role.isSystem) throw { status: 400, message: "Cannot delete system role" }

  await prisma.role.delete({ where: { id } })
  return { success: true }
}

export async function listPermissions() {
  return prisma.permission.findMany({ orderBy: [{ module: "asc" }, { name: "asc" }] })
}
