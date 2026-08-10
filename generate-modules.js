const fs = require('fs');
const path = require('path');

const modules = [
  'leads', 'employees', 'inventory', 'assets', 'ammunition', 
  'payments', 'incidents', 'training', 'guests', 'issues', 'branches'
];

const basePath = path.join(__dirname, 'src', 'modules');

modules.forEach(mod => {
  const modPath = path.join(basePath, mod);
  if (!fs.existsSync(modPath)) {
    fs.mkdirSync(modPath, { recursive: true });
  }

  // Controller
  const controllerContent = `import { Request, Response } from 'express';
import * as ${mod}Service from './${mod}.service';

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await ${mod}Service.findAll();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
`;
  fs.writeFileSync(path.join(modPath, `${mod}.controller.ts`), controllerContent);

  // Service
  const serviceContent = `import prisma from '../../core/prisma';

export const findAll = async () => {
  // Replace 'modelName' with actual Prisma model in real implementation
  // return await prisma.modelName.findMany();
  return [];
};
`;
  fs.writeFileSync(path.join(modPath, `${mod}.service.ts`), serviceContent);

  // Routes
  const routesContent = `import { Router } from 'express';
import { getAll } from './${mod}.controller';
import { protect } from '../../core/middlewares/auth.middleware';

const router = Router();

router.get('/', protect, getAll);

export default router;
`;
  fs.writeFileSync(path.join(modPath, `${mod}.routes.ts`), routesContent);
  
  console.log(`Generated module: ${mod}`);
});

// Update server.ts
let serverContent = fs.readFileSync(path.join(__dirname, 'src', 'server.ts'), 'utf-8');

const imports = modules.map(mod => `import ${mod}Routes from './modules/${mod}/${mod}.routes';`).join('\n');
const uses = modules.map(mod => `app.use('/api/${mod}', ${mod}Routes);`).join('\n');

// A very naive replacement just appending to the top and before the health route
if (!serverContent.includes('import leadsRoutes')) {
  serverContent = serverContent.replace(
    "import memberRoutes from './modules/members/members.routes';",
    `import memberRoutes from './modules/members/members.routes';\n${imports}`
  );
  
  serverContent = serverContent.replace(
    "app.use('/api/members', memberRoutes);",
    `app.use('/api/members', memberRoutes);\n${uses}`
  );
  
  fs.writeFileSync(path.join(__dirname, 'src', 'server.ts'), serverContent);
  console.log('Updated server.ts');
}
