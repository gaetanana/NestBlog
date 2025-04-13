import { usePermissions, useRecordContext } from 'react-admin';
import { Show, SimpleShowLayout, TextField, EmailField, EditButton } from 'react-admin';

export const UserShow = () => {
  const { permissions } = usePermissions();
  const record = useRecordContext();
  const isSelf = () => {
    const auth = localStorage.getItem('auth');
    if (!auth || !record) return false;
    const { access_token } = JSON.parse(auth);
    const payload = JSON.parse(atob(access_token.split('.')[1]));
    return payload.sub === record.id;
  };

  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="username" />
        <EmailField source="email" />
        <TextField source="role" />
        {(permissions.includes('admin') || isSelf()) && <EditButton />}
      </SimpleShowLayout>
    </Show>
  );
};
