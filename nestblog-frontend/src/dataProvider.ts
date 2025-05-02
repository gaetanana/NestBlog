// src/dataProvider.ts
import { DataProvider } from "react-admin";

const apiUrl = "http://localhost:3001";

// Fonction helper pour obtenir les en-têtes d'authentification
const getAuthHeader = () => {
  const auth = localStorage.getItem("auth");
  if (!auth) throw new Error("No access token");
  const { accessToken } = JSON.parse(auth);
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
};

// Extension du DataProvider avec des méthodes personnalisées
interface CustomDataProvider extends DataProvider {
  approveAccountRequest: (id: string) => Promise<{ data: any }>;
  rejectAccountRequest: (id: string) => Promise<{ data: any }>;
}

// Gestion générique des erreurs pour les requêtes
const handleApiError = async (
  response: Response,
  resourceName: string
): Promise<never> => {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.message || `Error with ${resourceName}`);
};

export const dataProvider: CustomDataProvider = {
  getList: async (resource) => {
    try {
      const res = await fetch(`${apiUrl}/${resource}`, {
        headers: getAuthHeader(),
      });

      if (!res.ok) {
        return handleApiError(res, resource);
      }

      const data = await res.json();

      return {
        data,
        total: data.length,
      };
    } catch (error) {
      console.error(`Error in getList for ${resource}:`, error);
      throw error;
    }
  },

  getOne: async (resource, params) => {
    const res = await fetch(`${apiUrl}/${resource}/${params.id}`, {
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Unauthorized");
      } else if (res.status === 404) {
        throw new Error(`${resource} not found`);
      }
      return handleApiError(res, resource);
    }

    const data = await res.json();
    return { data };
  },

  create: async (resource, params) => {
    const res = await fetch(`${apiUrl}/${resource}`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(params.data),
    });

    if (!res.ok) {
      return handleApiError(res, resource);
    }

    const data = await res.json();
    return { data };
  },

  update: async (resource, params) => {
    const res = await fetch(`${apiUrl}/${resource}/${params.id}`, {
      method: "PATCH",
      headers: getAuthHeader(),
      body: JSON.stringify(params.data),
    });

    if (!res.ok) {
      return handleApiError(res, resource);
    }

    const data = await res.json();
    return { data };
  },

  delete: async (resource, params) => {
    const res = await fetch(`${apiUrl}/${resource}/${params.id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      return handleApiError(res, resource);
    }

    const data = await res.json();
    return { data };
  },

  // Méthodes standard de react-admin
  getMany: async (resource, params) => {
    const queryString = params.ids.map((id) => `id=${id}`).join("&");
    const url = `${apiUrl}/${resource}?${queryString}`;

    const res = await fetch(url, {
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      return handleApiError(res, resource);
    }

    const data = await res.json();
    return { data };
  },

  getManyReference: async (resource, params) => {
    const { target, id } = params;
    const url = `${apiUrl}/${resource}?${target}=${id}`;

    const res = await fetch(url, {
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      return handleApiError(res, resource);
    }

    const data = await res.json();
    return {
      data,
      total: data.length,
    };
  },

  updateMany: async (resource, params) => {
    const responses = await Promise.all(
      params.ids.map((id) =>
        fetch(`${apiUrl}/${resource}/${id}`, {
          method: "PATCH",
          headers: getAuthHeader(),
          body: JSON.stringify(params.data),
        })
      )
    );

    const hasError = responses.some((res) => !res.ok);
    if (hasError) {
      throw new Error(`Error updating multiple ${resource}`);
    }

    return { data: params.ids };
  },

  deleteMany: async (resource, params) => {
    const responses = await Promise.all(
      params.ids.map((id) =>
        fetch(`${apiUrl}/${resource}/${id}`, {
          method: "DELETE",
          headers: getAuthHeader(),
        })
      )
    );

    const hasError = responses.some((res) => !res.ok);
    if (hasError) {
      throw new Error(`Error deleting multiple ${resource}`);
    }

    return { data: params.ids };
  },

  // Méthodes personnalisées pour les demandes de compte
  approveAccountRequest: async (id) => {
    const res = await fetch(`${apiUrl}/account-requests/${id}/approve`, {
      method: "PATCH",
      headers: getAuthHeader(),
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      return handleApiError(res, "account request approval");
    }

    const data = await res.json();
    return { data };
  },

  rejectAccountRequest: async (id) => {
    const res = await fetch(`${apiUrl}/account-requests/${id}/reject`, {
      method: "PATCH",
      headers: getAuthHeader(),
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      return handleApiError(res, "account request rejection");
    }

    const data = await res.json();
    return { data };
  },
};
