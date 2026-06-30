import { API } from "./config";
import type { LoginResponse } from "../types/auth";

export async function loginApi(username: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        throw new Error("Sai tài khoản hoặc mật khẩu");
    }

    return res.json();
}