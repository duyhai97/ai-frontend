import { API, authHeaders, handleAuthError } from "./config";
import type { PurchasePage, PurchaseOrder, PurchaseQrResponse } from "../types/purchase";

export async function generateVideo10QrApi(token: string): Promise<PurchaseQrResponse> {
    const res = await fetch(`${API}/api/purchases/video10/qr`, {
        method: "POST",
        headers: authHeaders(token),
    });

    await handleAuthError(res);

    if (!res.ok) {
        throw new Error("Tạo QR mua lượt thất bại");
    }

    return res.json();
}

export async function getMyPurchasesApi(
    token: string,
    page: number,
    size: number
): Promise<PurchasePage> {
    const res = await fetch(`${API}/api/purchases?page=${page}&size=${size}`, {
        headers: authHeaders(token),
    });

    await handleAuthError(res);

    if (!res.ok) {
        throw new Error("Không tải được lịch sử mua");
    }

    return res.json();
}

export async function getMyPurchaseQrApi(
    token: string,
    orderId: string
): Promise<PurchaseQrResponse> {
    const res = await fetch(`${API}/api/purchases/${orderId}`, {
        headers: authHeaders(token),
    });

    await handleAuthError(res);

    if (!res.ok) {
        throw new Error("Không lấy được QR");
    }

    return res.json();
}

export async function getAdminPurchasesApi(
    token: string,
    page: number,
    size: number,
    status?: string
): Promise<PurchasePage> {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));
    if (status) params.set("status", status);

    const res = await fetch(`${API}/api/admin/purchases?${params.toString()}`, {
        headers: authHeaders(token),
    });

    await handleAuthError(res);

    if (!res.ok) {
        throw new Error("Không tải được danh sách đơn mua");
    }

    return res.json();
}

export async function markPurchasePaidApi(
    token: string,
    orderId: string
): Promise<PurchaseOrder> {
    const res = await fetch(`${API}/api/admin/purchases/${orderId}/paid`, {
        method: "PUT",
        headers: authHeaders(token),
    });

    await handleAuthError(res);

    if (!res.ok) {
        throw new Error("Duyệt đơn thất bại");
    }

    return res.json();
}