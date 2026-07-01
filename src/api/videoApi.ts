import { API, authHeaders, handleAuthError } from "./config";
import type {
    CreateVideoRequest,
    VideoCategory,
    VideoJob,
    VideoPage,
    VideoQuota,
    VideoStyle,
} from "../types/video";

export async function createVideoApi(
    token: string,
    productName: string,
    affiliateLink: string,
    imagePaths: string[],
    style: VideoStyle = "REVIEW",
    category: VideoCategory = "GENERAL"
): Promise<VideoJob> {
    const body: CreateVideoRequest & { imagePaths: string[] } = {
        productName,
        affiliateLink,
        imagePaths,
        style,
        category,
    };

    const res = await fetch(`${API}/api/videos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(token),
        },
        body: JSON.stringify(body),
    });

    await handleAuthError(res);

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Tạo job lỗi");
    }

    return res.json();
}

export async function getVideoJobApi(token: string, jobId: string): Promise<VideoJob> {
    const res = await fetch(`${API}/api/videos/${jobId}`, {
        headers: authHeaders(token),
    });

    await handleAuthError(res);

    if (!res.ok) {
        throw new Error("Không lấy được trạng thái job");
    }

    return res.json();
}

export async function getVideoHistoryApi(
    token: string,
    page: number,
    size: number
): Promise<VideoPage> {
    const res = await fetch(`${API}/api/videos?page=${page}&size=${size}`, {
        headers: authHeaders(token),
    });

    await handleAuthError(res);

    if (!res.ok) {
        throw new Error("Không tải được lịch sử video");
    }

    return res.json();
}

export async function getVideoQuotaApi(token: string): Promise<VideoQuota> {
    const res = await fetch(`${API}/api/videos/quota`, {
        headers: authHeaders(token),
    });

    await handleAuthError(res);

    if (!res.ok) {
        throw new Error("Không tải được quota video");
    }

    return res.json();
}