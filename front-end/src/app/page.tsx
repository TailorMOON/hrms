"use client";

import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    Paper, 
    Button, 
    TextField, 
    Box, 
    Divider,
    Portal,
    Alert,
    CircularProgress
} from '@mui/material';
import { QrReader } from 'react-qr-reader';
import { getEmployeeByNIP } from './services/employeeService';
import { getAttendanceByDate, createAttendance, updateAttendance } from './services/attendanceService';
import { Attendance } from './types/Attendance';


const formatLocalTime = () => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
    const time = now.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    return { day, date, time, formattedDate: `${day}, ${date} | ${time}` };
};

const HomePage: React.FC = () => {
    const [action, setAction] = useState<'checkin' | 'checkout' | null>(null);
    const [nip, setNip] = useState<string>('');
    const [currentTime, setCurrentTime] = useState<string>('');
    const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
    const [expectedQrCode, setExpectedQrCode] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const alertTimeoutDuration = 3000;

    const handleNipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNip(event.target.value.toUpperCase());
    };

    useEffect(() => {
        const updateTime = () => {
            const { formattedDate } = formatLocalTime();
            setCurrentTime(formattedDate);
        };
        
        const timer = setInterval(updateTime, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (alertMessage) {
          const timer = setTimeout(() => setAlertMessage(null), alertTimeoutDuration);
          return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const employee = await getEmployeeByNIP(nip);
            if (!employee) {
                setAlertSeverity('error');
                setAlertMessage('NIP not found');
                setIsLoading(false); 
                return;
            }
    
            const now = formatLocalTime();
            const formattedDate = now.date.split('/').reverse().join('-');

            if (action === 'checkin') {
                const attendances = await getAttendanceByDate(nip, formattedDate, formattedDate, 1, 0);
                if (attendances && attendances.length > 0) {
                    setAlertSeverity('error');
                    setAlertMessage('You have already checked in today!');
                    setIsLoading(false);
                    return;
                }
            }

            const requestBody = JSON.stringify({ nip });
            console.log('Body sent to backend:', requestBody);
    
            const response = await fetch('http://localhost:8080/qrcode/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                setAlertSeverity('error');
                setAlertMessage(errorResponse.message || 'Failed to generate QR code');
                setIsLoading(false);
                return;
            }
    
            const data = await response.json();
            setExpectedQrCode(data.token);
    
            setIsCameraOpen(true);
            setIsLoading(false);
        } catch (error: any) {
            if (error.response) {
                if (error.response.status === 500) {
                    setAlertSeverity('error');
                    setAlertMessage('NIP not found');
                    setIsLoading(false); 
                } else {
                    setAlertSeverity('error');
                    setAlertMessage('Unexpected error occurred');
                    setIsLoading(false); 
                }
            } else {
                console.error('Error fetching employee data:', error);
                setAlertSeverity('error');
                setAlertMessage('An error occurred while checking the NIP');
                setIsLoading(false); 
            }
        }    
    };    

    const [isScanning, setIsScanning] = useState<boolean>(false);

    const [shouldCreate, setShouldCreate] = useState<boolean>(false);
    const [shouldUpdate, setShouldUpdate] = useState<boolean>(false);
    const [attendanceToUpdate, setAttendanceToUpdate] = useState<Attendance | null>(null);

    const handleQrScan = async (result: string | null) => {
        if (result && !isScanning) {
            setIsScanning(true);
    
            if (result === expectedQrCode) {
                const now = formatLocalTime();
                const formattedDate = now.date.split('/').reverse().join('-');
                const formattedTime = now.time;
    
                const checkInLimit = new Date();
                checkInLimit.setHours(8, 31, 0, 0);
    
                const currentTime = new Date();
                const isLate = currentTime.getTime() > checkInLimit.getTime();
    
                try {
                    if (action === 'checkin') {
                        const newAttendanceData: Attendance = {
                            employee_id: nip,
                            date: formattedDate,
                            check_in_time: formattedTime,
                            check_out_time: '00:00:00', 
                            is_late: isLate,
                        };
                        setShouldCreate(true);
                        setAttendanceToUpdate(newAttendanceData);
                    } else if (action === 'checkout') {
                        const attendances = await getAttendanceByDate(nip, formattedDate, formattedDate, 1, 0);
                        if (attendances && attendances.length > 0) {
                            const existingAttendance = attendances[0];
                            if (existingAttendance.id !== undefined) {
                                setShouldUpdate(true);
                                setAttendanceToUpdate({
                                    id: existingAttendance.id,
                                    employee_id: existingAttendance.employee_id,
                                    date: existingAttendance.date,
                                    check_in_time: existingAttendance.check_in_time,
                                    check_out_time: formattedTime,
                                    is_late: existingAttendance.is_late,
                                });
                            } else {
                                setAlertSeverity('error');
                                setAlertMessage('Invalid attendance record');
                            }
                        } else {
                            setAlertSeverity('error');
                            setAlertMessage('No check-in record found for today. Please check-in first.');
                        }
                    }
    
                    setTimeout(() => {
                        setIsScanning(false);
                    }, 3000);
                } catch (error) {
                    console.error('Error handling QR scan:', error);
                    setAlertSeverity('error');
                    setAlertMessage('An error occurred while processing attendance');
                    setIsScanning(false);
                }
            } else {
                setAlertSeverity('error');
                setAlertMessage('QR Code not valid for this action');
                setIsScanning(false);
            }
        }
    };        

    const handleCreateOrUpdateAttendance = async () => {
        setIsScanning(false);
        if (shouldCreate && attendanceToUpdate) {
            try {
                await createAttendance(attendanceToUpdate);
                setAlertSeverity('success');
                setAlertMessage('Check-in record success!');
                handleCloseCamera();
            } catch (error) {
                console.error('Error creating attendance:', error);
                setAlertSeverity('error');
                setAlertMessage('Failed to create attendance record.');
            } finally {
                setShouldCreate(false);
            }
        } else if (shouldUpdate && attendanceToUpdate) {
            try {
                if (attendanceToUpdate && typeof attendanceToUpdate.id === 'number') {
                    await updateAttendance(attendanceToUpdate.id, attendanceToUpdate);
                    setAlertSeverity('success');
                    setAlertMessage('Check-Out record success!');
                    handleCloseCamera();
                } else {
                    console.error('Invalid attendance record or ID is undefined');
                    setAlertSeverity('error');
                    setAlertMessage('Invalid attendance record');
                    handleCloseCamera();
                }             
            } catch (error) {
                console.error('Error updating attendance:', error);
                setAlertSeverity('error');
                setAlertMessage('Failed to update attendance record.');
            } finally {
                setShouldUpdate(false);
            }
        }
    };

    useEffect(() => {
        if (shouldCreate || shouldUpdate) {
            handleCreateOrUpdateAttendance();
        }
    }, [shouldCreate, shouldUpdate]);

    const handleQrError = (error: any) => {
        console.error("QR Error:", error);
    };

    const handleCloseCamera = () => {
        window.location.reload();
    };

    return (
        <>  
            {alertMessage && (
                <Portal>
                    <Alert
                        variant="filled"
                        severity={alertSeverity}
                        onClose={() => setAlertMessage(null)}
                        sx={{
                            position: 'fixed',
                            top: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1600,
                            width: '25%',
                        }}
                    >
                        {alertMessage}
                    </Alert>
                </Portal>
            )}

            <Container>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '94vh',
                    position: 'relative'
                }}>
                    <Paper elevation={3} sx={{ padding: 4, maxWidth: 500, width: '100%', margin: 'auto', minHeight: 200, zIndex: 2 }}>
                        <Typography variant="h6" sx={{ 
                                                    textAlign: 'center', 
                                                    marginBottom: 2,
                                                    fontSize: '22px',
                                                 }}>
                            {currentTime}
                            <Divider sx={{ pt: '10px'}}></Divider>
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, marginBottom: 2 }}>
                            <Button
                                variant={action === 'checkin' ? 'contained' : 'outlined'}
                                onClick={() => setAction('checkin')}
                                sx={{ 
                                    flexGrow: 1, 
                                    backgroundColor: action === 'checkin' ? '#DB4437' : 'transparent', 
                                    color: action === 'checkin' ? 'white' : '#676767', 
                                    borderColor: action === 'checkin' ? '#DB4437' : '#c4c4c4',
                                    "&:hover": {
                                        borderColor: '#000000',
                                    }, 
                                }}
                            >
                                Check-In
                            </Button>
                            <Button
                                variant={action === 'checkout' ? 'contained' : 'outlined'}
                                onClick={() => setAction('checkout')}
                                sx={{ 
                                    flexGrow: 1, 
                                    backgroundColor: action === 'checkout' ? '#DB4437' : 'transparent', 
                                    color: action === 'checkout' ? 'white' : '#676767', 
                                    borderColor: action === 'checkout' ? '#DB4437' : '#c4c4c4',
                                    "&:hover": {
                                        borderColor: '#000000',
                                    }, 
                                }}
                            >
                                Check-Out
                            </Button>
                        </Box>
                        
                        <TextField
                            label="NIP"
                            variant="outlined"
                            fullWidth
                            value={nip}
                            onChange={handleNipChange}
                            sx={{ 
                                marginBottom: 2,
                                "& label.Mui-focused": {
                                    color: "#DB4437",
                                },
                                "& .MuiOutlinedInput-root": {
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#DB4437",
                                    }
                                }
                            }}
                        />

                        <Button
                            variant="contained"
                            sx={{ backgroundColor: '#DB4437', color: 'white' }}
                            fullWidth
                            onClick={handleSubmit}
                            disabled={!action || !nip}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} sx={{ color: 'white' }} />
                            ) : (
                                action === 'checkin' ? 'Check-In' : action === 'checkout' ? 'Check-Out' : 'Select Check-In / Check-Out'
                            )}
                        </Button>

                        {isCameraOpen && (
                            <Box 
                                sx={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    margin: 'auto',
                                    width: '800px',
                                    height: '100%',
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 3,
                                    p: 2,
                                }}
                            >
                                <Typography variant="h5" sx={{ color: '#DB4437', mb: 2 }}>
                                    Scan QR Code
                                </Typography>
                                <Box
                                    sx={{
                                        width: '100%',
                                        maxWidth: 600,
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        border: '5px solid #DB4437',
                                        boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
                                    }}
                                >
                                    <QrReader
                                        onResult={(result, error) => {
                                            if (result && !isScanning) {
                                                handleQrScan(result.getText());
                                            }
                                            if (error) handleQrError(error);
                                        }}
                                        constraints={{ facingMode: 'environment' }}
                                    />
                                </Box>
                                <Button
                                    variant="contained"
                                    onClick={handleCloseCamera}
                                    sx={{
                                        mt: 2,
                                        backgroundColor: '#DB4437',
                                        color: 'white',
                                        px: 4,
                                        '&:hover': {
                                            backgroundColor: '#a83232',
                                        },
                                    }}
                                >
                                    Close
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Container>
        </>
    );
};

export default HomePage;