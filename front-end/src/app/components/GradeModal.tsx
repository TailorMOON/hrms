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
import { createGrade } from '../services/gradeService';
import { GradeCreateRequest } from '../types/Grade';

const GradeModal: React.FC<{ open: boolean; onClose: () => void; onRegisterSuccess: () => void }> = ({ open, onClose, onRegisterSuccess}) => {
    const [formData, setFormData] = useState({ grade_name: '' });
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');

    const handleClose = () => {
        setFormData({ grade_name: '' });
        onClose();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegisterSubmit = async () => {    
        setLoading(true);
        try {
            const gradeData: GradeCreateRequest = { grade_name: formData.grade_name };
            
            await createGrade(gradeData);
    
            setFormData({ grade_name: '' });
    
            setAlertSeverity('success');
            setAlertMessage('Grade created successfully!');
            handleClose();
            onRegisterSuccess();
        } catch (error) {
            setAlertSeverity('error');
            setAlertMessage('Error creating grade.');
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
            
            <Modal 
                open={open} 
                onClose={handleClose}>
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
                        Register New Grade
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField 
                                label="Grade Name" 
                                fullWidth 
                                name="grade_name" 
                                value={formData.grade_name} 
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
                        disabled={loading || !formData.grade_name}
                    >
                        {loading ? 'Creating...' : 'Create Grade'}
                    </Button>
                </Paper>
            </Modal>
        </>
    );
};

export default GradeModal;
