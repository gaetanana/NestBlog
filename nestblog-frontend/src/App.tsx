import { Admin, Resource, ListGuesser } from 'react-admin';
import authProvider from './authProvider';

export const App = () => (
  <Admin authProvider={authProvider}>
    <Resource name="fake" list={ListGuesser} />
  </Admin>
);
