// src/resources/users/UserShow.tsx
import {
  Show,
  SimpleShowLayout,
  TextField,
  EmailField,
  DateField,
  useRecordContext,
  useGetIdentity,
  usePermissions,
  TopToolbar,
  Button,
  EditButton
} from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import { User } from '../../types';

const UserShowActions = () => {
  const record = useRecordContext<User>();
  const { identity } = useGetIdentity();
  const { permissions } = usePermissions();

  if (!record) return null;

  // Check if current user is viewing their own profile
  const isSelf = identity && identity.id === record.id;

  // Check if current user has admin role
  const isAdmin = Array.isArray(permissions) && permissions.includes('admin');

  return (
    <TopToolbar>
      {(isAdmin || isSelf) && <EditButton />}
    </TopToolbar>
  );
};

export const UserShow = () => {
  const record = useRecordContext<User>();

  if (!record) return null;

  return (
    <Show
      actions={<UserShowActions />}
      title={`User: ${record.name || record.username}`}
    >
      <SimpleShowLayout>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>User Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Username</Typography>
                  <Typography variant="body1">{record.username}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                  <Typography variant="body1">{record.email}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Full Name</Typography>
                  <Typography variant="body1">{record.name || 'Not specified'}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Joined On</Typography>
                  <Typography variant="body1">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Account Status</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Box display="flex" alignItems="center">
                    {record.enabled === false ? (
                      <>
                        <LockIcon color="error" sx={{ mr: 1 }} />
                        <Typography color="error.main">Disabled</Typography>
                      </>
                    ) : (
                      <>
                        <LockOpenIcon color="success" sx={{ mr: 1 }} />
                        <Typography color="success.main">Active</Typography>
                      </>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>Roles & Permissions</Typography>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Assigned Roles
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {record.roles && record.roles.length > 0 ? (
                      record.roles.map((role) => (
                        <Chip
                          key={role}
                          label={role}
                          icon={role === 'admin' ? <SecurityIcon /> : <PersonIcon />}
                          color={role === 'admin' ? 'secondary' : 'primary'}
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Typography color="textSecondary">No roles assigned</Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </SimpleShowLayout>
    </Show>
  );
};