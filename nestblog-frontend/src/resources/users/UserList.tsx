// src/resources/users/UserList.tsx 
import { List, Datagrid, TextField, EmailField, DateField, BooleanField, EditButton } from 'react-admin';

export const UserList = () => (
    <List>
        <Datagrid>
            <TextField source="username" />
            <EmailField source="email" />
            <TextField source="name" />
            <BooleanField source="enabled" />
            <DateField source="createdAt" label="Joined" />
            <EditButton />
        </Datagrid>
    </List>
);