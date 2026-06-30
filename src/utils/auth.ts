export function hasRole(roles: string[], role: string): boolean {
    return roles.includes(role);
}

export function isAdminRole(roles: string[]): boolean {
    return hasRole(roles, "ADMIN");
}