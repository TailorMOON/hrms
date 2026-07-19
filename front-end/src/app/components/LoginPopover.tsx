import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Paper, 
    TextField, 
    Button,
    Grid, 
    Popover 
} from '@mui/material';
import { login } from '../services/authService';

interface LoginPopoverProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    handleClose: () => void;
    handleLoginSuccess: (username: string, isAdmin: boolean) => void;
}

const LoginPopover: React.FC<LoginPopoverProps> = ({ anchorEl, open, handleClose, handleLoginSuccess }) => {
    const [nip, setNip] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const router = useRouter();

    const handleNipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNip(event.target.value.toUpperCase());
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const handleLogin = async () => {
        try {
            const response = await login(nip, password);
            console.log('Response from backend:', response);
            
            if (response.token) {
                handleLoginSuccess(response.username, response.is_admin);
                router.push('/');
            }
            
            setNip('');
            setPassword('');
            handleClose();

        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Login failed with error message:', error.message);
                alert("Incorrect NIP or password.");
            } else {
                console.error('Unexpected error:', error);
                alert("An unexpected error occurred.");
            }
        }
    };

    return (
        <>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Paper 
                    sx={{ 
                        padding: 2,
                        width: '300px' 
                    }}
                >
                    <TextField
                        label="NIP"
                        type="text"
                        fullWidth
                        value={nip}
                        onChange={handleNipChange}
                        margin="dense"
                        variant="outlined"
                        sx={{ 
                            marginBottom: 2,
                            "& label.Mui-focused": { 
                                color: "#DB4437" 
                            },
                            "& .MuiOutlinedInput-root": {
                                "&.Mui-focused fieldset": {
                                    borderColor: "#DB4437"
                                }
                            }
                        }}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={handlePasswordChange}
                        margin="dense"
                        variant="outlined"
                        sx={{ 
                            marginBottom: 2,
                            "& label.Mui-focused": { 
                                color: "#DB4437" 
                            },
                            "& .MuiOutlinedInput-root": { 
                                "&.Mui-focused fieldset": { 
                                    borderColor: "#DB4437" 
                                } 
                            }
                        }}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleLogin}
                        sx={{ 
                            mt: 2, 
                            backgroundColor: '#DB4437' 
                        }}
                    >
                        LOGIN
                    </Button>
                </Paper>
            </Popover>
        </>
    );
};

export default LoginPopover;
