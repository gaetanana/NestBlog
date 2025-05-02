import { AppBar, UserMenu, MenuItemLink, Logout } from 'react-admin';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useEffect, useState } from 'react';

const MyUserMenu = (props: any) => {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const auth = localStorage.getItem('auth');
        if (!auth) return;

        try {
            const { accessToken } = JSON.parse(auth);
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            setUserId(payload.sub);
        } catch (err) {
            console.error('Erreur extraction ID utilisateur', err);
        }
    }, []);

    return (
        <UserMenu {...props}>
            {userId && (
                <MenuItemLink
                    to={`/users/${userId}/show`}
                    primaryText="Mon profil"
                    leftIcon={<AccountCircle />}
                />
            )}
            <Logout />
        </UserMenu>
    );
};

export const MyAppBar = (props: any) => <AppBar {...props} userMenu={<MyUserMenu />} />;
