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

// Icons
import PeopleIcon from '@mui/icons-material/People';

export const App = () => {
  const isAdmin = authProvider.hasAdmin();

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
      {/* Tes autres ressources ici */}
    </Admin>
  );
};