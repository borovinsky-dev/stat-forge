export interface UserSession {
    id: string;
    created_at: string;
    expires_at: string;
    last_used_at: string | null;
    user_agent: string | null;
    is_current?: boolean;
}
