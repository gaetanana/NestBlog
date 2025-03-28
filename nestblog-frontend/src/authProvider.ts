// src/authProvider.ts
const API_URL = 'http://localhost:3000/auth/login';

const authProvider = {
    login: async ({ username, password }: { username: string; password: string }) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) throw new Error('Login failed');

        const data = await response.json();
        localStorage.setItem('auth', JSON.stringify(data));
        return Promise.resolve();
    },

    logout: () => {
        localStorage.removeItem('auth');
        return Promise.resolve();
    },

    checkAuth: () => {
        return localStorage.getItem('auth') ? Promise.resolve() : Promise.reject();
    },

    getIdentity: () => {
        return Promise.resolve({ id: 'user', fullName: 'John Doe' });
    },

    getPermissions: () => Promise.resolve(),

    checkError: (error: any) => {
        if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('auth');
            return Promise.reject();
        }
        return Promise.resolve();
    },
};

export default authProvider;
