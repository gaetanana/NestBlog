// src/resources/users/UserProfile.tsx
import React, { useState } from 'react';
import {
    useRecordContext,
    useGetIdentity,
    usePermissions,
    useDataProvider,
    useNotify,
    useRedirect,
    useRefresh
} from 'react-admin';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Avatar,
    Button,
    Divider,
    Tabs,
    Tab,
    Paper,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from '@mui/material';
import {
    Person as PersonIcon,
    Edit as EditIcon,
    Key as KeyIcon,
    Security as SecurityIcon,
    EventNote as ActivityIcon
} from '@mui/icons-material';
import { User } from '../../types';

interface TabPanelProps {
    children?: React.ReactNode;
    value: number;
    index: number;
    [key: string]: any;
}

interface UserProfileHeaderProps {
    user: User;
    onEdit: () => void;
}

interface AccountInfoTabProps {
    user: User;
}

interface SecurityTabProps {
    user: User;
    onChangePassword: () => void;
}

interface ActivityTabProps {
    user: User;
}

interface UserActivity {
    id: number | string;
    action: string;
    date: string;
    details: string;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
};

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ user, onEdit }) => {
    if (!user) return null;

    const fullName = user.name || user.username;
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <Grid container spacing={2} alignItems="center">
            <Grid item>
                <Avatar
                    sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'primary.main',
                        fontSize: '2rem'
                    }}
                >
                    {initials}
                </Avatar>
            </Grid>
            <Grid item xs>
                <Typography variant="h5" component="h1">
                    {fullName}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    {user.email}
                </Typography>
                <Box sx={{ mt: 1 }}>
                    {user.roles && user.roles.map((role) => (
                        <Box
                            key={role}
                            component="span"
                            sx={{
                                mr: 1,
                                px: 1.5,
                                py: 0.5,
                                bgcolor: role === 'admin' ? 'secondary.light' : 'primary.light',
                                color: role === 'admin' ? 'secondary.dark' : 'primary.dark',
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                display: 'inline-block'
                            }}
                        >
                            {role}
                        </Box>
                    ))}
                </Box>
            </Grid>
            <Grid item>
                <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={onEdit}
                >
                    Edit Profile
                </Button>
            </Grid>
        </Grid>
    );
};

const AccountInfoTab: React.FC<AccountInfoTabProps> = ({ user }) => {
    if (!user) return null;

    return (
        <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
            <List disablePadding>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemText
                        primary="Username"
                        secondary={user.username}
                        primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                        secondaryTypographyProps={{ variant: 'body1' }}
                    />
                </ListItem>
                <Divider component="li" />

                <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemText
                        primary="Email"
                        secondary={user.email}
                        primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                        secondaryTypographyProps={{ variant: 'body1' }}
                    />
                </ListItem>
                <Divider component="li" />

                <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemText
                        primary="Full Name"
                        secondary={user.name || 'Not specified'}
                        primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                        secondaryTypographyProps={{ variant: 'body1' }}
                    />
                </ListItem>
                <Divider component="li" />

                <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemText
                        primary="Account Status"
                        secondary={user.enabled === false ? 'Disabled' : 'Active'}
                        primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                        secondaryTypographyProps={{
                            variant: 'body1',
                            color: user.enabled === false ? 'error' : 'success.main',
                            fontWeight: 'medium'
                        }}
                    />
                </ListItem>
                <Divider component="li" />

                <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemText
                        primary="Account Created"
                        secondary={new Date(user.createdAt).toLocaleString()}
                        primaryTypographyProps={{ variant: 'subtitle2', color: 'textSecondary' }}
                        secondaryTypographyProps={{ variant: 'body1' }}
                    />
                </ListItem>
            </List>
        </Paper>
    );
};

