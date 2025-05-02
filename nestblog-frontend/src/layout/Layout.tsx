// src/layout/Layout.tsx
import { Layout as RaLayout, AppBar as RaAppBar, Menu as RaMenu, UserMenu, usePermissions, UserMenuProps, AppBarProps, MenuProps, LayoutProps } from 'react-admin';
import { Typography, Box, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import { Link } from 'react-router-dom';
import { JSX } from 'react/jsx-runtime';

const CustomUserMenu = (props: JSX.IntrinsicAttributes & UserMenuProps) => (
  <UserMenu {...props}>
    <MenuItem
      component={Link}
      to="/users/me"
      sx={{ textDecoration: 'none', color: 'inherit' }}
    >
      <ListItemIcon>
        <PersonIcon />
      </ListItemIcon>
      <ListItemText>My Profile</ListItemText>
    </MenuItem>
  </UserMenu>
);

const AppBar = (props: JSX.IntrinsicAttributes & AppBarProps) => (
  <RaAppBar {...props}>
    <Typography variant="h6" component="span" sx={{ flex: 1 }}>
      NestBlog
    </Typography>
    <CustomUserMenu />
  </RaAppBar>
);

const Menu = (props: JSX.IntrinsicAttributes & MenuProps) => {
  const { permissions } = usePermissions();
  const isAdmin = permissions?.includes('admin');

  return (
    <RaMenu {...props}>
      {isAdmin && (
        <Box mt={1}>
          <Typography variant="subtitle2" sx={{ paddingLeft: 2, color: 'text.secondary' }}>
            Administration
          </Typography>
          <MenuItem
            component={Link}
            to="/users"
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText>Users</ListItemText>
          </MenuItem>
        </Box>
      )}
    </RaMenu>
  );
};

export const Layout = (props: JSX.IntrinsicAttributes & LayoutProps) => (
  <RaLayout
    {...props}
    appBar={AppBar}
    menu={Menu}
  />
);