import { useCallback } from 'react';
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
  Toolbar
} from 'react-admin';
import { Box, Typography, Divider } from '@mui/material';

// Composant de barre d'outils personnalisé
const CustomToolbar = (props: any) => (
  <Toolbar {...props}>
    <SaveButton />
  </Toolbar>
);

export const UserEdit = () => {
  const dataProvider = useDataProvider();
  const redirect = useRedirect();
  const notify = useNotify();
  
  // Utiliser useCallback pour créer la fonction de soumission
  const handleSubmit = useCallback(async (values: any) => {
    try {
      const record = values;
      const userId = record.id;
      
      // Extraction des données d'identité
      const { username, email, password, ...appData } = values;
      
      // Mise à jour des données d'identité (si fournies)
      if (username || email) {
        await dataProvider.updateUserIdentity(userId, { 
          username, 
          email 
        });
      }
      
      // Mise à jour du mot de passe (si fourni)
      if (password && password.trim() !== '') {
        await dataProvider.changeUserPassword(userId, password);
      }
      
      // Mise à jour des données spécifiques à l'application
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
  }, [dataProvider, notify, redirect]);

  return (
    <Edit>
      <SimpleForm onSubmit={handleSubmit} toolbar={<CustomToolbar />}>
        <Typography variant="h6" gutterBottom>Informations d'identité</Typography>
        <Box sx={{ mb: 3 }}>
          <TextInput source="username" fullWidth />
          <TextInput source="email" fullWidth />
          <PasswordInput
            source="password"
            fullWidth
            helperText="Laissez vide pour conserver le mot de passe actuel"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Informations spécifiques à l'application
        </Typography>
        <Box sx={{ mb: 3 }}>
          <TextInput source="name" fullWidth />
        </Box>
      </SimpleForm>
    </Edit>
  );
};