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
import { JobPosition } from '../types/JobPosition';
import { updateJobPosition } from '../services/jobPositionService';

interface EditJobModalProps {
    open: boolean;
    onClose: () => void;
    jobPosition: JobPosition;
    onUpdateSuccess: () => void;

}

const EditJobModal: React.FC<EditJobModalProps> = ({ open, onClose, jobPosition, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        id: jobPosition.id,
        job_name: jobPosition.job_name,
    });
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');

    useEffect(() => {
        setFormData({
            id: jobPosition.id,
            job_name: jobPosition.job_name,
        });
    }, [jobPosition]);

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

    const handleUpdateSubmit = async () => {
        setLoading(true);
        try {
            await updateJobPosition(formData.id, formData);
            setAlertSeverity('success');
            setAlertMessage('Job position updated successfully!');
            setTimeout(() => {
                onClose();
                onUpdateSuccess();
            }, 1000);
        } catch (error) {
            setAlertSeverity('error');
            setAlertMessage('Error updating job position.');
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
                aria-labelledby="modal-edit-job"
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
                        id="modal-edit-job" 
                        variant="h6" 
                        component="h2" 
                        sx={{ 
                            fontWeight: 'bold', 
                            textAlign: 'center' 
                        }}
                    >
                        Edit Job Position
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField 
                                label="Job Name" 
                                fullWidth 
                                name="job_name" 
                                value={formData.job_name} 
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
                    </Grid>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleUpdateSubmit}
                        sx={{ mt: 2, backgroundColor: '#DB4437' }}
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Job Position'}
                    </Button>
                </Paper>
            </Modal>
        </>
    );
};

export default EditJobModal;