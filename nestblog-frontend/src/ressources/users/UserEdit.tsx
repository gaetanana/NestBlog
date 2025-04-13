import { Edit, SimpleForm, TextInput, PasswordInput } from 'react-admin';

export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="username" disabled />
      <TextInput source="email" />
      <PasswordInput source="password" />
    </SimpleForm>
  </Edit>
);
