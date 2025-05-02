// src/resources/users/UserProfile.tsx
import React from 'react';
import { useGetIdentity, Title, useDataProvider, Loading, useNotify } from 'react-admin';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';

// Définir l'interface pour notre objet utilisateur
interface UserType {
    id: string;
    username: string;
    email: string;
    name?: string;
    createdAt?: string;
}

export const UserProfile = () => {
    const { identity } = useGetIdentity();
    const [user, setUser] = React.useState<UserType | null>(null);
    const [loading, setLoading] = React.useState(true);
    const dataProvider = useDataProvider();
    const notify = useNotify();

    React.useEffect(() => {
        const fetchUserData = async () => {
            if (!identity?.id) return;

            try {
                setLoading(true);
                const { data } = await dataProvider.getOne('users', { id: identity.id });
                setUser(data);
            } catch (error) {
                console.error('Erreur lors du chargement du profil:', error);
                notify('Erreur lors du chargement du profil', { type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [identity, dataProvider, notify]);

    if (loading) return <Loading />;
    if (!user) return <Box p={2}>Profil utilisateur non disponible</Box>;

    return (
        <Card>
            <Title title="Mon Profil" />
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Profil Utilisateur
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                        <Typography variant="subtitle2" color="textSecondary">Nom d'utilisateur</Typography>
                        <Typography variant="body1">{user.username}</Typography>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                        <Typography variant="body1">{user.email}</Typography>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" color="textSecondary">Nom complet</Typography>
                        <Typography variant="body1">{user.name || 'Non renseigné'}</Typography>
                    </Box>

                    {user.createdAt && (
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">Membre depuis</Typography>
                            <Typography variant="body1">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};