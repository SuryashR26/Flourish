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
    time_commitment: string;
    project_category: string
}

export interface SearchFilter {
    LocationS: {
        remote: boolean
        inPerson: boolean
    }
    LocationL: string
    skills: string[]
    tags: string[]
    difficulty: string[]
    time: string[]
    radius: number
    sortBy: string
}


export interface SignUpValues2 {
    birthday: string;
    phoneNumber: string;
    interest: string[];
    displayName: string;
}

export interface Notification {
    type: 'view' | 'click' | 'bookmark';
    targetId: string;
    actorId: string | null;
    actor_name: string
    message: string;
    created_at: string;
    read_at: string;
    user_image: string
    post_title: string
};