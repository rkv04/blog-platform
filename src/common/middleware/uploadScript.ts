import multer from 'multer'
import type { Request } from 'express'

import { appConfig } from '../appConfig.js'


const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  // todo
};

export const uploadScript = multer({
  dest: appConfig.UPLOAD_TEMP_DIR,
  limits: { fileSize: 5 * 1024 * 1024 }
});