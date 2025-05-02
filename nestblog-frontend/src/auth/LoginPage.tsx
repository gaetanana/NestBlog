// src/auth/LoginPage.tsx
import React, { useState } from 'react';
import { Login, useLogin, useNotify } from 'react-admin';
import { Button, TextField, Box, Typography, Container, Paper, Link } from '@mui/material';

const LoginPage = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const login = useLogin();
    const notify = useNotify();

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        login({ usernameOrEmail, password })
            .catch(() => notify('Invalid credentials', { type: 'error' }));
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Welcome to NestBlog
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="usernameOrEmail"
                        label="Username or Email"
                        name="usernameOrEmail"
                        autoComplete="username"
                        autoFocus
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2">
                            Don't have an account?{' '}
                            <Link href="#/request-account" underline="hover">
                                Request access
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginPage;