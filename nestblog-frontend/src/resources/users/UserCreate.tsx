// src/resources/users/UserCreate.tsx
import { useCallback } from 'react';
import { 
  Create, 
  SimpleForm, 
  TextInput, 
  PasswordInput,
  required,
  email,
  minLength,
  useNotify,
  useRedirect,
  SaveButton,
  Toolbar,
  useDataProvider
} from 'react-admin';
import { Box, Typography, Grid, Alert, Divider } from '@mui/material';

// Validation functions
const validateEmail = [required(), email()];
const validateUsername = [required(), minLength(3)];
const validatePassword = [required(), minLength(8)];
const validateName = [required()];

// Custom toolbar
const CreateToolbar = (props) => (
  <Toolbar {...props}>
    <SaveButton label="Create User" />
  </Toolbar>
);

export const UserCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const dataProvider = useDataProvider();

  const handleSubmit = useCallback(async (values) => {
    try {
      // Extract data from form
      const { username, email, password, name, ...rest } = values;
      
      // Prepare data for API
      const userData = {
        username,
        email,
        password,
        name,
        enabled: true,
        ...rest
      };
      
      // Create user through the dataProvider
      const response = await dataProvider.create('users', { data: userData });
      
      notify('User created successfully', { type: 'success' });
      redirect('show', 'users', response.data.id);
    } catch (error) {
      console.error('Error creating user:', error);
      notify(`Error: ${error?.message || 'Failed to create user'}`, { type: 'error' });
    }
  }, [dataProvider, notify, redirect]);

  return (
    <Create>
      <SimpleForm 
        onSubmit={handleSubmit}
        toolbar={<CreateToolbar />}
        warnWhenUnsavedChanges
      >
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          New User Account
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Create a new user account. All fields marked with * are required.
        </Alert>
        
        <Typography variant="h6" gutterBottom>
          Authentication Information
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextInput 
                source="username" 
                fullWidth 
                validate={validateUsername}
                helperText="Username must be at least 3 characters"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextInput 
                source="email" 
                fullWidth 
                validate={validateEmail}
                helperText="Enter a valid email address"
              />
            </Grid>
            <Grid item xs={12}>
              <PasswordInput
                source="password"
                fullWidth
                validate={validatePassword}
                helperText="Password must be at least 8 characters"
              />
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Profile Information
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextInput 
                source="name" 
                fullWidth 
                validate={validateName}
                helperText="Enter the user's full name"
              />
            </Grid>
          </Grid>
        </Box>
      </SimpleForm>
    </Create>
  );
};