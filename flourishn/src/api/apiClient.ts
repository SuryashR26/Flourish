// flesh out all the api calls (write all calls here)
// can do multiple files 
export function signup(email: string, first_name: string, last_name: string, password: string, code: string) {
    return fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, first_name, last_name, password, code }),
    })
        .then(async response => {
            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                const message = errorBody?.error || response.statusText;
                throw new Error(`Error ${response.status}: ${message}`);
            }
            return response.json();
        })
}


export function login(email: string, password: string) {
    return fetch('http://localhost:8080/login', {
        method: 'POST',
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
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
        .then(async response => {
            return response.json();
        })
}