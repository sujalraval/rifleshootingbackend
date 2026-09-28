import prisma, { rawPrisma } from '../../core/prisma';
import { isSuperAdminRole } from '../../core/middlewares/authorize.middleware';
import { AuthUser } from '../../core/middlewares/auth.middleware';

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
    const existing = await prisma.role.findUnique({ where: { name: data.name } });
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
    if (!current) throw new Error('Role not found');
    assertCanUseRoleName(actor, current.name);
    assertCanUseRoleName(actor, roleData.name);
    if (!isSuperAdminRole(actor.role) && current.name.trim().toLowerCase() === (actor.role || '').trim().toLowerCase()) {
      throw new Error('You cannot change your own role');
    }
    
    if (roleData.name) {
      const existing = await prisma.role.findUnique({ where: { name: roleData.name } });
      if (existing && existing.id !== id) {
        throw new Error('Role name already in use by another role');
      }
    }

    if (permissions && Array.isArray(permissions)) {
      // Hard delete existing permissions for this role so they don't violate unique constraint (roleId, module)
      await rawPrisma.rolePermission.deleteMany({
        where: { roleId: id }
      });

      // Filter and map permissions to required shape
      const sanitizedPermissions = permissions.map((p: any) => ({
        module: p.module,
        canRead: Boolean(p.canRead),
        canWrite: Boolean(p.canWrite),
        canDelete: Boolean(p.canDelete),
      }));

      return prisma.role.update({
        where: { id },
        data: {
          ...roleData,
          permissions: {
            create: sanitizedPermissions
          }
        },
        include: {
          permissions: true
        }
      });
    }

    return prisma.role.update({
      where: { id },
      data: roleData,
      include: {
        permissions: true
      }
    });
  }

  async delete(actor: AuthUser, id: string) {
    const current = await prisma.role.findUnique({ where: { id } });
    if (!current) throw new Error('Role not found');
    assertCanUseRoleName(actor, current.name);

    return prisma.role.delete({
      where: { id },
    });
  }
}
