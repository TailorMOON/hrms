import React, { useState, useEffect } from 'react';
import { 
    TextField, 
    Button, 
    Grid, 
    Typography, 
    Modal, 
    Paper, 
    Alert,
    Portal
} from '@mui/material';
import { createLocation } from '../services/locationService';
import { LocationCreateRequest } from '../types/Location';

const LocationModal: React.FC<{ open: boolean; onClose: () => void; onRegisterSuccess: () => void;}> = ({ open, onClose, onRegisterSuccess}) => {
    const [formData, setFormData] = useState({ location_name: '' });
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');

    const handleClose = () => {
        setFormData({ location_name: '' });
        onClose();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegisterSubmit = async () => {
        setLoading(true);
        try {
            const locationData: LocationCreateRequest = { 
                location_name: formData.location_name, 
                status: 'Active'
            };
    
            await createLocation(locationData);
            setFormData({ location_name: '' });
            setAlertSeverity('success');
            setAlertMessage('Location created successfully!');
            handleClose();
            onRegisterSuccess();
        } catch (error) {
            console.error('Error creating location:', error);
            setAlertSeverity('error');
            setAlertMessage('Error creating location.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => {
                setAlertMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    return (
        <>
            {alertMessage && (
                <Portal>
                    <Alert 
                        variant="filled" 
                        severity={alertSeverity} 
                        sx={{ 
                            position: 'fixed', 
                            top: 10, 
                            left: '50%', 
                            transform: 'translateX(-50%)', 
                            zIndex: 1600,
                            width: '25%' 
                        }}
                    >
                        {alertMessage}
                    </Alert>
                </Portal>
            )}
            <Modal open={open} onClose={handleClose}>
                <Paper 
                    sx={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        padding: 4, 
                        width: 400 
                    }}
                >
                    <Typography 
                        variant="h6" 
                        component="h2" 
                        sx={{ 
                            fontWeight: 'bold', 
                            textAlign: 'center' 
                        }}
                    >
                        Register New Location
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField 
                                label="Location Name" 
                                fullWidth 
                                name="location_name" 
                                value={formData.location_name} 
                                onChange={handleInputChange} 
                                margin="normal"
                                sx={{ 
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
                        </Grid>
                    </Grid>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleRegisterSubmit}
                        sx={{ 
                            mt: 2, 
                            backgroundColor: '#DB4437',
                            '&.Mui-disabled': {
                                backgroundColor: '#f0f0f0',
                                color: '#999',
                            },
                        }}
                        disabled={loading || !formData.location_name}
                    >
                        {loading ? 'Creating...' : 'Create Location'}
                    </Button>
                </Paper>
            </Modal>
        </>
    );
};

export default LocationModal;
