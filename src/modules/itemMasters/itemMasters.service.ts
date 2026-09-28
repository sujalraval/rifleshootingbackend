import prisma from '../../core/prisma';
import { CategoryInput, ItemInput, SubCategoryInput } from './itemMasters.schema';

const byNewest = { createdAt: 'desc' as const };
const toggled = (status: string) => (status === 'Active' ? 'Inactive' : 'Active');

// ---------- Item categories ----------

const assertCategoryNameFree = async (name: string, excludeId?: string) => {
  const clash = await prisma.itemCategory.findFirst({
    where: { name: { equals: name, mode: 'insensitive' }, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (clash) throw new Error('Category name already exists.');
};

export const listCategories = () =>
  prisma.itemCategory.findMany({
    orderBy: byNewest,
    include: { _count: { select: { subCategories: { where: { isDeleted: false } }, items: { where: { isDeleted: false } } } } },
  });

export const createCategory = async (data: CategoryInput & { name: string }) => {
  await assertCategoryNameFree(data.name);
  return prisma.itemCategory.create({ data });
};

export const updateCategory = async (id: string, data: CategoryInput) => {
  if (data.name) await assertCategoryNameFree(data.name, id);
  return prisma.itemCategory.update({ where: { id }, data });
};

export const toggleCategory = async (id: string) => {
  const category = await prisma.itemCategory.findUnique({ where: { id } });
  if (!category) throw new Error('Category not found');
  return prisma.itemCategory.update({ where: { id }, data: { status: toggled(category.status) } });
};

export const deleteCategory = async (id: string) => {
  const [subCategories, items] = await Promise.all([
    prisma.itemSubCategory.count({ where: { categoryId: id } }),
    prisma.item.count({ where: { categoryId: id } }),
  ]);
  if (subCategories > 0 || items > 0) {
    throw new Error(`Cannot delete: this category still has ${subCategories} sub-categories and ${items} items.`);
  }
  return prisma.itemCategory.delete({ where: { id } });
};

// ---------- Item sub-categories ----------

const assertSubCategoryNameFree = async (name: string, categoryId: string, excludeId?: string) => {
  const clash = await prisma.itemSubCategory.findFirst({
    where: {
      categoryId,
      name: { equals: name, mode: 'insensitive' },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
  if (clash) throw new Error('This sub-category name already exists under the selected parent category.');
};

const assertCategoryExists = async (categoryId: string) => {
  const category = await prisma.itemCategory.findUnique({ where: { id: categoryId } });
  if (!category) throw new Error('Selected parent category does not exist.');
};

export const listSubCategories = (categoryId?: string) =>
  prisma.itemSubCategory.findMany({
    where: categoryId ? { categoryId } : {},
    orderBy: byNewest,
    include: { category: { select: { id: true, name: true } } },
  });

export const createSubCategory = async (data: SubCategoryInput & { name: string; categoryId: string }) => {
  await assertCategoryExists(data.categoryId);
  await assertSubCategoryNameFree(data.name, data.categoryId);
  return prisma.itemSubCategory.create({ data, include: { category: { select: { id: true, name: true } } } });
};

export const updateSubCategory = async (id: string, data: SubCategoryInput) => {
  const existing = await prisma.itemSubCategory.findUnique({ where: { id } });
  if (!existing) throw new Error('Sub-category not found');

  const categoryId = data.categoryId ?? existing.categoryId;
  if (data.categoryId) await assertCategoryExists(data.categoryId);
  if (data.categoryId && data.categoryId !== existing.categoryId) {
    const items = await prisma.item.count({ where: { subCategoryId: id } });
    if (items > 0) throw new Error(`Cannot move to another category: ${items} items use this sub-category.`);
  }
  await assertSubCategoryNameFree(data.name ?? existing.name, categoryId, id);

  return prisma.itemSubCategory.update({
    where: { id },
    data,
    include: { category: { select: { id: true, name: true } } },
  });
};

export const toggleSubCategory = async (id: string) => {
  const subCategory = await prisma.itemSubCategory.findUnique({ where: { id } });
  if (!subCategory) throw new Error('Sub-category not found');
  return prisma.itemSubCategory.update({ where: { id }, data: { status: toggled(subCategory.status) } });
};

export const deleteSubCategory = async (id: string) => {
  const items = await prisma.item.count({ where: { subCategoryId: id } });
  if (items > 0) throw new Error(`Cannot delete: ${items} items use this sub-category.`);
  return prisma.itemSubCategory.delete({ where: { id } });
};

// ---------- Items ----------

const itemInclude = {
  category: { select: { id: true, name: true } },
  subCategory: { select: { id: true, name: true } },
};

// The sub-category must belong to the chosen category
const assertValidClassification = async (categoryId: string, subCategoryId: string) => {
  const subCategory = await prisma.itemSubCategory.findUnique({ where: { id: subCategoryId } });
  if (!subCategory) throw new Error('Selected sub-category does not exist.');
  if (subCategory.categoryId !== categoryId) {
    throw new Error('Selected sub-category does not belong to the selected category.');
  }
};

// Only licensed items carry a licence sub-type
const normaliseLicence = (data: ItemInput) =>
  data.licenceType === 'Non-Licence' ? { ...data, licenceSub: null } : data;

export const listItems = () => prisma.item.findMany({ orderBy: byNewest, include: itemInclude });

export const createItem = async (data: ItemInput & { categoryId: string; subCategoryId: string; name: string; uom: string }) => {
  await assertValidClassification(data.categoryId, data.subCategoryId);
  return prisma.item.create({ data: normaliseLicence(data) as typeof data, include: itemInclude });
};

export const updateItem = async (id: string, data: ItemInput) => {
  const existing = await prisma.item.findUnique({ where: { id } });
  if (!existing) throw new Error('Item not found');
  if (data.categoryId || data.subCategoryId) {
    await assertValidClassification(data.categoryId ?? existing.categoryId, data.subCategoryId ?? existing.subCategoryId);
  }
  return prisma.item.update({ where: { id }, data: normaliseLicence(data), include: itemInclude });
};

export const toggleItem = async (id: string) => {
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) throw new Error('Item not found');
  return prisma.item.update({ where: { id }, data: { status: toggled(item.status) }, include: itemInclude });
};

export const deleteItem = (id: string) => prisma.item.delete({ where: { id } });
