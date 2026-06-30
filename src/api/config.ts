// export const API = import.meta.env.VITE_API_URL || "http://localhost:8080";
export const API = "http://localhost:8080";

export function authHeaders(token: string) {
    return {
        Authorization: `Bearer ${token}`,
    };
}

export async function handleAuthError(res: Response) {
    if (res.status === 401 || res.status === 403) {
        throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
    }
}