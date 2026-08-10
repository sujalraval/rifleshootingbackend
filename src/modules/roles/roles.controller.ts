import { Request, Response } from 'express';
import { RolesService } from './roles.service';

const rolesService = new RolesService();

export class RolesController {
  async getAll(req: Request, res: Response) {
    try {
      const roles = await rolesService.getAll();
      res.json({ success: true, data: roles });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const role = await rolesService.getById(req.params.id as string);
      if (!role) {
        return res.status(404).json({ success: false, message: 'Role not found' });
      }
      res.json({ success: true, data: role });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const role = await rolesService.create(req.body);
      res.status(201).json({ success: true, data: role });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const role = await rolesService.update(req.params.id as string, req.body);
      res.json({ success: true, data: role });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await rolesService.delete(req.params.id as string);
      res.json({ success: true, message: 'Role deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
