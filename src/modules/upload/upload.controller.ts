import { Request, Response } from 'express';

export const uploadFile = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    const url = `/uploads/${req.file.filename}`;
    return res.status(200).json({ url, filename: req.file.filename, originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Upload failed.' });
  }
};

export const uploadMultipleFiles = (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }
    const files = (req.files as Express.Multer.File[]).map(f => ({
      url: `/uploads/${f.filename}`,
      filename: f.filename,
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
    }));
    return res.status(200).json({ files });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Upload failed.' });
  }
};
