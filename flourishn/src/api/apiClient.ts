// flesh out all the api calls (write all calls here)
// can do multiple files 
export function signup(email: string, first_name: string, last_name: string, password: string, code: string) {
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
}


export function login(email: string, password: string) {
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
}

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