import { List, Datagrid, TextField, EmailField, EditButton } from 'react-admin';

export const UserList = () => (
    <List>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="username" />
            <EmailField source="email" />
            <TextField source="role" />
            <EditButton />
        </Datagrid>
    </List>
)

