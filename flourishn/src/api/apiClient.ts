// flesh out all the api calls (write all calls here)
// can do multiple files 

import { Project, SearchFilter } from '@/app/types/projectTypes';
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

export function search(/*query: string,*/ searchFilter: SearchFilter): Promise<Project[]> {
    const params = new URLSearchParams();

    // if (query) params.append('query', query);

    params.append('remote', String(searchFilter.LocationS.remote));
    params.append('inPerson', String(searchFilter.LocationS.inPerson));

    if (searchFilter.LocationL) params.append('location', searchFilter.LocationL);
    if (searchFilter.radius) params.append('radius', searchFilter.radius.toString());

    searchFilter.skills.forEach((skill) => params.append('skills', skill));
    searchFilter.tags.forEach((tag) => params.append('tags', tag));
    searchFilter.difficulty.forEach((diff) => params.append('difficulty', diff));
    searchFilter.time.forEach((t) => params.append('time', t));

    return fetch(`http://localhost:8080/search?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(async (response) => {
        if (!response.ok) {
            throw new Error('Failed to fetch search results');
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
