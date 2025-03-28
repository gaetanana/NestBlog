import { DataProvider, RaRecord, Identifier } from 'react-admin';

type FakeRecord = RaRecord<Identifier> & { name?: string };

export const dataProvider: DataProvider = {
    getList: async () => Promise.resolve({ data: [], total: 0 }),
    getOne: async (_resource, params) =>
        Promise.resolve({ data: { id: params.id, name: 'Fake' } as FakeRecord }),
    getMany: async () => Promise.resolve({ data: [] }),
    getManyReference: async () =>
        Promise.resolve({ data: [], total: 0 }),
    create: async (_resource, params) =>
        Promise.resolve({ data: { ...params.data, id: '1' } as FakeRecord }),
    update: async (_resource, params) =>
        Promise.resolve({ data: { ...params.data } as FakeRecord }),
    updateMany: async () => Promise.resolve({ data: [] }),
    delete: async (_resource, params) =>
        Promise.resolve({ data: { id: params.id } }),
    deleteMany: async () => Promise.resolve({ data: [] }),
};
