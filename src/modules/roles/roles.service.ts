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

    // Since updating nested relations completely can be tricky,
    // we delete old permissions and create new ones if permissions are provided
    if (permissions) {
      await prisma.rolePermission.deleteMany({
        where: { roleId: id }
      });
    }

    return prisma.role.update({
      where: { id },
      data: {
        ...roleData,
        ...(permissions ? {
          permissions: {
            create: permissions
          }
        } : {})
      },
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
