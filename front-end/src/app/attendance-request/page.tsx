"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Box, 
    Typography, 
    Paper, 
    TextField, 
    Button, 
    Alert, 
    Portal, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    IconButton, 
    List, 
    ListItem, 
    ListItemText,
    Pagination
} from '@mui/material';
import { createReqAttendance, getReqAttendanceByNIP } from '../services/attendanceService';
import { getEmployeeById } from '../services/employeeService';
import { AttendanceRequest } from '../types/Attendance';
import HistoryIcon from '@mui/icons-material/History';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';

const ITEMS_PER_PAGE = 5;

const AttendanceRequestForm: React.FC = () => {
    const [employeeNIP, setEmployeeNIP] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        date: '',
        checkIn: '',
        checkOut: '',
        reason: ''
    });
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyData, setHistoryData] = useState<AttendanceRequest[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDetail, setSelectedDetail] = useState<AttendanceRequest | null>(null);

    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const isAdmin = localStorage.getItem('isAdmin');
            
            if (token && isAdmin !== 'true') {
                console.log("Access allowed for non-admin user with token.");
            } else {
                console.log("Unauthorized access, redirecting...");
                router.push('/unauthorized');
            }
        }
    }, [router]);

    useEffect(() => {
        const employeeId = localStorage.getItem('id');
        if (employeeId) {
            getEmployeeById(Number(employeeId))
                .then((employee) => {
                    setEmployeeNIP(employee.ptid);
                })
                .catch((error) => {
                    console.error('Error fetching employee data:', error);
                    setAlertMessage('Failed to fetch employee data');
                    setAlertSeverity('error');
                });
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeNIP) {
            setAlertMessage('NIP is not available');
            setAlertSeverity('error');
            return;
        }
    
        try {
            const existingRequests = await getReqAttendanceByNIP(employeeNIP);
            
            const isDuplicate = existingRequests?.some(request => 
                formData.date !== null && request.request_date === formData.date
            ) || false;            
    
            if (isDuplicate) {
                setAlertMessage('Request for this date already exists');
                setAlertSeverity('error');
                return;
            }
    
            const requestData: Omit<AttendanceRequest, 'id' | 'status' | 'rejection_reason' | 'created_at' | 'updated_at'> = {
                employee_id: employeeNIP,
                request_date: formData.date,
                check_in_time: formData.checkIn,
                check_out_time: formData.checkOut,
                reason: formData.reason,
            };
    
            await createReqAttendance(requestData);
            setAlertMessage('Attendance request submitted successfully');
            setAlertSeverity('success');
            setFormData({ date: '', checkIn: '', checkOut: '', reason: '' });
        } catch (error) {
            console.error('Error submitting attendance request:', error);
            setAlertMessage('Failed to submit attendance request');
            setAlertSeverity('error');
        }
    };    

    const fetchHistoryData = async () => {
        if (employeeNIP) {
            try {
                const data = await getReqAttendanceByNIP(employeeNIP);
                console.log("History data:", data);
                if (data && data.length > 0) {
                    setHistoryData(data.sort((a, b) => new Date(b.request_date).getTime() - new Date(a.request_date).getTime()));
                } else {
                    setHistoryData([]);
                }
            } catch (error) {
                console.error('Failed to fetch attendance history', error);
                setAlertMessage('Failed to fetch attendance history');
                setAlertSeverity('error');
            }
        }
    };    

    const handleHistoryOpen = () => {
        fetchHistoryData();
        setHistoryOpen(true);
    };

    const handleHistoryClose = () => {
        setHistoryOpen(false);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };

    const handleDetail = (item: AttendanceRequest) => {
        setSelectedDetail(item);
    };

    const handleCloseDetail = () => {
        setSelectedDetail(null);
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = historyData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => setAlertMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
            }}
        >
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
            <Paper
                elevation={3}
                sx={{
                    padding: '20px',
                    maxWidth: '500px',
                    width: '100%',
                    textAlign: 'center',
                }}
            >
                <Box 
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        position: 'relative',
                        marginBottom: '10px'
                    }}
                >
                    <IconButton
                        onClick={handleHistoryOpen}
                        sx={{
                            color: '#DB4437',
                            position: 'absolute',
                            left: 0,
                            paddingBottom: '15px'
                        }}
                    >
                        <HistoryIcon fontSize="large" />
                    </IconButton>
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            color: '#DB4437',
                        }}
                    >
                        Attendance Request
                    </Typography>
                </Box>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <TextField 
                        label="NIP" 
                        variant="outlined" 
                        fullWidth 
                        value={employeeNIP || ''} 
                        disabled 
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
                    <TextField 
                        label="Date" 
                        type="date" 
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }} 
                        fullWidth 
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
                    <TextField 
                        label="Check-in Time" 
                        type="time" 
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }} 
                        fullWidth 
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
                    <TextField 
                        label="Check-out Time" 
                        type="time" 
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }} 
                        fullWidth
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
                    <TextField 
                        label="Reason" 
                        variant="outlined" 
                        name="reason"
                        value={formData.reason}
                        onChange={handleInputChange}
                        fullWidth 
                        multiline 
                        rows={4} 
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
                    <Button 
                        variant="contained" 
                        type="submit"
                        sx={{
                            color:'#ffffff',
                            fontWeight:'bold',
                            backgroundColor:'#DB4437',
                            '&:hover': { backgroundColor: '#c63e30' }
                        }}
                    >
                        Submit Request
                    </Button>
                </Box>
            </Paper>

            <Dialog 
                open={historyOpen} 
                onClose={handleHistoryClose} 
                fullWidth 
                maxWidth="xs"
                sx={{
                    "& .MuiDialog-paper": {
                        marginLeft: '15px',
                        padding: '20px',
                        minHeight: '610px',
                    },
                }}
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography
                            gutterBottom
                            sx={{
                                fontWeight: 'bold',
                                color: '#DB4437',
                                fontSize: '18px',
                            }}
                        >
                            Request History
                        </Typography>
                        <IconButton
                            onClick={handleHistoryClose}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <List>
                        {historyData.length === 0 ? (
                            <Typography
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontWeight: 'bold',
                                    color: '#8e8e8e',
                                    padding: '20px'
                                }}
                            >
                                No history data available
                            </Typography>
                        ) : (
                            paginatedData.map((item) => (
                                <ListItem key={item.id} sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center', 
                                    padding: '10px 0', 
                                    backgroundColor: '#f9f9f9', 
                                    borderRadius: '8px', 
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                                    marginBottom: '20px',
                                    width: '100%',
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#6e6e6e', paddingLeft: '10px' }}>
                                        <CalendarTodayIcon sx={{ marginRight: '10px' }} />
                                        <Typography 
                                            variant="body2" 
                                            sx={{ fontSize: '18px', fontWeight: 'bold' }}
                                        >
                                            {item.request_date}
                                        </Typography>
                                    </Box>
                                    <Box 
                                        sx={{ 
                                            flexGrow: 1, 
                                            display: 'flex', 
                                            justifyContent: 'center',
                                            backgroundColor: item.status === 'Approved' 
                                                ? '#E6F4EA'
                                                : item.status === 'Rejected' 
                                                ? '#FDECEA'
                                                : '#F0F0F0',
                                            borderRadius: '4px', 
                                            padding: '4px 10px',
                                            maxWidth: '85px',
                                            marginLeft: '10px'
                                        }}
                                    >
                                        <Typography 
                                            variant="body2" 
                                            sx={{
                                                fontSize: '14px', 
                                                fontWeight: 'bold',
                                                color: item.status === 'Approved' 
                                                    ? '#4CAF50' 
                                                    : item.status === 'Rejected' 
                                                    ? '#DB4437' 
                                                    : '#6e6e6e'
                                            }}
                                        >
                                            {item.status}
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleDetail(item)}
                                        sx={{
                                            fontSize: '0.875rem',
                                            marginLeft: '10px',
                                            textTransform: 'none',
                                            color: '#DB4437',
                                            borderColor: '#DB4437',
                                            '&:hover': {
                                                backgroundColor: '#f9e2e1',
                                                borderColor: '#DB4437'
                                            }
                                        }}
                                    >
                                        Detail
                                    </Button>
                                </ListItem>                                
                            ))
                        )}
                    </List>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center' }}>
                    <Pagination
                        count={Math.ceil(historyData.length / ITEMS_PER_PAGE)}
                        page={currentPage}
                        onChange={handlePageChange}
                        boundaryCount={0}
                        siblingCount={0}
                        sx={{
                            mt: 2,
                            '& .MuiPaginationItem-root': {
                                color: '#DB4437',
                            },
                            '& .MuiPaginationItem-root.Mui-selected': {
                                backgroundColor: '#DB4437',
                                color: '#ffffff',
                                borderRadius: '50%',
                            },
                        }}
                    />
                </DialogActions>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog 
                open={!!selectedDetail} 
                onClose={handleCloseDetail} 
                maxWidth="sm" 
                fullWidth
                sx={{
                    "& .MuiDialog-paper": {
                        padding: '24px', 
                        borderRadius: '12px',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
                        maxWidth: '400px',
                        minHeight: '600px',
                        marginRight: '45px'
                    },
                }}
                >
                <DialogTitle>
                    <Typography sx={{ fontWeight: '600', color: '#DB4437', fontSize: '22px', letterSpacing: '0.6px', textAlign: 'center' }}>
                        Detail Information
                    </Typography>
                </DialogTitle>
                <DialogContent dividers sx={{ padding: '16px 24px' }}>
                    {selectedDetail && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Request Date */}
                            <Box display="flex" flexDirection="column" gap="4px">
                                <Typography sx={{ fontSize: '13px', color: '#8a8a8a', textTransform: 'uppercase' }}>Request Date</Typography>
                                <Typography sx={{ fontSize: '17px', fontWeight: '500', color: '#333' }}>
                                    {selectedDetail.request_date}
                                </Typography>
                            </Box>

                            {/* Check-in and Check-out Times */}
                            <Box display="flex" flexDirection="column" gap="4px">
                                <Typography sx={{ fontSize: '13px', color: '#8a8a8a', textTransform: 'uppercase' }}>Check-in Time</Typography>
                                <Typography sx={{ fontSize: '17px', fontWeight: '500', color: '#333' }}>
                                    {selectedDetail.check_in_time}
                                </Typography>
                            </Box>
                            <Box display="flex" flexDirection="column" gap="4px">
                                <Typography sx={{ fontSize: '13px', color: '#8a8a8a', textTransform: 'uppercase' }}>Check-out Time</Typography>
                                <Typography sx={{ fontSize: '17px', fontWeight: '500', color: '#333' }}>
                                    {selectedDetail.check_out_time}
                                </Typography>
                            </Box>

                            {/* Status with Styled Box */}
                            <Box 
                                display="flex" 
                                alignItems="center"
                                gap="12px"
                            >
                                <Typography sx={{ fontSize: '13px', color: '#8a8a8a', textTransform: 'uppercase' }}>Status</Typography>
                                <Box 
                                    sx={{
                                        backgroundColor: selectedDetail.status === 'Approved'
                                            ? '#E6F4EA'
                                            : selectedDetail.status === 'Rejected'
                                            ? '#FDECEA'
                                            : '#F0F0F0',
                                        color: selectedDetail.status === 'Approved'
                                            ? '#4CAF50'
                                            : selectedDetail.status === 'Rejected'
                                            ? '#DB4437'
                                            : '#6e6e6e',
                                        fontWeight: '600',
                                        fontSize: '15px',
                                        borderRadius: '12px',
                                        padding: '6px 6px',
                                        width: selectedDetail.status === 'Pending' ? '75px' : '85px',
                                        textAlign: 'center',
                                    }}
                                >
                                    {selectedDetail.status}
                                </Box>
                            </Box>

                            {/* Reason */}
                            <Box display="flex" flexDirection="column" gap="4px">
                                <Typography sx={{ fontSize: '13px', color: '#8a8a8a', textTransform: 'uppercase' }}>Reason</Typography>
                                <Typography sx={{ fontSize: '16px', fontWeight: '400', color: '#555' }}>
                                    {selectedDetail.reason}
                                </Typography>
                            </Box>

                            {/* Rejection Reason (if available) */}
                            {selectedDetail.rejection_reason && (
                                <Box display="flex" flexDirection="column" gap="4px">
                                    <Typography sx={{ fontSize: '13px', color: '#8a8a8a', textTransform: 'uppercase' }}>Rejection Reason</Typography>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '400', color: '#555' }}>
                                        {selectedDetail.rejection_reason}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', padding: '16px' }}>
                    <Button
                        onClick={handleCloseDetail}
                        variant="contained"
                        sx={{
                            backgroundColor: '#DB4437',
                            color: '#ffffff',
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AttendanceRequestForm;
