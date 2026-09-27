import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim().replace(/^["']|["']$/g, ""),
  api_key: process.env.CLOUDINARY_API_KEY?.trim().replace(/^["']|["']$/g, ""),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim().replace(/^["']|["']$/g, ""),
  secure: true,
});

/**
 * Uploads a file Buffer to Cloudinary
 * @param {Buffer} buffer - File buffer to upload
 * @param {string} folder - Destination folder in Cloudinary
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export async function uploadToCloudinary(buffer, folder = "nexlearn/bank_slips") {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim().replace(/^["']|["']$/g, "");
  const api_key = process.env.CLOUDINARY_API_KEY?.trim().replace(/^["']|["']$/g, "");
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim().replace(/^["']|["']$/g, "");

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Cloudinary credentials missing in .env! Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error Details:", error);
          return reject(error);
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });
}

export default cloudinary;
