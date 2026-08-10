const fs = require('fs');
const path = require('path');

const modules = [
  { name: 'leads', model: 'lead' },
  { name: 'employees', model: 'employee' },
  { name: 'assets', model: 'asset' },
  { name: 'payments', model: 'payment' },
  { name: 'incidents', model: 'incident' },
  { name: 'training', model: 'trainingBatch' },
  { name: 'guests', model: 'guest' }
];

const basePath = path.join(__dirname, 'src', 'modules');

modules.forEach(mod => {
  const modPath = path.join(basePath, mod.name);

  // 1. Write Schema
  const schemaContent = `import { z } from 'zod';

export const createSchema = z.any(); // Basic validation, can be expanded based on Prisma schema
export const updateSchema = z.any();
`;
  fs.writeFileSync(path.join(modPath, `${mod.name}.schema.ts`), schemaContent);

  // 2. Write Service
  const serviceContent = `import prisma from '../../core/prisma';

export const findAll = async () => {
  return await prisma.${mod.model}.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const findById = async (id: string) => {
  const record = await prisma.${mod.model}.findUnique({ where: { id } });
  if (!record) throw new Error('Record not found');
  return record;
};

export const create = async (data: any) => {
  return await prisma.${mod.model}.create({ data });
};

export const update = async (id: string, data: any) => {
  return await prisma.${mod.model}.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  return await prisma.${mod.model}.delete({
    where: { id }
  });
};
`;
  fs.writeFileSync(path.join(modPath, `${mod.name}.service.ts`), serviceContent);

  // 3. Write Controller
  const controllerContent = `import { Request, Response } from 'express';
import * as service from './${mod.name}.service';
import { createSchema, updateSchema } from './${mod.name}.schema';

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await service.findAll();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const data = await service.findById(req.params.id as string);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createSchema.parse(req.body);
    const data = await service.create(validatedData);
    res.status(201).json({ message: 'Record created successfully', data });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const validatedData = updateSchema.parse(req.body);
    const data = await service.update(req.params.id as string, validatedData);
    res.status(200).json({ message: 'Record updated successfully', data });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id as string);
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
`;
  fs.writeFileSync(path.join(modPath, `${mod.name}.controller.ts`), controllerContent);

  // 4. Write Routes
  const routesContent = `import { Router } from 'express';
import { getAll, getById, create, update, remove } from './${mod.name}.controller';
import { protect } from '../../core/middlewares/auth.middleware';

const router = Router();

router.route('/')
  .get(protect, getAll)
  .post(protect, create);

router.route('/:id')
  .get(protect, getById)
  .put(protect, update)
  .delete(protect, remove);

export default router;
`;
  fs.writeFileSync(path.join(modPath, `${mod.name}.routes.ts`), routesContent);

  console.log('Successfully generated CRUD for ' + mod.name);
});
