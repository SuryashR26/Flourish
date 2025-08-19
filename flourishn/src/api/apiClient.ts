// flesh out all the api calls (write all calls here)
// can do multiple files 

import { Project, SearchFilter, SignUpValues2 } from '@/app/types/projectTypes';
/*export function signup(email: string, first_name: string, last_name: string, password: string, code: string) {
    return fetch('http://localhost:8080/signup', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, first_name, last_name, password, code }),
    })
        .then(async response => {
            return response.json();
        })
}*/


/*export function login(email: string, password: string) {
    return fetch('http://localhost:8080/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
        .then(async response => {
            return response.json();
        }
        )
}*/

export function contactUs(first_name: string, last_name: string, email: string, message: string) {
    return fetch('http://localhost:8080/contactUs', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ first_name, last_name, email, message }),
    })
        .then(async response => {
            return response.json();
        })
}

export function resetPass(email: string) {
    return fetch('http://localhost:8080/forgotPassword', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
        .then(async response => {
            return response.json();
        })
}

export async function getPresignedUrl(filename: string, filetype: string) {
    const res = await fetch('http://localhost:8080/updateProfile', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            filename,
            filetype,
        }),
    });

    if (!res.ok) {
        throw new Error('Failed to get presigned URL');
    }

    return await res.json();
}

export function search(query: string, searchFilter: SearchFilter, interests: string[]): Promise<Project[]> {
    const params = new URLSearchParams();

    if (query) params.append('query', query);

    params.append('remote', String(searchFilter.LocationS.remote));
    params.append('inPerson', String(searchFilter.LocationS.inPerson));

    if (searchFilter.LocationL) params.append('location', searchFilter.LocationL);
    if (searchFilter.radius) params.append('radius', searchFilter.radius.toString());
    if (searchFilter.sortBy) params.append('sortBy', searchFilter.sortBy);

    searchFilter.skills.forEach((skill) => params.append('skills', skill));
    searchFilter.tags.forEach((tag) => params.append('tags', tag));
    searchFilter.difficulty.forEach((diff) => params.append('difficulty', diff));
    searchFilter.time.forEach((t) => params.append('time', t));
    interests.forEach((interest) => params.append('interests', interest));

    return fetch(`http://localhost:8080/search?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(async (response) => {
        if (!response.ok) {
            return [];
        }
        return response.json();
    });
}


export async function createPostWithImage(postData: any, filename?: string, filetype?: string) {
    const requestData = {
        ...postData,
        hasImage: filename && filetype ? true : false,
        filename,
        filetype,
    };

    const res = await fetch('http://localhost:8080/posts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
    });

    if (!res.ok) {
        throw new Error('Failed to create post');
    }

    return await res.json();
}

export async function cleanupFailedPost(postId: string) {
    const res = await fetch('http://localhost:8080/posts/cleanup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
    });

    if (!res.ok) {
        throw new Error('Failed to cleanup post');
    }

    return await res.json();
}


// Message API Functions
export async function sendMessage(receiverId: string, content: string) {
    const res = await fetch('http://localhost:8080/messages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, content }),
    });

    if (!res.ok) {
        throw new Error('Failed to send message');
    }

    return await res.json();
}

export async function getConversations() {
    const res = await fetch('http://localhost:8080/conversations', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });

    if (res.status === 401) {
        window.location.href = '/login';
        throw new Error('Not authenticated');
    }

    if (!res.ok) {
        throw new Error('Failed to get conversations');
    }

    return await res.json();
}

export async function getMessages(conversationId: string, limit = 50, offset = 0) {
    const res = await fetch(`http://localhost:8080/messages/${conversationId}?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
        throw new Error('Failed to get messages');
    }

    return await res.json();
}

export async function markMessagesAsRead(conversationId: string) {
    const res = await fetch('http://localhost:8080/messages/read', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
    });

    if (!res.ok) {
        throw new Error('Failed to mark messages as read');
    }

    return await res.json();
}

export async function getCurrentUser() {
    const res = await fetch('http://localhost:8080/user/current', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });

    if (res.status === 401) {
        window.location.href = '/login';
        throw new Error('Not authenticated');
    }

    if (!res.ok) {
        throw new Error('Failed to get current user');
    }

    return await res.json();
}

