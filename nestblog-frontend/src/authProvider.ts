const API_URL = "http://localhost:3000/auth/login";

let currentRoles: string[] = [];

const authProvider = {
  login: async ({
    usernameOrEmail,
    password,
  }: {
    usernameOrEmail: string;
    password: string;
  }) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Login failed:", errorText);
      throw new Error("Login failed");
    }

    const data = await response.json();

    if (!data.accessToken) {
      console.error("No accessToken in response:", data);
      throw new Error("Token not received from backend");
    }

    localStorage.setItem("auth", JSON.stringify(data));

    const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
    console.log("Token payload:", payload);
    console.log("Roles:", payload.realm_access?.roles);
    currentRoles = payload.realm_access?.roles || [];

    return Promise.resolve();
  },

  logout: () => {
    localStorage.removeItem("auth");
    currentRoles = [];
    return Promise.resolve();
  },

  checkAuth: () => {
    const auth = localStorage.getItem("auth");
    if (!auth) return Promise.reject();

    try {
      const { accessToken } = JSON.parse(auth);
      const payload = JSON.parse(atob(accessToken.split(".")[1]));

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.warn("Token expiré. Déconnexion.");
        localStorage.removeItem("auth");
        return Promise.reject();
      }

      return Promise.resolve();
    } catch (err) {
      localStorage.removeItem("auth");
      return Promise.reject();
    }
  },

  checkError: (error: any) => {
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem("auth");
      currentRoles = [];
      return Promise.reject({ redirectTo: "/login" });
    }
    return Promise.resolve();
  },

  getPermissions: () => {
    const auth = localStorage.getItem("auth");
    if (!auth) return Promise.reject();

    try {
      const { accessToken } = JSON.parse(auth);
      const payload = JSON.parse(atob(accessToken.split(".")[1]));

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.warn("Token expiré dans getPermissions");
        localStorage.removeItem("auth");
        return Promise.reject();
      }

      currentRoles = payload.realm_access?.roles || [];
      return Promise.resolve(currentRoles);
    } catch (err) {
      return Promise.reject();
    }
  },

  getIdentity: () => {
    const auth = localStorage.getItem("auth");
    if (!auth) return Promise.reject();

    try {
      const { accessToken } = JSON.parse(auth);
      const payload = JSON.parse(atob(accessToken.split(".")[1]));

      return Promise.resolve({
        id: payload.sub,
        fullName: payload.preferred_username,
        role: payload.realm_access?.roles?.[0] || "user",
      });
    } catch (err) {
      return Promise.reject();
    }
  },

  hasAdmin: () => currentRoles.includes("admin"),
};

export default authProvider;
