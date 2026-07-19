import React, { useState, useEffect } from 'react';
import { 
    TextField, 
    Button, 
    Grid, 
    Typography, 
    FormControlLabel, 
    Checkbox, 
    MenuItem,
    Modal,
    Paper,
    Alert,
    Portal
} from '@mui/material';
import { getAllGrades } from '../services/gradeService';
import { getAllJobPositions } from '../services/jobPositionService';
import { getAllLocations } from '../services/locationService';
import { createEmployee } from '../services/employeeService';
import { CreateEmployee } from '../types/Employee';

interface RegisterModalProps {
    open: boolean;
    onClose: () => void;
    onRegisterSuccess: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ open, onClose, onRegisterSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirm_password: '',
        birth_date: '',
        address: '',
        location: 0,
        join_date: '',
        phone: '',
        marital_status: '',
        grade: 0,
        name: '',
        job_position: 0,
        email: '',
        isAdmin: false,
    });

    const [grades, setGrades] = useState<{ id: number; grade_name: string }[]>([]);
    const [jobPositions, setJobPositions] = useState<{ id: number; job_name: string }[]>([]);
    const [locations, setLocations] = useState<{ id: number; location_name: string }[]>([]);
    const [passwordError, setPasswordError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');

    const handleClose = () => {
        onClose();
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gradeData, jobData, locationData] = await Promise.all([
                    getAllGrades(),
                    getAllJobPositions(),
                    getAllLocations()
                ]);

                const activeLocations = locationData.filter(location => location.status === "Active");

                setGrades(gradeData);
                setJobPositions(jobData);
                setLocations(activeLocations);
            } catch (error) {
                console.error('Error fetching data:', error);
                setAlertMessage('Error fetching data.');
                setAlertSeverity('error');
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => {
                setAlertMessage(null);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: parseInt(e.target.value, 10) });
    };

    const handleIsAdminChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, isAdmin: event.target.checked });
    };

    const handleRegisterSubmit = async () => {
        if (Object.values(formData).some((field) => field === '')) {
            setAlertSeverity('error');
            setAlertMessage('Please complete all fields before submitting.');
            return;
        }

        if (formData.password !== formData.confirm_password) {
            setPasswordError(true);
            setAlertSeverity('error');
            setAlertMessage('Passwords do not match.');
        } else {
            setPasswordError(false);
            setLoading(true);

            try {
                const employeeData: CreateEmployee = {
                    username: formData.username,
                    password: formData.password,
                    birth_date: formData.birth_date,
                    address: formData.address,
                    location_id: formData.location,
                    join_date: formData.join_date,
                    phone: formData.phone,
                    marital_status: formData.marital_status,
                    grade_id: formData.grade,
                    name: formData.name,
                    job_position_id: formData.job_position,
                    email: formData.email,
                    is_admin: formData.isAdmin,
                };

                await createEmployee(employeeData);

                setFormData({
                    username: '',
                    password: '',
                    confirm_password: '',
                    birth_date: '',
                    address: '',
                    location: 0,
                    join_date: '',
                    phone: '',
                    marital_status: '',
                    grade: 0,
                    name: '',
                    job_position: 0,
                    email: '',
                    isAdmin: false,
                });
                setAlertSeverity('success');
                setAlertMessage('Register New Employee Success!');
                handleClose();
                onRegisterSuccess();
            } catch (error) {
                console.error('Error registering employee:', error);
                setAlertSeverity('error');
                setAlertMessage('Error registering employee.');
            } finally {
                setLoading(false);
            }
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
                onClose={handleClose}
                aria-labelledby="modal-register-title"
                aria-describedby="modal-register-description"
            >
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        maxHeight: '98vh',
                        width: 800,
                        overflowY: 'auto',
                        padding: 4,
                        zIndex: 1300
                    }}
                >
                    <Typography 
                        id="modal-register-title" 
                        variant="h6" component="h2" 
                        sx={{ 
                            fontWeight: 'bold', 
                            textAlign: 'center',
                            color: '#DB4437'
                        }}>
                        Register New Employee
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField 
                                label="Name" 
                                fullWidth 
                                name="name" 
                                value={formData.name} 
                                onChange={handleInputChange} 
                                margin="normal"
                                sx={{ 
                                    marginBottom: '5px', 
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
                        <Grid item xs={12}>
                            <TextField 
                                label="Username" 
                                fullWidth 
                                name="username" 
                                value={formData.username} 
                                onChange={handleInputChange} 
                                margin="normal"
                                sx={{ 
                                    marginBottom: '5px', 
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
                        <Grid item xs={12}>
                            <TextField 
                                label="Password" 
                                fullWidth 
                                name="password" 
                                value={formData.password} 
                                onChange={handleInputChange} 
                                margin="normal" 
                                type="password"
                                sx={{ 
                                    marginBottom: '5px', 
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
                        <Grid item xs={12}>
                            <TextField 
                                label="Confirm Password" 
                                fullWidth 
                                name="confirm_password" 
                                value={formData.confirm_password} 
                                onChange={handleInputChange} 
                                margin="normal" 
                                type="password"
                                error={passwordError}
                                helperText={passwordError ? "Passwords do not match" : ""}
                                sx={{ 
                                    marginBottom: '5px', 
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
                        <Grid item xs={12}>
                            <TextField 
                                label="Birth Date" 
                                fullWidth 
                                name="birth_date" 
                                value={formData.birth_date} 
                                onChange={handleInputChange} 
                                margin="normal" 
                                type="date"
                                InputLabelProps={{ shrink: true }} 
                                sx={{ 
                                    marginBottom: '5px', 
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
                        <Grid item xs={12}>
                            <TextField 
                                label="Address" 
                                fullWidth 
                                name="address" 
                                value={formData.address} 
                                onChange={handleInputChange} 
                                margin="normal"
                                sx={{ 
                                    marginBottom: '5px', 
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
                        <Grid item xs={12}>
                            <TextField 
                                label="Phone" 
                                fullWidth 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleInputChange} 
                                margin="normal"
                                sx={{ 
                                    marginBottom: '5px', 
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
                        <Grid item xs={12}>
                            <TextField 
                                label="Email" 
                                fullWidth 
                                name="email" 
                                value={formData.email} 
                                onChange={handleInputChange} 
                                margin="normal" 
                                type="email"
                                sx={{ 
                                    marginBottom: '5px', 
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
                        <Grid item xs={12}>
                            <TextField 
                                select 
                                label="Marital Status" 
                                fullWidth 
                                name="marital_status" 
                                value={formData.marital_status} 
                                onChange={handleInputChange}
                                margin="normal"
                                sx={{ 
                                    marginBottom: '5px', 
                                    "& label.Mui-focused": { 
                                        color: "#DB4437" 
                                    }, 
                                    "& .MuiOutlinedInput-root": { 
                                        "&.Mui-focused fieldset": { 
                                            borderColor: "#DB4437" 
                                        } 
                                    } 
                                }}
                            >
                                <MenuItem value="Single">Single</MenuItem>
                                <MenuItem value="Married">Married</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                select 
                                label="Grade" 
                                fullWidth 
                                name="grade" 
                                value={formData.grade} 
                                onChange={handleSelectChange}
                                margin="normal"
                                sx={{ 
                                    marginBottom: '5px', 
                                    "& label.Mui-focused": { 
                                        color: "#DB4437" 
                                    }, 
                                    "& .MuiOutlinedInput-root": { 
                                        "&.Mui-focused fieldset": { 
                                            borderColor: "#DB4437" 
                                        } 
                                    } 
                                }}
                            >
                                {grades.map((grade) => (
                                    <MenuItem key={grade.id} value={grade.id}>
                                        {grade.grade_name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                select 
                                label="Job Position" 
                                fullWidth 
                                name="job_position" 
                                value={formData.job_position} 
                                onChange={handleSelectChange}
                                margin="normal"
                                sx={{ 
                                    marginBottom: '5px', 
                                    "& label.Mui-focused": { 
                                        color: "#DB4437" 
                                    }, 
                                    "& .MuiOutlinedInput-root": { 
                                        "&.Mui-focused fieldset": { 
                                            borderColor: "#DB4437" 
                                        } 
                                    } 
                                }}
                            >
                                {jobPositions.map((position) => (
                                    <MenuItem key={position.id} value={position.id}>
                                        {position.job_name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                select 
                                label="Location" 
                                fullWidth 
                                name="location" 
                                value={formData.location} 
                                onChange={handleSelectChange}
                                margin="normal"
                                sx={{ 
                                    marginBottom: '5px', 
                                    "& label.Mui-focused": { 
                                        color: "#DB4437" 
                                    }, 
                                    "& .MuiOutlinedInput-root": { 
                                        "&.Mui-focused fieldset": { 
                                            borderColor: "#DB4437" 
                                        } 
                                    } 
                                }}
                            >
                                {locations.map((location) => (
                                    <MenuItem key={location.id} value={location.id}>
                                        {location.location_name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="Join Date" 
                                fullWidth 
                                name="join_date" 
                                value={formData.join_date} 
                                onChange={handleInputChange} 
                                margin="normal" 
                                type="date"
                                InputLabelProps={{ shrink: true }} 
                                sx={{ 
                                    marginBottom: '5px', 
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
                        <Grid item xs={12}>
                            <FormControlLabel 
                                control={
                                    <Checkbox 
                                        checked={formData.isAdmin} 
                                        onChange={handleIsAdminChange} 
                                        color="primary" 
                                    />
                                } 
                                label="Is Admin" 
                            />
                        </Grid>
                    </Grid>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleRegisterSubmit}
                        sx={{ mt: 2, backgroundColor: '#DB4437' }}
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </Button>
                </Paper>
            </Modal>
        </>
    );
};

export default RegisterModal;