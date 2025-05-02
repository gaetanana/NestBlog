// src/resources/users/UserShow.tsx 
import { Show, SimpleShowLayout, TextField, EmailField, DateField, BooleanField } from 'react-admin';

export const UserShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="username" />
      <EmailField source="email" />
      <TextField source="name" />
      <BooleanField source="enabled" label="Account Active" />
      <DateField source="createdAt" label="Joined" />
    </SimpleShowLayout>
  </Show>
);