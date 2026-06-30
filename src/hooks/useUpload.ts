import { useState } from "react";
import { uploadImagesApi } from "../api/uploadApi.ts";

export function useUpload(token: string, addLog: (msg: string) => void) {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [uploadedImagePaths, setUploadedImagePaths] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const uploadImages = async (files: File[]) => {
        if (files.length === 0) return [];

        setUploading(true);
        addLog(`Bắt đầu upload ${files.length} ảnh`);

        try {
            const paths = await uploadImagesApi(token, files);

            setUploadedImagePaths(paths);
            addLog(`Upload hoàn tất ${paths.length} ảnh`);

            return paths;
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        previewUrls.forEach((url) => URL.revokeObjectURL(url));

        setImageFiles(files);
        setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
        setUploadedImagePaths([]);

        addLog(`Đã chọn ${files.length} ảnh`);

        if (files.length > 0) {
            try {
                await uploadImages(files);
            } catch (err: any) {
                addLog(err.message || "Upload ảnh lỗi");
                alert(err.message || "Upload ảnh lỗi");
            }
        }
    };

    const removeImage = async (index: number) => {
        URL.revokeObjectURL(previewUrls[index]);

        const nextFiles = imageFiles.filter((_, i) => i !== index);
        const nextPreviewUrls = previewUrls.filter((_, i) => i !== index);

        setImageFiles(nextFiles);
        setPreviewUrls(nextPreviewUrls);
        setUploadedImagePaths([]);

        addLog(`Đã xoá ảnh ${index + 1}`);

        if (nextFiles.length > 0) {
            try {
                await uploadImages(nextFiles);
            } catch (err: any) {
                addLog(err.message || "Upload lại ảnh lỗi");
                alert(err.message || "Upload lại ảnh lỗi");
            }
        }
    };

    const clearImages = () => {
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
        setImageFiles([]);
        setPreviewUrls([]);
        setUploadedImagePaths([]);
    };

    return {
        imageFiles,
        previewUrls,
        uploadedImagePaths,
        uploading,
        uploadImages,
        handleFileChange,
        removeImage,
        clearImages,
    };
}