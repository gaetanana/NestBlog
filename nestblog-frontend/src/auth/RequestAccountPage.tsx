// src/auth/RequestAccountPage.tsx
import React, { useState } from 'react';
import { useNotify } from 'react-admin';
import { TextField, Button, Typography, Container, Box, Paper, Link } from '@mui/material';
import axios from 'axios';

const RequestAccountPage = () => {
    const [formState, setFormState] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const notify = useNotify();

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        setLoading(true);
        try {
            await axios.post('http://localhost:3001/account-requests', formState);

            notify('Your account request has been submitted! An administrator will review it soon.', { type: 'success' });
            // Clear the form
            setFormState({
                username: '',
                email: '',
                firstName: '',
                lastName: '',
                reason: ''
            });
        } catch (error:unknown) {
            if (axios.isAxiosError(error)) {
                notify(`Error: ${error.response?.data.message}`, { type: 'error' });
            } else {
                notify('An unexpected error occurred. Please try again later.', { type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Request an Account
                </Typography>
                <Typography variant="body1" align="center" sx={{ mb: 3 }}>
                    Fill out this form to request an account. An administrator will review your request.
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Desired Username"
                        name="username"
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
                        type="email"
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
                        id="reason"
                        label="Reason for Account Request"
                        name="reason"
                        multiline
                        rows={4}
                        value={formState.reason}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
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

export default RequestAccountPage;