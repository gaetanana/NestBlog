// src/App.tsx
import { Admin, CustomRoutes, Resource } from 'react-admin';
import { UserList } from './resources/users/UserList';
import { UserEdit } from './resources/users/UserEdit';
import { UserShow } from './resources/users/UserShow';
import authProvider from './authProvider';
import { dataProvider } from './dataProvider';
import PeopleIcon from '@mui/icons-material/People';
import { Layout } from './layout/Layout';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import { Route } from 'react-router-dom';
import { UserProfile } from './resources/users/UserProfile';

export const App = () => {
  return (
    <Admin
      authProvider={authProvider}
      dataProvider={dataProvider}
      layout={Layout}
      loginPage={LoginPage}
      requireAuth
    >
      <CustomRoutes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/users/me" element={<UserProfile />} />
      </CustomRoutes>

      {permissions => (
        <>
          <Resource
            name="users"
            list={permissions?.includes('admin') ? UserList : undefined}
            edit={UserEdit}
            show={UserShow}
            icon={PeopleIcon}
          />
        </>
      )}
    </Admin>
  );
};