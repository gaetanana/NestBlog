// src/resources/users/UserRolesManager.tsx
import React, { useState, useEffect, FC } from 'react';
import {
    useDataProvider,
    useRecordContext,
    useNotify,
    useGetIdentity,
} from 'react-admin';
import {
    Card,
    CardHeader,
    CardContent,
    Typography,
    Chip,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Button,
    Alert,
    CircularProgress,
    SelectChangeEvent
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import { User, Role } from '../../types';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

interface UserRolesManagerProps {
    readOnly?: boolean;
}

export const UserRolesManager: FC<UserRolesManagerProps> = ({ readOnly = false }) => {
    const record = useRecordContext<User>();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const { identity } = useGetIdentity();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Check if current user is editing their own profile
    const isSelf = identity && record && identity.id === record.id;

    // Load available roles
    useEffect(() => {
        const fetchRoles = async () => {
            setLoading(true);
            try {
                // Remplace avec un véritable appel API lorsque l'endpoint est disponible
                const mockRoles: Role[] = [
                    { id: 'admin', name: 'admin', description: 'Full administrative access' },
                    { id: 'user', name: 'user', description: 'Standard user access' },
                ];

                setAvailableRoles(mockRoles);

                // Set initial selected roles based on record
                if (record && record.roles) {
                    setSelectedRoles(record.roles);
                }
            } catch (err) {
                console.error('Error fetching roles:', err);
                setError('Failed to load available roles');
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, [record]);

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const { value } = event.target;
        // Handle both string and string[] values
        const newValue = typeof value === 'string' ? value.split(',') : value;
        setSelectedRoles(newValue);
    };

    const handleSave = async () => {
        // Prevent changing your own roles (additional safety check)
        if (isSelf) {
            notify('You cannot change your own roles', { type: 'error' });
            return;
        }

        if (!record) {
            notify('No user record found', { type: 'error' });
            return;
        }

        setSaving(true);
        try {
            // Call the API to update roles
            await dataProvider.updateUserRoles(record.id, selectedRoles);
            notify('User roles updated successfully', { type: 'success' });
        } catch (err) {
            console.error('Error updating roles:', err);
            notify('Failed to update roles', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (!record) return null;

    // Render roles as chips in read-only mode
    if (readOnly || isSelf) {
        return (
            <Card variant="outlined">
                <CardHeader title="User Roles" />
                <CardContent>
                    {record.roles && record.roles.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {record.roles.map((role: string) => (
                                <Chip
                                    key={role}
                                    label={role}
                                    icon={role === 'admin' ? <SecurityIcon /> : <PersonIcon />}
                                    color={role === 'admin' ? 'secondary' : 'primary'}
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    ) : (
                        <Typography color="textSecondary">No roles assigned</Typography>
                    )}

                    {isSelf && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            You cannot modify your own roles
                        </Alert>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Render role selection in edit mode
    return (
        <Card variant="outlined">
            <CardHeader title="Manage User Roles" />
            <CardContent>
                {loading ? (
                    <Box display="flex" justifyContent="center">
                        <CircularProgress size={24} />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel id="role-select-label">Assigned Roles</InputLabel>
                            <Select
                                labelId="role-select-label"
                                id="role-select"
                                multiple
                                value={selectedRoles}
                                onChange={handleChange}
                                input={<OutlinedInput label="Assigned Roles" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(selected as string[]).map((value) => (
                                            <Chip
                                                key={value}
                                                label={value}
                                                icon={value === 'admin' ? <SecurityIcon /> : <PersonIcon />}
                                                color={value === 'admin' ? 'secondary' : 'primary'}
                                            />
                                        ))}
                                    </Box>
                                )}
                                MenuProps={MenuProps}
                            >
                                {availableRoles.map((role) => (
                                    <MenuItem key={role.id} value={role.name}>
                                        <Box display="flex" alignItems="center">
                                            {role.name === 'admin' ? (
                                                <SecurityIcon fontSize="small" sx={{ mr: 1, color: 'secondary.main' }} />
                                            ) : (
                                                <PersonIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                            )}
                                            <Box>
                                                <Typography variant="body1">{role.name}</Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {role.description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Roles'}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
};