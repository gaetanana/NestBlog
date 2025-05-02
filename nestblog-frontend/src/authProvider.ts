// src/authProvider.ts simplifié
const authProvider = {
  login: async ({
    usernameOrEmail,
    password,
  }: {
    usernameOrEmail: string;
    password: string;
  }) => {
    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      localStorage.setItem("auth", JSON.stringify(data));

      //const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  },

  logout: () => {
    localStorage.removeItem("auth");
    return Promise.resolve();
  },

  checkAuth: () => {
    const auth = localStorage.getItem("auth");
    if (!auth) return Promise.reject();

    try {
      const { accessToken } = JSON.parse(auth);
      const payload = JSON.parse(atob(accessToken.split(".")[1]));

      // Vérifier si le token est expiré
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        localStorage.removeItem("auth");
        return Promise.reject();
      }

      return Promise.resolve();
    } catch (err) {
      localStorage.removeItem("auth");
      return Promise.reject();
    }
  },

  checkError: (error: { status: number }) => {
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem("auth");
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: () => {
    const auth = localStorage.getItem("auth");
    if (!auth) return Promise.reject();

    try {
      const { accessToken } = JSON.parse(auth);
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      return Promise.resolve(payload.realm_access?.roles || []);
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
        fullName: payload.name || payload.preferred_username,
      });
    } catch (err) {
      return Promise.reject();
    }
  },
};

export default authProvider;
