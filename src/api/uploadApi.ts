import { API, authHeaders, handleAuthError } from "./config";

export async function uploadImagesApi(token: string, files: File[]): Promise<string[]> {
    const formData = new FormData();

    files.forEach((file) => {
        formData.append("files", file);
    });

    const res = await fetch(`${API}/api/videos/upload`, {
        method: "POST",
        headers: authHeaders(token),
        body: formData,
    });

    await handleAuthError(res);

    if (!res.ok) {
        throw new Error("Upload ảnh thất bại");
    }

    const data = await res.json();
    return data.imagePaths || data.images || [];
}