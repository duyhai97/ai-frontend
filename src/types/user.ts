export type UserResponse = {
    id: number;
    username: string;
    fullName?: string;
    email?: string;
    enabled: boolean;
    roles: string[];
};

export type CreateUserRequest = {
    username: string;
    password: string;
    fullName?: string;
    email?: string;
    roles: string[];
};