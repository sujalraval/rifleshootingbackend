import prisma from '../../core/prisma';

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

  async create(data: any) {
    const existing = await prisma.role.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new Error('Role with this name already exists');
    }

    const { permissions, ...roleData } = data;

    return prisma.role.create({
      data: {
        ...roleData,
        permissions: {
          create: permissions || []
        }
      },
      include: {
        permissions: true
      }
    });
  }

  async update(id: string, data: any) {
    const { permissions, ...roleData } = data;
    
    if (roleData.name) {
      const existing = await prisma.role.findUnique({ where: { name: roleData.name } });
      if (existing && existing.id !== id) {
        throw new Error('Role name already in use by another role');
      }
    }

    if (permissions && Array.isArray(permissions)) {
      await prisma.rolePermission.deleteMany({
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

  async delete(id: string) {
    return prisma.role.delete({
      where: { id },
    });
  }
}
