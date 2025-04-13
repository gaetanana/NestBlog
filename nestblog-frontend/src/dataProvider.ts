// src/dataProvider.ts
import { DataProvider } from 'react-admin';

const apiUrl = 'http://localhost:3000';

const getAuthHeader = () => {
    const auth = localStorage.getItem('auth');
    if (!auth) throw new Error('No access token');
    const { accessToken } = JSON.parse(auth); // 👈 important : camelCase
    return {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };
};

export const dataProvider: DataProvider = {
    getList: async (resource) => {
        const res = await fetch(`${apiUrl}/${resource}`, {
            headers: getAuthHeader(),
        });
        const data = await res.json();

        return {
            data,
            total: data.length,
        };
    },

    getOne: async (resource, params) => {
        const res = await fetch(`${apiUrl}/${resource}/${params.id}`, {
            headers: getAuthHeader(),
        });

        if (res.status === 401) {
            console.error('Unauthorized when accessing getOne for', resource, params.id);
            throw new Error('Unauthorized');
        }

        const data = await res.json();

        if (!data.id) {
            console.error('Invalid response: missing `id` key:', data);
            throw new Error('The response must include an `id` field');
        }

        return { data };
    },

    create: async (resource, params) => {
        const res = await fetch(`${apiUrl}/${resource}`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(params.data),
        });
        const data = await res.json();
        return { data };
    },

    update: async (resource, params) => {
        const res = await fetch(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PATCH',
            headers: getAuthHeader(),
            body: JSON.stringify(params.data),
        });
        const data = await res.json();
        return { data };
    },

    delete: async (resource, params) => {
        const res = await fetch(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        const data = await res.json();
        return { data };
    },

    getMany: async () => Promise.resolve({ data: [] }),
    getManyReference: async () => Promise.resolve({ data: [], total: 0 }),
    updateMany: async () => Promise.resolve({ data: [] }),
    deleteMany: async () => Promise.resolve({ data: [] }),
};
