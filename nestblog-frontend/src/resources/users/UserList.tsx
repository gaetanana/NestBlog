// src/resources/users/UserList.tsx
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  EditButton,
  ShowButton,
  TextInput,
  FilterButton,
  CreateButton,
  TopToolbar,
  ExportButton,
  useGetIdentity,
  FunctionField
} from 'react-admin';
import { FC } from 'react';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import { User } from '../../types';

interface UserStatusFieldProps {
  record?: User;
}

const UserFilters = [
  <TextInput source="username" label="Search by Username" alwaysOn key="username" />,
  <TextInput source="email" label="Search by Email" key="email" />,
  <TextInput source="name" label="Search by Name" key="name" />,
];

const UserListActions = () => {
  const { identity } = useGetIdentity();
  const isAdmin = identity?.role === 'admin' ||
    (identity?.roles && Array.isArray(identity.roles) && identity.roles.includes('admin'));

  return (
    <TopToolbar>
      <FilterButton />
      {isAdmin && <CreateButton />}
      <ExportButton />
    </TopToolbar>
  );
};

const UserStatusField: FC<UserStatusFieldProps> = ({ record }) => {
  if (!record) return null;
  return record.enabled === false ?
    <LockIcon color="error" titleAccess="Disabled" /> :
    <LockOpenIcon color="success" titleAccess="Active" />;
};

export const UserList = () => {
  const { identity } = useGetIdentity();
  const isAdmin = identity?.role === 'admin' ||
    (identity?.roles && Array.isArray(identity.roles) && identity.roles.includes('admin'));

  return (
    <List
      filters={UserFilters}
      actions={<UserListActions />}
      sort={{ field: 'createdAt', order: 'DESC' }}
      perPage={10}
    >
      <Datagrid bulkActionButtons={isAdmin ? undefined : false}>
        <TextField source="username" />
        <EmailField source="email" />
        <TextField source="name" />
        <FunctionField
          label="Status"
          render={(record: User) => (
            record.enabled === false ?
              <LockIcon color="error" titleAccess="Disabled" /> :
              <LockOpenIcon color="success" titleAccess="Active" />
          )}
        />
        <DateField source="createdAt" label="Joined date" />
        <ShowButton />
        <EditButton />
      </Datagrid>
    </List>
  );
};