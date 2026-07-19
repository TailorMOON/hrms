"use client";

import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Button, 
    List, 
    ListItem, 
    ListItemText, 
    Divider, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    IconButton, 
    Alert, 
    Portal,
    Grid,
    Card,
} from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getAllReqAttendance, updateReqAttendanceStatus, getAttendanceByDate, updateAttendance, createAttendance, } from '../services/attendanceService';
import { Attendance, AttendanceRequest } from '../types/Attendance';
import { format } from 'date-fns'

const getDateWithSuffix = (date: Date) => {
    const day = date.getDate();
    const suffix = (day % 10 === 1 && day !== 11) ? "st" :
                   (day % 10 === 2 && day !== 12) ? "nd" :
                   (day % 10 === 3 && day !== 13) ? "rd" : "th";

    return format(date, `EEEE, MMMM d'${suffix}', yyyy`);
};

const AttendanceApproval: React.FC = () => {
    const [dataRequest, setDataRequest] = useState<AttendanceRequest[]>([]);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
    const alertTimeoutDuration = 3000;
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.max(1, Math.ceil(dataRequest.length / itemsPerPage));
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<AttendanceRequest | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const attendanceRequests = await getAllReqAttendance();
                setDataRequest(attendanceRequests.filter(req => req.status === 'Pending'));
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            }
        };
        fetchData();
    }, []);
    
    const handleApprove = async (id: number, employeeId: string, requestDate: string, checkInTime: string, checkOutTime: string) => {
        try {
            const attendanceData = await getAttendanceByDate(employeeId, requestDate, requestDate, 1, 0);
            console.log('Attendance data:', attendanceData);
    
            if (attendanceData && Array.isArray(attendanceData) && attendanceData.length > 0) {
                const existingAttendance = attendanceData[0];
                const { id: _, ...updatedAttendanceData } = {
                    ...existingAttendance,
                    check_in_time: checkInTime,
                    check_out_time: checkOutTime,
                    is_late: false,
                };
                console.log('Updated attendance data:', updatedAttendanceData);
    
                if (existingAttendance.id !== undefined) {
                    await updateAttendance(existingAttendance.id, updatedAttendanceData as Attendance);
                }
            } else {
                console.log('Attendance data is null, undefined, or empty. Creating new entry.');
                const newAttendanceData: Attendance = {
                    employee_id: employeeId,
                    date: requestDate,
                    check_in_time: checkInTime,
                    check_out_time: checkOutTime,
                    is_late: false,
                };
                console.log('New attendance data to be created:', newAttendanceData);
                await createAttendance(newAttendanceData);
                console.log('Attendance data created successfully.');
            }
    
            console.log("ID:", id);
            await updateReqAttendanceStatus(id, 'Approved');
            setDataRequest(dataRequest.filter(req => req.id !== id));
            setAlertSeverity('success');
            setAlertMessage('Request approved successfully.');
        } catch (error) {
            console.error('Error approving attendance request:', error);
            setAlertSeverity('error');
            setAlertMessage('Error approving request.');
        }
    };       

    const handleReject = async (id: number) => {
        if (!rejectReason.trim()) {
            setAlertSeverity('error');
            setAlertMessage('Reason cannot be empty.');
        } else {
            try {
                await updateReqAttendanceStatus(id, 'Rejected', rejectReason);
                setDataRequest(dataRequest.filter(req => req.id !== id));
                setAlertSeverity('success');
                setAlertMessage('Request rejected successfully.');
                handleCloseRejectModal();
            } catch (error) {
                console.error('Error rejecting attendance request:', error);
                setAlertSeverity('error');
                setAlertMessage('Error rejecting request.');
                handleCloseRejectModal();
            }
        }
    };

    const handleOpenRejectModal = (request: AttendanceRequest) => {
        setSelectedRequest(request);
        setOpenRejectModal(true);
    };

    const handleCloseRejectModal = () => {
        setOpenRejectModal(false);
        setRejectReason('');
    };

    const handleOpenDetailModal = (request: AttendanceRequest) => {
        setSelectedRequest(request);
        setOpenDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setOpenDetailModal(false);
        setSelectedRequest(null);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => setAlertMessage(null), alertTimeoutDuration);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    const paginatedData = dataRequest.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            {alertMessage && (
                <Portal>
                    <Alert
                        variant="filled"
                        severity={alertSeverity}
                        sx={{
                            position: 'fixed',
                            top: 20,
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

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '625px',
                    flexDirection: 'column',
                    marginTop: '20px'
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: '20px',
                        maxWidth: '600px',
                        width: '100%',
                        minHeight: '550px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#DB4437' }}>
                        Attendance Approval
                    </Typography>
                    <Divider sx={{ marginY: 1 }} />

                    <List sx={{ flexGrow: 1 }}>
                        {paginatedData.length === 0 ? (
                            <Typography
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    fontWeight: 'bold',
                                    color: '#f0f0f0',
                                    fontSize: '1.2rem'
                                }}
                            >
                                No pending requests
                            </Typography>
                        ) : (
                            paginatedData.map((request) => (
                                <React.Fragment key={request.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={`Employee ID: ${request.employee_id}`}
                                            secondary={`Date: ${request.request_date}`}
                                        />
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            sx={{ mr: 2 }}
                                            onClick={() => handleOpenDetailModal(request)}
                                        >
                                            Detail
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="success"
                                            sx={{ mr: 2 }}
                                            onClick={() => handleApprove(request.id, request.employee_id, request.request_date, request.check_in_time, request.check_out_time)}
                                        >
                                            Approve
                                        </Button>
                                        <Button variant="outlined" color="error" onClick={() => handleOpenRejectModal(request)}>
                                            Reject
                                        </Button>
                                    </ListItem>
                                </React.Fragment>
                            ))
                        )}
                    </List>

                    <Divider sx={{ marginY: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                        <IconButton
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            sx={{ color: currentPage === 1 ? 'grey.400' : 'black' }}
                        >
                            <KeyboardArrowLeftIcon />
                        </IconButton>
                        <Typography>{currentPage} / {Math.max(1, totalPages)}</Typography>
                        <IconButton
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            sx={{ color: currentPage === totalPages ? 'grey.400' : 'black' }}
                        >
                            <KeyboardArrowRightIcon />
                        </IconButton>
                    </Box>

                    {/* Detail Modal */}
                    {selectedRequest && (
                        <Dialog open={openDetailModal} onClose={handleCloseDetailModal} maxWidth="sm" fullWidth>
                            <DialogTitle
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: '1.25rem',
                                    color: '#DB4437',
                                    textAlign: 'center',
                                    backgroundColor: '#f0f0f0',
                                    paddingY: 2,
                                    borderBottom: '1px solid #e0e0e0'
                                }}
                            >
                                Attendance Request Details
                            </DialogTitle>
                            <DialogContent dividers sx={{ paddingX: 4, paddingY: 2 }}>
                                <Box sx={{ padding: 2, backgroundColor: '#fafafa', borderRadius: '8px', boxShadow: 1 }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={6}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                                                Employee ID
                                            </Typography>
                                            <Typography variant="body1" sx={{ wordWrap: 'break-word', color: '#333' }}>
                                                {selectedRequest.employee_id}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CalendarTodayIcon sx={{ marginRight: 1, color: '#666' }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                                                    Date
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: '#333' }}>
                                                     {getDateWithSuffix(new Date(selectedRequest.request_date))}
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        <Divider sx={{ width: '100%', marginY: 1 }} />

                                        <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AccessTimeIcon sx={{ marginRight: 1, color: '#666' }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                                                    Check-in Time
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: '#333' }}>
                                                    {selectedRequest.check_in_time || "N/A"}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AccessTimeIcon sx={{ marginRight: 1, color: '#666' }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                                                    Check-out Time
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: '#333' }}>
                                                    {selectedRequest.check_out_time || "N/A"}
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        <Divider sx={{ width: '100%', marginY: 1 }} />

                                        <Grid item xs={12}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                                                Reason
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: '#333' }}>
                                                {selectedRequest.reason || "No reason provided"}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </DialogContent>
                            <DialogActions sx={{ paddingX: 4, paddingY: 2 }}>
                                <Button
                                    onClick={handleCloseDetailModal}
                                    sx={{
                                        backgroundColor: '#DB4437',
                                        color: '#fff',
                                        borderRadius: '8px',
                                        padding: '10px 20px',
                                        fontWeight: 'bold',
                                        '&:hover': { backgroundColor: '#c63e30' },
                                    }}
                                    variant="contained"
                                >
                                    Close
                                </Button>
                            </DialogActions>
                        </Dialog>
                    )}

                    {/* Reject Modal */}
                    <Dialog open={openRejectModal} onClose={handleCloseRejectModal} maxWidth="sm" fullWidth>
                        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1rem', color: '#DB4437', textAlign: 'center' }}>
                            Reject Request
                        </DialogTitle>
                        <DialogContent>
                            <TextField
                                label="Reason for Rejection"
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={4}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                sx={{
                                    mt: '5px',
                                    borderRadius: '8px',
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
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={handleCloseRejectModal}
                                sx={{
                                    backgroundColor: '#DB4437',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    padding: '5px 10px',
                                    '&:hover': { backgroundColor: '#c63e30' },
                                }}
                                variant="contained"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleReject(selectedRequest!.id)}
                                sx={{
                                    backgroundColor: '#DB4437',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    padding: '5px 10px',
                                    '&:hover': { backgroundColor: '#c63e30' },
                                }}
                                variant="contained"
                            >
                                Submit
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Paper>
            </Box>
        </>
    );
};

export default AttendanceApproval;
