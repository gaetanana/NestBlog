// src/components/Login.tsx
import React, { useState } from 'react';
import { useLogin, useNotify } from 'react-admin';
import { 
  Box, 
  Card, 
  CardContent, 
  CardActions, 
  TextField, 
  Button, 
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const LoginPage = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const login = useLogin();
    const notify = useNotify();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login({ usernameOrEmail, password })
            .catch(() => notify('Invalid credentials'));
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            minHeight="100vh"
        >
            <Card sx={{ minWidth: 300, maxWidth: 500 }}>
                <Box component="form" onSubmit={handleSubmit}>
                    <CardContent>
                        <Typography variant="h5" component="div" gutterBottom>
                            Login to NestBlog
                        </Typography>
                        <Box mb={2}>
                            <TextField
                                label="Username or Email"
                                variant="outlined"
                                value={usernameOrEmail}
                                onChange={(e) => setUsernameOrEmail(e.target.value)}
                                fullWidth
                                margin="normal"
                                required
                            />
                        </Box>
                        <Box mb={2}>
                            <TextField
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                                margin="normal"
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>
                    </CardContent>
                    <CardActions>
                        <Button
                            variant="contained"
                            type="submit"
                            color="primary"
                            fullWidth
                        >
                            Login
                        </Button>
                    </CardActions>
                </Box>
            </Card>
        </Box>
    );
};

export default LoginPage;