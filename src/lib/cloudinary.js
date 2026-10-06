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
export async function uploadToCloudinary(buffer, folder = "nexlearn/bank_slips", filename = null) {
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

  const uploadOptions = {
    folder,
    resource_type: "auto",
  };

  if (filename) {
    uploadOptions.public_id = filename;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
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

/**
 * Deletes an asset from Cloudinary by its public_id
 * @param {string} public_id
 * @returns {Promise<any>}
 */
export async function deleteFromCloudinary(public_id) {
  if (!public_id) return null;
  try {
    return await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    return null;
  }
}

export default cloudinary;

