import React, { useState, useEffect } from 'react';
import { 
    TextField, 
    Button, 
    Grid, 
    Typography, 
    Modal, 
    Paper, 
    Alert, 
    Checkbox, 
    FormControlLabel, 
    Portal 
} from '@mui/material';
import { Location } from '../types/Location';
import { updateLocation } from '../services/locationService';

interface EditLocationModalProps {
    open: boolean;
    onClose: () => void;
    location: Location;
    onUpdateSuccess: () => void;
}

const EditLocationModal: React.FC<EditLocationModalProps> = ({ open, onClose, location, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        id: location.id,
        location_name: location.location_name,
        status: location.status === 'active',
    });
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');

    useEffect(() => {
        setFormData({
            id: location.id,
            location_name: location.location_name,
            status: location.status === 'Active',
        });
    }, [location]);

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => {
                setAlertMessage(null);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, status: e.target.checked });
    };

    const handleUpdateSubmit = async () => {
        setLoading(true);
        try {
            const updatedData = {
                ...formData,
                status: formData.status ? 'Active' : 'Inactive',
            };
            await updateLocation(formData.id, updatedData);
            setAlertSeverity('success');
            setAlertMessage('Location updated successfully!');
            setTimeout(() => {
                onClose();
                onUpdateSuccess();
            }, 1000);
        } catch (error) {
            setAlertSeverity('error');
            setAlertMessage('Error updating location.');
        } finally {
            setLoading(false);
        }
    };

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

            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="modal-edit-location"
            >
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        maxHeight: '98vh',
                        width: 400,
                        overflowY: 'auto',
                        padding: 4,
                        zIndex: 1300
                    }}
                >
                    <Typography 
                        id="modal-edit-location" 
                        variant="h6" 
                        component="h2" 
                        sx={{ 
                            fontWeight: 'bold', 
                            textAlign: 'center' 
                        }}>
                        Edit Location
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
                                    "& label.Mui-focused": { color: "#DB4437" },
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": { borderColor: "#DB4437" }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox 
                                        checked={formData.status} 
                                        onChange={handleStatusChange} 
                                        color="primary" 
                                    />
                                }
                                label="Active Status"
                            />
                        </Grid>
                    </Grid>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleUpdateSubmit}
                        sx={{ 
                            mt: 2, 
                            backgroundColor: '#DB4437' 
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Location'}
                    </Button>
                </Paper>
            </Modal>
        </>
    );
};

export default EditLocationModal;
