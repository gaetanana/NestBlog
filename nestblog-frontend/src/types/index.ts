// src/types/index.ts

// Définition des types utilisateur
export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt?: string;
  roles?: string[];
  enabled?: boolean;
}

// Définition du type rôle
export interface Role {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
}

// Définition du type pour les statistiques
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
}
