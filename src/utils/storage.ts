export function getStoredToken(): string {
    return localStorage.getItem("token") || "";
}

export function getStoredUsername(): string {
    return localStorage.getItem("username") || "";
}

export function getStoredRoles(): string[] {
    try {
        return JSON.parse(localStorage.getItem("roles") || "[]");
    } catch {
        return [];
    }
}

export function saveAuth(token: string, username: string, roles: string[]) {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("roles", JSON.stringify(roles || []));
}

export function clearAuthStorage() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("roles");
}