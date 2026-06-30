import { useState } from "react";
import type { LoginResponse } from "../types/auth";
import {
    clearAuthStorage,
    getStoredRoles,
    getStoredToken,
    getStoredUsername,
} from "../utils/storage";

export function useAuth() {
    const [token, setToken] = useState(getStoredToken());
    const [username, setUsername] = useState(getStoredUsername());
    const [roles, setRoles] = useState<string[]>(getStoredRoles());

    const login = (data: LoginResponse) => {
        setToken(data.token);
        setUsername(data.username);
        setRoles(data.roles || []);
    };

    const logout = () => {
        clearAuthStorage();

        setToken("");
        setUsername("");
        setRoles([]);
    };

    return {
        token,
        username,
        roles,
        login,
        logout,
        isAdmin: roles.includes("ADMIN"),
    };
}