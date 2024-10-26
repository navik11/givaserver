import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFileUri) => {
    try {
        if (!localFileUri) return null;
        const response = await cloudinary.uploader.upload(localFileUri, {
            resource_type: "auto",
        });
        fs.unlinkSync(localFileUri);
        return response;
    } catch {
        fs.unlinkSync(localFileUri);
        return null;
    }
};

export { uploadOnCloudinary };
