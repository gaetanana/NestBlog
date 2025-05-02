// src/resources/sidebar/MySidebar.tsx
import React from 'react';
import { Sidebar, useSidebarState, usePermissions, MenuItemLink } from 'react-admin';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    useMediaQuery,
    Theme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';

export const MySidebar = (props: any) => {
    const [open] = useSidebarState();
    const { permissions } = usePermissions();
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
    const isAdmin = Array.isArray(permissions) && permissions.includes('admin');

    return (
        <Sidebar
            {...props}
            sx={{
                '& .RaSidebar-drawerPaper': {
                    backgroundColor: 'background.paper',
                    color: 'text.primary',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                }}
            >
                {/* App Logo and Title */}
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <img
                        src="/path-to-your-logo.png" // Replace with your actual logo path
                        alt="NestBlog Logo"
                        style={{ width: 32, height: 32, marginRight: 12 }}
                    />
                    {open && (
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}
                        >
                            NestBlog
                        </Typography>
                    )}
                </Box>

                {/* Main Navigation Links */}
                <List component="nav" sx={{ flexGrow: 1, px: 1, py: 1 }}>
                    <MenuItemLink
                        to="/dashboard"
                        primaryText="Dashboard"
                        leftIcon={<DashboardIcon />}
                        dense={isSmall}
                    />

                    {/* Standard menu items come from resources */}

                    {/* Divider for admin-only sections */}
                    {isAdmin && (
                        <>
                            <Divider sx={{ my: 1.5 }} />
                            <ListItem sx={{ px: 2, py: 0.5 }}>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="caption"
                                            color="textSecondary"
                                            sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                                        >
                                            Administration
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        </>
                    )}

                    {/* Admin-only links */}
                    {isAdmin && (
                        <MenuItemLink
                            to="/settings"
                            primaryText="System Settings"
                            leftIcon={<SettingsIcon />}
                            dense={isSmall}
                        />
                    )}
                </List>

                {/* App Info Footer */}
                {open && (
                    <Box
                        sx={{
                            p: 2,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                            textAlign: 'center',
                        }}
                    >
                        NestBlog Admin v0.1
                    </Box>
                )}
            </Box>
        </Sidebar>
    );
};