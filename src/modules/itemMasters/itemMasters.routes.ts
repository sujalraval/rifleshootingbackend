import { Router } from 'express';
import * as controller from './itemMasters.controller';
import { protect } from '../../core/middlewares/auth.middleware';
import { authorize, MODULES } from '../../core/middlewares/authorize.middleware';

// Each master is editable from its own screen; the screens further down the chain
// (sub-category, item) also need to read their parents to fill the dropdowns.
const masterRouter = (own: string[], readers: string[]) => {
  const router = Router();
  router.use(protect, authorize({ read: [...own, ...readers], write: own, delete: own }));
  return router;
};

export const itemCategoryRoutes = masterRouter(MODULES.ITEM_CATEGORY, [...MODULES.ITEM_SUB_CATEGORY, ...MODULES.ITEM_MASTER]);
itemCategoryRoutes.get('/', controller.listCategories);
itemCategoryRoutes.post('/', controller.createCategory);
itemCategoryRoutes.put('/:id', controller.updateCategory);
itemCategoryRoutes.patch('/:id/toggle', controller.toggleCategory);
itemCategoryRoutes.delete('/:id', controller.deleteCategory);

export const itemSubCategoryRoutes = masterRouter(MODULES.ITEM_SUB_CATEGORY, MODULES.ITEM_MASTER);
itemSubCategoryRoutes.get('/', controller.listSubCategories); // optional ?categoryId=
itemSubCategoryRoutes.post('/', controller.createSubCategory);
itemSubCategoryRoutes.put('/:id', controller.updateSubCategory);
itemSubCategoryRoutes.patch('/:id/toggle', controller.toggleSubCategory);
itemSubCategoryRoutes.delete('/:id', controller.deleteSubCategory);

export const itemRoutes = masterRouter(MODULES.ITEM_MASTER, []);
itemRoutes.get('/', controller.listItems);
itemRoutes.post('/', controller.createItem);
itemRoutes.put('/:id', controller.updateItem);
itemRoutes.patch('/:id/toggle', controller.toggleItem);
itemRoutes.delete('/:id', controller.deleteItem);