export async function searchUsers(query?: string) {
    const url = new URL('http://localhost:8080/users/search');
    if (query) {
        url.searchParams.append('query', query);
    }

    const res = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });

    if (res.status === 401) {
        window.location.href = '/login';
        throw new Error('Not authenticated');
    }

    if (!res.ok) {
        throw new Error('Failed to search users');
    }

    return await res.json();
}

export async function bookmarkProject(projectId: string) {
    const res = await fetch(`http://localhost:8080/bookmark/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
    });

    const data = await res.json();
    return { status: res.status, ...data };
}

// Settings API functions
export async function getSettings() {
    const res = await fetch('http://localhost:8080/settings', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });

    if (res.status === 401) {
        window.location.href = '/login';
        throw new Error('Not authenticated');
    }

    if (!res.ok) {
        throw new Error('Failed to get settings');
    }

    return await res.json();
}

export async function updateSettings(settingsData: {
    display_name?: string;
    bio?: string;
    areas_of_interest?: string[];
    profile_visibility?: 'public' | 'private';
    show_email_publicly?: boolean;
}) {
    const res = await fetch('http://localhost:8080/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData),
    });

    if (res.status === 401) {
        window.location.href = '/login';
        throw new Error('Not authenticated');
    }

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update settings');
    }

    return await res.json();
}

export async function updatePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}) {
    try {
        const res = await fetch('http://localhost:8080/update-password', {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(passwordData),
        });

        if (!res.ok) {
            // Try to parse the error response
            let errorData;
            try {
                errorData = await res.json();
            } catch (parseError) {
                // If JSON parsing fails, handle specific status codes
                if (res.status === 401) {
                    throw new Error('You must be logged in to change your password. Please log in and try again.');
                }
                throw new Error(`Server connection error. HTTP ${res.status}: ${res.statusText}`);
            }

            // If we successfully parsed the JSON, throw the message from backend
            throw new Error(errorData.message || errorData.error || `HTTP ${res.status}: ${res.statusText}`);
        }

        return await res.json();
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Unable to connect to server. Please ensure the backend server is running.');
        }
        throw error;
    }
}

export async function storeViewProject(projectId: string) {
    const res = await fetch('http://localhost:8080/storeView', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
    });

    if (!res.ok) {
        throw new Error('Failed to store view');
    }

    return await res.json();
}

export async function additionalInfo(signUpValues2: SignUpValues2) {
    const requestData = {
        ...signUpValues2
    };

    const res = await fetch('http://localhost:8080/additionalInfo', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
    });

    if (!res.ok) {
        throw new Error('Failed to create post');
    }

    return await res.json();
}

export function getBookmarkedPosts(): Promise<Project[]> {
    return fetch(`http://localhost:8080/bookmarkedPosts`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(async (response) => {
        if (!response.ok) {
            return [];
        }
        return response.json();
    });
}

export function getUserPosts(): Promise<Project[]> {
    return fetch(`http://localhost:8080/getUserPosts`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(async (response) => {
        if (!response.ok) {
            return [];
        }
        return response.json();
    });
}

export function getRecommendedProjects(): Promise<Project[]> {
    return fetch(`http://localhost:8080/getRecommendedProjects`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(async (response) => {
        if (!response.ok) {
            return [];
        }
        return response.json();
    });
}





export async function getNotifications() {
    try {
        const response = await fetch(`http://localhost:8080/getNotifications`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch notifications:', response.statusText);
            return [];
        }

        const data = await response.json();
        return data.notifications || [];
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

export async function getOverallViews() {
    try {
        const response = await fetch(`http://localhost:8080/getOverallViews`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch views:', response.statusText);
            return [];
        }


        return await response.json();
    } catch (error) {
        console.error('Error fetching views:', error);
        return [];
    }
}

export async function getOverallClicks() {
    try {
        const response = await fetch(`http://localhost:8080/getOverallClicks`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch clicks:', response.statusText);
            return [];
        }


        return await response.json();
    } catch (error) {
        console.error('Error fetching views:', error);
        return [];
    }
}
export async function getOverallBookmarks() {
    try {
        const response = await fetch(`http://localhost:8080/getOverallBookmarks`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch bookmarks:', response.statusText);
            return [];
        }


        return await response.json();
    } catch (error) {
        console.error('Error fetching views:', error);
        return [];
    }
}

export async function markNotificationsRead() {
    const res = await fetch('http://localhost:8080/markNotifications', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
        throw new Error('Failed to create post');
    }

    return await res.json();
}