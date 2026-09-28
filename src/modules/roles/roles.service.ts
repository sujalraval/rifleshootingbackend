import prisma from '../../core/prisma';
import { isSuperAdminRole } from '../../core/middlewares/authorize.middleware';
import { AuthUser } from '../../core/middlewares/auth.middleware';
import { notFoundError } from '../../core/http';

// Only these fields may be set from the request; permissions are handled separately
const pickRoleFields = (data: any) => {
  const result: any = {};
  for (const key of ['name', 'description', 'status']) {
    if (data?.[key] !== undefined) result[key] = data[key];
  }
  return result;
};

// Role names like "Admin"/"SuperAdmin" bypass all permission checks, so only a super admin may create or edit them
const assertCanUseRoleName = (actor: AuthUser, name?: string | null) => {
  if (isSuperAdminRole(name) && !isSuperAdminRole(actor.role)) {
    throw new Error('Only a super admin can manage super admin roles');
  }
};

export class RolesService {
  async getAll() {
    return prisma.role.findMany({
      include: {
        permissions: true
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true
      }
    });
  }

  async create(actor: AuthUser, data: any) {
    assertCanUseRoleName(actor, data?.name);
    // Permissions are looked up by name ignoring case, so names must be unique ignoring case too
    const existing = await prisma.role.findFirst({ where: { name: { equals: String(data?.name ?? '').trim(), mode: 'insensitive' } } });
    if (existing) {
      throw new Error('Role with this name already exists');
    }

    const { permissions } = data;
    const roleData = pickRoleFields(data);

    return prisma.role.create({
      data: {
        ...roleData,
        permissions: {
          create: (permissions || []).map((p: any) => ({
            module: p.module,
            canRead: Boolean(p.canRead),
            canWrite: Boolean(p.canWrite),
            canDelete: Boolean(p.canDelete),
          }))
        }
      },
      include: {
        permissions: true
      }
    });
  }

  async update(actor: AuthUser, id: string, data: any) {
    const { permissions } = data;
    const roleData = pickRoleFields(data);

    const current = await prisma.role.findUnique({ where: { id } });
    if (!current) throw notFoundError('Role not found');
    assertCanUseRoleName(actor, current.name);
    assertCanUseRoleName(actor, roleData.name);
    if (!isSuperAdminRole(actor.role) && current.name.trim().toLowerCase() === (actor.role || '').trim().toLowerCase()) {
      throw new Error('You cannot change your own role');
    }
    
    if (roleData.name) {
      const existing = await prisma.role.findFirst({
        where: { name: { equals: String(roleData.name).trim(), mode: 'insensitive' }, id: { not: id } },
      });
      if (existing) {
        throw new Error('Role name already in use by another role');
      }
    }

    const renamed = typeof roleData.name === 'string' && roleData.name !== current.name;

    return prisma.$transaction(async (tx) => {
      if (permissions && Array.isArray(permissions)) {
        // Hard delete the old permission rows (a soft delete would keep the (roleId, module) unique key taken)
        await tx.$executeRaw`DELETE FROM "RolePermission" WHERE "roleId" = ${id}`;
      }

      const role = await tx.role.update({
        where: { id },
        data: {
          ...roleData,
          ...(permissions && Array.isArray(permissions)
            ? {
                permissions: {
                  create: permissions.map((p: any) => ({
                    module: p.module,
                    canRead: Boolean(p.canRead),
                    canWrite: Boolean(p.canWrite),
                    canDelete: Boolean(p.canDelete),
                  })),
                },
              }
            : {}),
        },
        include: {
          permissions: { where: { isDeleted: false } }
        }
      });

      // Users store their role by name; keep them on this role after a rename
      if (renamed) {
        await tx.user.updateMany({
          where: { role: { equals: current.name, mode: 'insensitive' } },
          data: { role: roleData.name },
        });
      }
      return role;
    });
  }

  async delete(actor: AuthUser, id: string) {
    const current = await prisma.role.findUnique({ where: { id } });
    if (!current) throw notFoundError('Role not found');
    assertCanUseRoleName(actor, current.name);
    const assigned = await prisma.user.count({ where: { role: { equals: current.name, mode: 'insensitive' } } });
    if (assigned > 0) throw new Error(`Cannot delete: ${assigned} users have this role. Reassign them first.`);

    // Its permission rows go with it
    return prisma.$transaction(async (tx) => {
      const role = await tx.role.delete({ where: { id } });
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      return role;
    });
  }
}
