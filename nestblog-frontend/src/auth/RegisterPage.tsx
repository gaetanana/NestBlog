// src/auth/RegisterPage.tsx
import React, { useState } from 'react';
import { useNotify, useRedirect } from 'react-admin';
import { TextField, Button, Typography, Container, Box, Paper, Link } from '@mui/material';
import axios from 'axios';

const RegisterPage = () => {
    const [formState, setFormState] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });
    const [loading, setLoading] = useState(false);
    const notify = useNotify();
    const redirect = useRedirect();

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if (formState.password !== formState.confirmPassword) {
            notify('Passwords do not match', { type: 'error' });
            return;
        }

        setLoading(true);
        try {
            await axios.post('http://localhost:3000/auth/register', {
                username: formState.username,
                email: formState.email,
                password: formState.password,
                firstName: formState.firstName,
                lastName: formState.lastName
            });

            notify('Registration successful! You can now log in.', { type: 'success' });
            redirect('/login');
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                notify((error as any).response?.data?.message || 'Registration failed', { type: 'error' });
            } else {
                notify('Registration failed', { type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Create an Account
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        value={formState.username}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={formState.email}
                        onChange={handleChange}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            margin="normal"
                            fullWidth
                            id="firstName"
                            label="First Name"
                            name="firstName"
                            value={formState.firstName}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            id="lastName"
                            label="Last Name"
                            name="lastName"
                            value={formState.lastName}
                            onChange={handleChange}
                        />
                    </Box>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        value={formState.password}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        value={formState.confirmPassword}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </Button>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2">
                            Already have an account?{' '}
                            <Link href="#/login" underline="hover">
                                Sign in
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default RegisterPage;