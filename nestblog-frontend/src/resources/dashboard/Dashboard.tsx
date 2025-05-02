// src/resources/dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useDataProvider, useGetIdentity, Title } from 'react-admin';
import {
  Card, 
  CardContent, 
  CardHeader, 
  Grid, 
  Typography, 
  Button, 
  Box, 
  CircularProgress, 
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Article as ArticleIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  KeyboardArrowRight as ArrowIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { User } from '../../types';

interface StatCardProps {
  icon: React.ComponentType<any>;
  title: string;
  value: number | string;
  color: string;
}

interface QuickActionCardProps {
  title: string;
  description: string;
  link: string;
  icon: React.ComponentType<any>;
}

interface RecentUserItemProps {
  user: User;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, color }) => (
  <Paper
    elevation={1}
    sx={{
      p: 3,
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider'
    }}
  >
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: `${color}.lighter`,
      borderRadius: '50%',
      width: 56,
      height: 56,
      mr: 2
    }}>
      <Icon sx={{ fontSize: 28, color: `${color}.main` }} />
    </Box>
    <Box>
      <Typography variant="body2" color="textSecondary">
        {title}
      </Typography>
      <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, link, icon: Icon }) => (
  <Paper
    elevation={1}
    component={Link}
    to={link}
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderRadius: 2,
      textDecoration: 'none',
      color: 'text.primary',
      transition: 'all 0.2s',
      border: '1px solid',
      borderColor: 'divider',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3,
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Icon sx={{ mr: 1, color: 'primary.main' }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
      {description}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
      <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
        View
      </Typography>
      <ArrowIcon fontSize="small" color="primary" />
    </Box>
  </Paper>
);

const RecentUserItem: React.FC<RecentUserItemProps> = ({ user }) => (
  <ListItem>
    <ListItemIcon>
      <Avatar sx={{ bgcolor: user.enabled === false ? 'error.light' : 'primary.light' }}>
        {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
      </Avatar>
    </ListItemIcon>
    <ListItemText
      primary={user.name || user.username}
      secondary={
        <Typography variant="body2" color="textSecondary">
          {user.email} • {new Date(user.createdAt).toLocaleDateString()}
        </Typography>
      }
    />
    <Box>
      {user.roles && user.roles.includes('admin') ? (
        <Chip icon={<AdminIcon />} label="Admin" size="small" color="primary" />
      ) : (
        <Chip icon={<PersonIcon />} label="User" size="small" variant="outlined" />
      )}
    </Box>
  </ListItem>
);

export const Dashboard: React.FC = () => {
  const dataProvider = useDataProvider();
  const { identity } = useGetIdentity();

  const [users, setUsers] = useState<User[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch user data
        const { data: userData } = await dataProvider.getList('users', {
          pagination: { page: 1, perPage: 100 },
          sort: { field: 'createdAt', order: 'DESC' },
          filter: {},
        });

        setUsers(userData);

        // Calculate stats
        const activeUsers = userData.filter(user => user.enabled !== false);
        const adminUsers = userData.filter(user =>
          user.roles && user.roles.includes('admin')
        );

        setStats({
          totalUsers: userData.length,
          activeUsers: activeUsers.length,
          adminUsers: adminUsers.length,
        });

        // Get recent users (last 5)
        setRecentUsers(userData.slice(0, 5));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dataProvider]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Title title="Dashboard" />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {identity?.fullName || 'Admin'}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's an overview of your system and recent activity
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={PeopleIcon}
            title="Total Users"
            value={stats.totalUsers}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={PersonIcon}
            title="Active Users"
            value={stats.activeUsers}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={AdminIcon}
            title="Administrators"
            value={stats.adminUsers}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Add New User"
            description="Create a new user account with custom roles and permissions"
            link="/users/create"
            icon={AddIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Manage Users"
            description="View, edit, and manage all user accounts"
            link="/users"
            icon={PeopleIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Manage Content"
            description="Add or edit blog posts, categories, and tags"
            link="/posts"
            icon={ArticleIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="System Settings"
            description="Configure system settings and preferences"
            link="/settings"
            icon={SettingsIcon}
          />
        </Grid>
      </Grid>

      {/* Recent Users */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Recently Added Users"
          action={
            <Button
              component={Link}
              to="/users"
              endIcon={<ArrowIcon />}
            >
              View All
            </Button>
          }
        />
        <Divider />
        <CardContent>
          {recentUsers.length > 0 ? (
            <List>
              {recentUsers.map((user, index) => (
                <React.Fragment key={user.id}>
                  <RecentUserItem user={user} />
                  {index < recentUsers.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No users found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};