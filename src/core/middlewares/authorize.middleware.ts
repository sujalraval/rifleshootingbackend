import { Response, NextFunction } from 'express';
import prisma from '../prisma';
import { AuthRequest } from './auth.middleware';

type Action = 'read' | 'write' | 'delete';

// Module names (and aliases) as stored in RolePermission.module.
// Must stay in sync with SYSTEM_MODULES in the frontend (src/constants/modules.ts).
export const MODULES = {
  DASHBOARD: ['Dashboard', 'Executive Dashboard'],
  FINANCIAL_YEAR: ['Financial Year', 'Financial Year Master'],
  MEMBER: ['Member', 'Members', 'Member Profile'],
  S1: ['S1 Category', 'S1 Form', 'S1 Members'],
  GUEST: ['Guest', 'Guests'],
  USERS: ['System Users', 'Users', 'User Form'],
  ROLE_MASTER: ['Role Master', 'Roles'],
  ROLES_RIGHTS: ['Roles & Rights Master', 'Roles & Rights', 'Permissions'],
  MEMBERSHIP_NAME: ['Membership Name Master'],
  MEMBERSHIP_CHARGES: ['Membership Charges'],
  ISSUE_ITEM: ['Issue Item'],
  INSTITUTE: ['Institute Master'],
  ITEM_CATEGORY: ['Item Category Master'],
  ITEM_SUB_CATEGORY: ['Item Sub-Category Master'],
  ITEM_MASTER: ['Item Master'],
  INWARD: ['Inward Entry'],
  OUTWARD: ['Outward Entry'],
  CONFIRM_INWARD: ['Confirm Inward Entry'],
  RETURN: ['Return Item'],
  RETURN_CONFIRM: ['Return-Rejected Confirm'],
  DISCARD: ['Discard Item'],
  SALE: ['Sale Item'],
  UOM: ['UOM Master'],
  GST_RATE: ['GST Rate Master'],
  LOCKER: ['Locker Master'],
  ISSUE_LOCKER: ['Issue Locker'],
  PACKAGES: ['Packages'],
  ORG_SETTINGS: ['Organisation Settings'],
};

// Every screen that moves stock (they all read items, institutes and stock levels)
export const STOCK_SCREENS = [
  ...MODULES.INWARD, ...MODULES.OUTWARD, ...MODULES.CONFIRM_INWARD, ...MODULES.RETURN,
  ...MODULES.RETURN_CONFIRM, ...MODULES.DISCARD, ...MODULES.SALE,
];

const SUPER_ADMIN_ROLES = ['superadmin', 'admin'];

export const isSuperAdminRole = (role?: string | null) =>
  SUPER_ADMIN_ROLES.includes((role || '').trim().toLowerCase());

const actionForMethod = (method: string): Action => {
  if (method === 'GET' || method === 'HEAD') return 'read';
  if (method === 'DELETE') return 'delete';
  return 'write';
};

type ModuleSpec = string[] | Partial<Record<Action, string[]>>;

/**
 * Allows the request if the user's role grants the HTTP method's action (GET=read,
 * DELETE=delete, anything else=write) on any of the given modules. Super admins always pass.
 * An empty module list means "super admins only".
 */
export const authorize = (spec: ModuleSpec) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const role = req.user?.role;
      if (isSuperAdminRole(role)) return next();

      const action = actionForMethod(req.method);
      const modules = Array.isArray(spec) ? spec : spec[action] || [];
      const allowedNames = modules.map((m) => m.toLowerCase());

      if (role && allowedNames.length > 0) {
        const roleRecord = await prisma.role.findFirst({
          where: { name: { equals: role.trim(), mode: 'insensitive' }, status: { equals: 'active', mode: 'insensitive' } },
          include: { permissions: { where: { isDeleted: false } } },
        });

        const flag = action === 'read' ? 'canRead' : action === 'write' ? 'canWrite' : 'canDelete';
        const granted = roleRecord?.permissions.some(
          (p) => allowedNames.includes(p.module.toLowerCase()) && p[flag]
        );
        if (granted) return next();
      }

      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    } catch (error) {
      next(error);
    }
  };
};

export const requireSuperAdmin = authorize([]);
