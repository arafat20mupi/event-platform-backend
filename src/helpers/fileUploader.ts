// helpers/fileUploader.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import multer from "multer";
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";
dotenv.config();

// --------------------------
// MULTER MEMORY STORAGE
// --------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --------------------------
// CLOUDINARY CONFIG (ENV)
// --------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --------------------------
// ১) Single File Upload → Cloudinary (Promise Based)
// --------------------------
const uploadToCloudinary = (
  file: Express.Multer.File
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file provided for upload"));

    const uploadStream = cloudinary.uploader.upload_stream(
      (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (err) return reject(err);
        if (!result) return reject(new Error("Cloudinary did not return result"));

        resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

// --------------------------
// ২) Middleware Version (Single Field)
// --------------------------
const uploadToCloudinaryMiddleware = (fieldName: string): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const anyReq = req as any;

      // Support: req.file OR req.files[fieldName][0]
      const file =
        (req as any).file ||
        (req.files && (req.files as any)[fieldName]?.[0]);

      if (!file) {
        return next();
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (err) {
            console.error("Cloudinary upload error:", err);
            return res.status(500).json({ error: err.message });
          }

          if (!result) {
            return res.status(500).json({ error: "Cloudinary did not return a result" });
          }

          // সফল হলে req[fieldName + "Url"] = secure_url
          anyReq[`${fieldName}Url`] = result.secure_url;

          console.log(`${fieldName} uploaded →`, result.secure_url);

          next();
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    } catch (err) {
      console.error("Cloudinary middleware error:", err);
      res.status(500).json({ error: "Image upload failed" });
    }
  };
};

// --------------------------
// EXPORTS
// --------------------------
export const fileUploader = {
  upload, // Multer middleware
  uploadToCloudinary,
  uploadToCloudinaryMiddleware,
};
