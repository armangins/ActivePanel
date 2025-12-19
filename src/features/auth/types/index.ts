export interface User {
    id: string;
    email: string;
    displayName: string;
    username?: string;
    role?: string;
    picture?: string;
    [key: string]: any; // Allow flexible properties for now during migration
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    loading: boolean;
    isAuthenticated: boolean;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface AuthContextType extends AuthState {
    login: (userData: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshAccessToken: () => Promise<string | undefined>;
    getToken: () => string | null;
}

export type { LoginCredentials, SignUpCredentials } from '../api/schemas';
