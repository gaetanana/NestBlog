// src/App.tsx
import { Admin, Resource, Layout } from 'react-admin';
import { UserCreate } from './ressources/users/UserCreate';
import { UserEdit } from './ressources/users/UserEdit';
import { UserList } from './ressources/users/UserList';
import { UserShow } from './ressources/users/UserShow';
import authProvider from './authProvider';
import { dataProvider } from './dataProvider';
import { MyAppBar } from './ressources/appBar/MyAppBar';
import LoginPage from './components/Login';

export const App = () => (
  <Admin
    authProvider={authProvider}
    dataProvider={dataProvider}
    layout={(props) => <Layout {...props} appBar={MyAppBar} />}
    loginPage={LoginPage}
  >
    <Resource
      name="users"
      list={authProvider.hasAdmin() ? UserList : undefined}
      show={UserShow}
      edit={UserEdit}
      create={authProvider.hasAdmin() ? UserCreate : undefined}
    />
  </Admin>
);