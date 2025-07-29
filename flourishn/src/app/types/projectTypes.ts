export interface Project {
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    user_image?: string | null;
    title: string;
    content: string;
    role_count: number;
    role_description?: any;
    project_tags?: string[];
    skill_tags?: string[];
    status: string;
    location_preference: string;
    location?: string | null;
    difficulty: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    photourl?: string | null;
}
