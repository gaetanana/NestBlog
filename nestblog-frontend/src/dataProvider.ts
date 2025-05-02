// src/dataProvider.ts
import { DataProvider } from "react-admin";

const apiUrl = "http://localhost:3000";

const getAuthHeader = () => {
  const auth = localStorage.getItem("auth");
  if (!auth) throw new Error("No access token");
  const { accessToken } = JSON.parse(auth);
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
};

export const dataProvider: DataProvider = {
  getList: async (resource) => {
    try {
      console.log(`Fetching list of ${resource}...`);
      const res = await fetch(`${apiUrl}/${resource}`, {
        headers: getAuthHeader(),
      });
  
      if (!res.ok) {
        console.error(`Error fetching ${resource}:`, res.status, res.statusText);
        throw new Error(`Error fetching ${resource}: ${res.statusText}`);
      }
  
      const data = await res.json();
      console.log(`Fetched ${data.length} ${resource}`, data);
  
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
      } else {
        throw new Error(`Error fetching ${resource}: ${res.statusText}`);
      }
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
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Error creating ${resource}`);
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
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Error updating ${resource}`);
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
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Error deleting ${resource}`);
    }

    const data = await res.json();
    return { data };
  },

  // Standard methods
  getMany: async (resource, params) => {
    const queryString = params.ids.map((id) => `id=${id}`).join("&");
    const url = `${apiUrl}/${resource}?${queryString}`;

    const res = await fetch(url, {
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      throw new Error(`Error fetching multiple ${resource}: ${res.statusText}`);
    }

    const data = await res.json();
    return { data };
  },

  getManyReference: async (resource, params) => {
    const { target, id, pagination, sort, filter } = params;
    const url = `${apiUrl}/${resource}?${target}=${id}`;

    const res = await fetch(url, {
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      throw new Error(
        `Error fetching referenced ${resource}: ${res.statusText}`
      );
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

  // User Management specific methods
  updateUserIdentity: async (userId: any, data: any) => {
    try {
      const res = await fetch(`${apiUrl}/users/${userId}/identity`, {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update user identity");
      }

      const responseData = await res.json();
      return { data: responseData };
    } catch (error) {
      console.error("Error updating user identity:", error);
      throw error;
    }
  },

  changeUserPassword: async (userId: any, password: any) => {
    try {
      const res = await fetch(`${apiUrl}/users/${userId}/password`, {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to change password");
      }

      const responseData = await res.json();
      return { data: responseData };
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },

  // New method for enabling/disabling users
  updateUserStatus: async (userId: any, enabled: any) => {
    try {
      const res = await fetch(`${apiUrl}/users/${userId}/status`, {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify({ enabled }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update user status");
      }

      const responseData = await res.json();
      return { data: responseData };
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  },

  // New method for managing user roles
  updateUserRoles: async (userId: any, roles: any) => {
    try {
      const res = await fetch(`${apiUrl}/users/${userId}/roles`, {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify({ roles }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update user roles");
      }

      const responseData = await res.json();
      return { data: responseData };
    } catch (error) {
      console.error("Error updating user roles:", error);
      throw error;
    }
  },
};
