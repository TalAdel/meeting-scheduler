export interface User {
    id: string;
    fullName: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserWithoutPassword {
    id: string;
    fullName: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SignupUserRequest {
    fullName: string;
    email: string;
    password: string;
}

export interface SignupUserResponse {
    user: UserWithoutPassword;
}
export interface LoginUserRequest {
    email: string;
    password: string;
}

export interface LoginUserResponse {
    user: {
        id: string;
        email: string;
        fullName: string;
        createdAt: Date;
        updatedAt: Date;
    };
    token: string;
}

export interface CreateUserInput {
    fullName: string;
    email: string;
    password: string;
}