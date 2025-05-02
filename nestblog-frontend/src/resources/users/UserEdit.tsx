// src/resources/users/UserEdit.tsx
import { Edit, SimpleForm, TextInput, required, email } from 'react-admin';

export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" fullWidth />
      <TextInput source="email" fullWidth validate={[required(), email()]} />
    </SimpleForm>
  </Edit>
);