// src/App.tsx
import { Admin, Resource, Layout } from 'react-admin';
import { UserCreate } from './resources/users/UserCreate';
import { UserEdit } from './resources/users/UserEdit';
import { UserList } from './resources/users/UserList';
import { UserShow } from './resources/users/UserShow';
import authProvider from './authProvider';
import { dataProvider } from './dataProvider';
import { MyAppBar } from './resources/appBar/MyAppBar';
import LoginPage from './components/Login';
import { useState, useEffect } from 'react';

// Icons
import PeopleIcon from '@mui/icons-material/People';

export const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Vérifier les rôles à l'initialisation
    authProvider.getPermissions()
      .then((permissions) => {
        setIsAdmin(Array.isArray(permissions) && permissions.includes('admin'));
      })
      .catch(() => setIsAdmin(false));

    // Écouter les changements d'authentification
    const checkAuthInterval = setInterval(() => {
      authProvider.checkAuth()
        .then(() => {
          authProvider.getPermissions()
            .then((permissions) => {
              setIsAdmin(Array.isArray(permissions) && permissions.includes('admin'));
            });
        })
        .catch(() => {
          setIsAdmin(false);
        });
    }, 5000); 

    return () => clearInterval(checkAuthInterval);
  }, []);

  return (
    <Admin
      authProvider={authProvider}
      dataProvider={dataProvider}
      layout={(props) => <Layout {...props} appBar={MyAppBar} />}
      loginPage={LoginPage}
    >
      <Resource
        name="users"
        list={isAdmin ? UserList : undefined}
        show={UserShow}
        edit={UserEdit}
        create={isAdmin ? UserCreate : undefined}
        icon={PeopleIcon}
        options={{ label: 'Users' }}
      />
    </Admin>
  );
};