// src/resources/users/UserEdit.tsx
import { useCallback, useState } from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  PasswordInput,
  useDataProvider,
  useRedirect,
  useRecordContext,
  useNotify,
  SaveButton,
  DeleteButton,
  Toolbar,
  useGetIdentity,
  usePermissions,
  required,
  email,
  minLength
} from 'react-admin';
import {
  Box,
  Typography,
  Divider,
  Card,
  CardContent,
  Grid,
  Alert,
  Switch,
  FormControlLabel,
  Tab,
  Tabs
} from '@mui/material';
import { UserRolesManager } from './UserRolesManager';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import { User } from '../../types';

// Validation rules
const validateEmail = [required(), email()];
const validateUsername = [required(), minLength(3)];
const validatePassword = [minLength(8)];

// Custom toolbar with conditional delete button
const CustomToolbar = (props: any) => {
  const { identity } = useGetIdentity();
  const { permissions } = usePermissions();
  const record = useRecordContext<User>();

  const isAdmin = Array.isArray(permissions) && permissions.includes('admin');
  const isSelf = identity && record && identity.id === record.id;

  return (
    <Toolbar {...props} sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <SaveButton label="Save Changes" />
      {isAdmin && !isSelf && (
        <DeleteButton mutationMode="pessimistic" />
      )}
    </Toolbar>
  );
};

// Tab panel component for organizing form content
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-edit-tabpanel-${index}`}
      aria-labelledby={`user-edit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const UserEdit = () => {
  const dataProvider = useDataProvider();
  const redirect = useRedirect();
  const notify = useNotify();
  const { identity } = useGetIdentity();
  const { permissions } = usePermissions();
  const record = useRecordContext<User>();

  const [activeTab, setActiveTab] = useState(0);
  const [isEnabled, setIsEnabled] = useState(record?.enabled !== false);

  // Check if current user is editing their own profile
  const isSelf = identity && record && identity.id === record.id;

  // Check if current user has admin permissions
  const isAdmin = Array.isArray(permissions) && permissions.includes('admin');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEnableToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsEnabled(event.target.checked);
  };

  // Form submission handler
  const handleSubmit = useCallback(async (values: any) => {
    try {
      const record = values;
      const userId = record.id;

      // Extract identity data (managed by Keycloak)
      const { username, email, password, ...appData } = values;

      // Create an object with only fields that have been modified
      const identityUpdate: { username?: string; email?: string } = {};
      if (username) identityUpdate.username = username;
      if (email) identityUpdate.email = email;

      // Only update identity if there are changes
      if (Object.keys(identityUpdate).length > 0) {
        await dataProvider.updateUserIdentity(userId, identityUpdate);
      }

      // Update password if provided
      if (password && password.trim() !== '') {
        await dataProvider.changeUserPassword(userId, password);
      }

      // Update user status if admin is modifying another user
      if (isAdmin && !isSelf) {
        await dataProvider.updateUserStatus(userId, isEnabled);
      }

      // Update application-specific data
      if (Object.keys(appData).length > 0) {
        const currentRecord = await dataProvider.getOne('users', { id: userId });

        await dataProvider.update('users', {
          id: userId,
          data: appData,
          previousData: currentRecord.data
        });
      }

      notify('User updated successfully', { type: 'success' });
      redirect('show', 'users', userId);
    } catch (error: any) {
      console.error('Error updating user:', error);
      notify(`Error: ${error?.message || 'Failed to update user'}`, { type: 'error' });
    }
  }, [dataProvider, notify, redirect, isAdmin, isSelf, isEnabled]);

  return (
    <Edit
      title={record => `Edit User: ${record?.name || record?.username}`}
      mutationMode="pessimistic"
    >
      <Box>
        <Card sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="user edit tabs"
              sx={{ px: 2 }}
            >
              <Tab
                icon={<PersonIcon />}
                label="User Information"
                id="user-edit-tab-0"
              />
              {isAdmin && !isSelf && (
                <Tab
                  icon={<SecurityIcon />}
                  label="Roles & Permissions"
                  id="user-edit-tab-1"
                />
              )}
              {isAdmin && !isSelf && (
                <Tab
                  icon={<SettingsIcon />}
                  label="Account Settings"
                  id="user-edit-tab-2"
                />
              )}
            </Tabs>
          </Box>

          <SimpleForm
            onSubmit={handleSubmit}
            toolbar={<CustomToolbar />}
            warnWhenUnsavedChanges
          >
            <TabPanel value={activeTab} index={0}>
              <Typography variant="h6" gutterBottom>User Identity</Typography>
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextInput
                      source="username"
                      fullWidth
                      validate={validateUsername}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextInput
                      source="email"
                      fullWidth
                      validate={validateEmail}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>Change Password</Typography>
              <Box sx={{ mb: 3 }}>
                <PasswordInput
                  source="password"
                  fullWidth
                  validate={validatePassword}
                  helperText="Leave empty to keep current password. New password must be at least 8 characters."
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>Profile Information</Typography>
              <Box sx={{ mb: 3 }}>
                <TextInput
                  source="name"
                  fullWidth
                  helperText="User's full name"
                />
              </Box>
            </TabPanel>

            {isAdmin && !isSelf && (
              <TabPanel value={activeTab} index={1}>
                <UserRolesManager />
              </TabPanel>
            )}

            {isAdmin && !isSelf && (
              <TabPanel value={activeTab} index={2}>
                <Typography variant="h6" gutterBottom>Account Status</Typography>
                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isEnabled}
                        onChange={handleEnableToggle}
                      />
                    }
                    label="Account Active"
                  />

                  <Alert severity="info" sx={{ mt: 2 }}>
                    Disabling a user account will prevent them from logging in. The user will not be deleted.
                  </Alert>
                </Box>
              </TabPanel>
            )}
          </SimpleForm>
        </Card>
      </Box>
    </Edit>
  );
};