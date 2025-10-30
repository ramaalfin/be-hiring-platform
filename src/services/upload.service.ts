import cloudinary from "../lib/cloudinary";

export const uploadImageToCloudinary = async (file: Buffer, filename: string) => {
    const result = await cloudinary.uploader.upload_stream({
        folder: "applications",
        public_id: filename,
    });

    return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "applications", public_id: filename },
            (error, result) => {
                if (error) reject(error);
                else resolve(result?.secure_url!);
            }
        );
        stream.end(file);
    });
};
