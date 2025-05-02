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
import { Route } from 'react-router-dom';
import { UserProfile } from './resources/users/UserProfile';
import AccountRequestList from './resources/account-requests/AccountRequestList';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RequestAccountPage from './auth/RequestAccountPage';

export const App = () => {
  return (
    <Admin
      authProvider={authProvider}
      dataProvider={dataProvider}
      layout={Layout}
      loginPage={LoginPage}
      requireAuth
      title="NestBlog"
      disableTelemetry
    >
      {/* Routes accessibles aux utilisateurs authentifiés */}
      <CustomRoutes>
        <Route path="/users/me" element={<UserProfile />} />
      </CustomRoutes>

      {/* Routes accessibles SANS authentification - Version simplifiée */}
      <CustomRoutes noLayout>
        <Route path="/request-account" element={<RequestAccountPage />} />
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

          {permissions?.includes('admin') && (
            <Resource
              name="account-requests"
              list={AccountRequestList}
              icon={ReceiptLongIcon}
              options={{ label: 'Account Requests' }}
            />
          )}
        </>
      )}
    </Admin>
  );
};