import { API, authHeaders } from "./config";
import type { CreateUserRequest, UserResponse } from "../types/user";

export async function getUsersApi(token: string): Promise<UserResponse[]> {
    const res = await fetch(`${API}/api/admin/users`, {
        headers: authHeaders(token),
    });

    if (!res.ok) {
        throw new Error("Không tải được danh sách user");
    }

    return res.json();
}

export async function createUserApi(
    token: string,
    request: CreateUserRequest
): Promise<UserResponse> {
    const res = await fetch(`${API}/api/admin/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(token),
        },
        body: JSON.stringify(request),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Tạo user thất bại");
    }

    return res.json();
}