const SecurityTab: React.FC<SecurityTabProps> = ({ user, onChangePassword }) => {
    if (!user) return null;

    return (
        <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Password
                </Typography>
                <Typography variant="body2" paragraph>
                    Your password was last changed on: Not available
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<KeyIcon />}
                    onClick={onChangePassword}
                >
                    Change Password
                </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    User Roles
                </Typography>
                <Typography variant="body2" paragraph>
                    Your account has the following access levels:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {user.roles && user.roles.map((role) => (
                        <Box
                            key={role}
                            sx={{
                                px: 2,
                                py: 1,
                                bgcolor: 'background.default',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <SecurityIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="body2" fontWeight="medium">
                                {role}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Paper>
    );
};

const ActivityTab: React.FC<ActivityTabProps> = ({ user }) => {
    if (!user) return null;

    // In a real application, you'd fetch activity data from the backend
    const mockActivities: UserActivity[] = [
        {
            id: 1,
            action: 'Login',
            date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            details: 'Successfully logged in from IP 192.168.1.1',
        },
        {
            id: 2,
            action: 'Profile Update',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
            details: 'Updated profile information',
        },
        {
            id: 3,
            action: 'Password Change',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
            details: 'Changed account password',
        },
    ];

    return (
        <Paper elevation={0} variant="outlined" sx={{ p: 0 }}>
            <List>
                {mockActivities.map((activity) => (
                    <React.Fragment key={activity.id}>
                        <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                                    <ActivityIcon />
                                </Avatar>
                            </Box>
                            <ListItemText
                                primary={activity.action}
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="textPrimary">
                                            {activity.details}
                                        </Typography>
                                        <br />
                                        <Typography component="span" variant="caption" color="textSecondary">
                                            {new Date(activity.date).toLocaleString()}
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                        <Divider component="li" />
                    </React.Fragment>
                ))}
                {mockActivities.length === 0 && (
                    <ListItem>
                        <ListItemText
                            primary="No activity recorded"
                            secondary="Your account activity will appear here"
                        />
                    </ListItem>
                )}
            </List>
        </Paper>
    );
};

export const UserProfile: React.FC = () => {
    const record = useRecordContext<User>();
    const { identity } = useGetIdentity();
    const { permissions } = usePermissions();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const redirect = useRedirect();
    const refresh = useRefresh();

    const [activeTab, setActiveTab] = useState(0);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleEditProfile = () => {
        if (record && record.id) {
            redirect('edit', 'users', record.id);
        }
    };

    const handlePasswordDialogOpen = () => {
        setPasswordDialogOpen(true);
    };

    const handlePasswordDialogClose = () => {
        setPasswordDialogOpen(false);
        setNewPassword('');
        setConfirmPassword('');
    };

    const handlePasswordChange = async () => {
        if (!record) return;

        if (newPassword !== confirmPassword) {
            notify('Passwords do not match', { type: 'error' });
            return;
        }

        if (newPassword.length < 8) {
            notify('Password must be at least 8 characters long', { type: 'error' });
            return;
        }

        try {
            await dataProvider.changeUserPassword(record.id, newPassword);
            notify('Password changed successfully', { type: 'success' });
            handlePasswordDialogClose();
        } catch (error) {
            console.error('Error changing password:', error);
            notify('Error changing password', { type: 'error' });
        }
    };

    // Check if current user is looking at their own profile
    const isSelf = identity && record && identity.id === record.id;

    // Check if current user is an admin
    const isAdmin = Array.isArray(permissions) && permissions.includes('admin');

    if (!record) return null;

    return (
        <Box>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <UserProfileHeader
                        user={record}
                        onEdit={handleEditProfile}
                    />
                </CardContent>
            </Card>

            <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        aria-label="profile tabs"
                        sx={{ px: 2 }}
                    >
                        <Tab icon={<PersonIcon />} label="Account" id="profile-tab-0" />
                        <Tab icon={<SecurityIcon />} label="Security" id="profile-tab-1" />
                        {(isSelf || isAdmin) && (
                            <Tab icon={<ActivityIcon />} label="Activity" id="profile-tab-2" />
                        )}
                    </Tabs>
                </Box>

                <TabPanel value={activeTab} index={0}>
                    <AccountInfoTab user={record} />
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    <SecurityTab
                        user={record}
                        onChangePassword={handlePasswordDialogOpen}
                    />
                </TabPanel>

                {(isSelf || isAdmin) && (
                    <TabPanel value={activeTab} index={2}>
                        <ActivityTab user={record} />
                    </TabPanel>
                )}
            </Card>

            {/* Password Change Dialog */}
            <Dialog
                open={passwordDialogOpen}
                onClose={handlePasswordDialogClose}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Please enter a new password. Password must be at least 8 characters long.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Password"
                        type="password"
                        fullWidth
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handlePasswordDialogClose}>Cancel</Button>
                    <Button
                        onClick={handlePasswordChange}
                        variant="contained"
                        disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                    >
                        Change Password
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};