"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    Grid,
    Card,
    IconButton,
    Alert,
    Portal,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { getAllReqUpdateEmployee, getEmployeeByNIP, updateReqUpdateEmployeeStatus, updateEmployee } from '../services/employeeService';
import { EmployeeRequest, Employee } from '../types/Employee';
import { getGradeById } from '../services/gradeService';
import { getLocationById } from '../services/locationService';
import { getJobPositionById } from '../services/jobPositionService';

const DataChangeApproval: React.FC = () => {
    const [dataRequest, setDataRequest] = useState<EmployeeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDetail, setOpenDetail] = useState(false);
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<EmployeeRequest | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [gradeName, setGradeName] = useState<{ old: string | null; new: string | null }>({ old: null, new: null });
    const [locationName, setLocationName] = useState<{ old: string | null; new: string | null }>({ old: null, new: null });
    const [jobPositionName, setJobPositionName] = useState<{ old: string | null; new: string | null }>({ old: null, new: null });
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
    const alertTimeoutDuration = 3000;
    
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.max(1, Math.ceil(dataRequest.length / itemsPerPage));

    const filterPendingRequests = (requests: EmployeeRequest[]) => {
        return requests.filter((request) => request.status === 'Pending');
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const isAdmin = localStorage.getItem('isAdmin');
            
            if (!token || isAdmin !== 'true') {
                console.log("Unauthorized access, isAdmin:", isAdmin);
                router.push('/unauthorized');
            }
        }
    }, [router]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dataRequest = await getAllReqUpdateEmployee();
                console.log("All Requests:", dataRequest);
                const pendingRequests = filterPendingRequests(dataRequest); 
                setDataRequest(pendingRequests);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => setAlertMessage(null), alertTimeoutDuration);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    const handleApprove = async (ptid: string) => {
        try {
            const employee: Employee | null = await getEmployeeByNIP(ptid);
            if (employee) {
                const employeeId = employee.id; 
        
                const requestData = dataRequest.find(req => req.ptid === ptid);
                if (!requestData) {
                    console.error("No request data found for this PTID:", ptid);
                    return;
                }
        
                const updatedEmployeeData: Employee = {
                    id: employeeId,
                    ptid: requestData.ptid,
                    username: requestData.username,
                    password: '',
                    birth_date: requestData.birth_date,
                    address: requestData.address,
                    location_id: requestData.location_id,
                    join_date: employee.join_date,
                    phone: requestData.phone,
                    marital_status: requestData.marital_status,
                    is_admin: employee.is_admin, 
                    grade_id: requestData.grade_id,
                    name: requestData.name,
                    job_position_id: requestData.job_position_id,
                    email: requestData.email
                };
        
                await updateReqUpdateEmployeeStatus(ptid, 'Approved');
                
                await updateEmployee(employeeId, updatedEmployeeData);
        
                const updatedDataRequest = await getAllReqUpdateEmployee();
                setDataRequest(filterPendingRequests(updatedDataRequest));
                setAlertSeverity('success');
                setAlertMessage('Request approved successfully.');
            } else {
                console.error('Employee not found with NIP:', ptid);
                setAlertSeverity('error');
                setAlertMessage('Employee not found.');
            }
        } catch (error) {
            console.error('Error approving request:', error);
            setAlertSeverity('error');
            setAlertMessage('Error approving request.');
        }
    };    

    const handleReject = async (ptid: string, rejectReason: string) => {
        if (!rejectReason.trim()) {
            setAlertSeverity('error');
            setAlertMessage('Reason cannot be empty.');
        } else {
            try {
                await updateReqUpdateEmployeeStatus(ptid, 'Rejected', rejectReason);
        
                const updatedDataRequest = await getAllReqUpdateEmployee();
                setDataRequest(filterPendingRequests(updatedDataRequest));
                setAlertSeverity('success');
                setAlertMessage('Request rejected successfully.');
                handleCloseRejectModal();
            } catch (error) {
                console.error('Error rejecting request:', error);
                setAlertSeverity('error');
                setAlertMessage('Error rejecting request.');
                handleCloseRejectModal();
            }
        }
    };    

    const handleOpenDetail = async (request: EmployeeRequest) => {
        try {
            const oldGradeData = await getGradeById(request.old_grade_id);
            const newGradeData = await getGradeById(request.grade_id);
            const oldLocationData = await getLocationById(request.old_location_id);
            const newLocationData = await getLocationById(request.location_id);
            const oldJobPositionData = await getJobPositionById(request.old_job_position_id);
            const newJobPositionData = await getJobPositionById(request.job_position_id);

            setGradeName({ old: oldGradeData?.grade_name || "Unknown Grade", new: newGradeData?.grade_name || "Unknown Grade" });
            setLocationName({ old: oldLocationData?.location_name || "Unknown Location", new: newLocationData?.location_name || "Unknown Location" });
            setJobPositionName({ old: oldJobPositionData?.job_name || "Unknown Job Position", new: newJobPositionData?.job_name || "Unknown Job Position" });
            
            setSelectedRequest(request);
            setOpenDetail(true);
        } catch (error) {
            console.error('Error fetching detail data:', error);
        }
    };

    const handleCloseDetail = () => {
        setOpenDetail(false);
        setSelectedRequest(null);
    };

    const handleOpenRejectModal = (request: EmployeeRequest) => {
        setSelectedRequest(request);
        setOpenRejectModal(true);
    };

    const handleCloseRejectModal = () => {
        setOpenRejectModal(false);
        setRejectReason('');
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };  

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
                    <Typography variant="h5" gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            color: '#DB4437',
                        }}
                    >
                        Data Change Approval
                    </Typography >
                    <Divider sx={{ marginY: 1 }} />
                    
                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : (
                        <>
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
                                        No pending requests</Typography>
                                ) : (
                                    paginatedData.map((request) => (
                                        <React.Fragment key={request.ptid}>
                                            <ListItem>
                                                <ListItemText
                                                    primary={`Employee ID: ${request.ptid}`}
                                                    secondary={`Name: ${request.old_name}`}
                                                />
                                                <Button 
                                                    variant="outlined" 
                                                    color="primary" 
                                                    sx={{ mr: 2 }} 
                                                    onClick={() => handleOpenDetail(request)}
                                                >
                                                    Detail
                                                </Button>
                                                <Button 
                                                    variant="outlined" 
                                                    color="success" 
                                                    sx={{ mr: 2 }} 
                                                    onClick={() => handleApprove(request.ptid)}
                                                >
                                                    Approve
                                                </Button>
                                                <Button 
                                                    variant="outlined" 
                                                    color="error" 
                                                    onClick={() => handleOpenRejectModal(request)}
                                                >
                                                    Reject
                                                </Button>
                                            </ListItem>
                                        </React.Fragment>
                                    ))
                                )}
                            </List>

                            {/* Pagination Controls at the Bottom */}
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
                        </>
                    )}

                    {/* Detail Modal */}
                    {selectedRequest && (
                        <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
                            <DialogTitle 
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: '1 rem',
                                    color: '#DB4437',
                                    textAlign: 'center',
                                }}
                            >
                                Detail Changes
                            </DialogTitle>
                            <DialogContent dividers>
                                <Box sx={{ mb: 2 }}>
                                    {selectedRequest.old_name !== selectedRequest.name && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: '#DB4437',
                                                }}
                                            >
                                                Name
                                            </Typography>
                                            <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{selectedRequest.old_name}</Typography>
                                                    </Grid>
                                                    <Grid item xs={2} sx={{ textAlign: 'center' }}>
                                                        <ArrowForwardIcon sx={{ color: '#DB4437' }} />
                                                    </Grid>
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{selectedRequest.name}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        </Box>
                                    )}
                                    {selectedRequest.old_username !== selectedRequest.username && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: '#DB4437',
                                                }}
                                            >
                                                Username
                                            </Typography>
                                            <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{selectedRequest.old_username}</Typography>
                                                    </Grid>
                                                    <Grid item xs={2} sx={{ textAlign: 'center' }}>
                                                        <ArrowForwardIcon sx={{ color: '#DB4437' }} />
                                                    </Grid>
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{selectedRequest.username}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        </Box>
                                    )}
                                    {selectedRequest.old_birth_date !== selectedRequest.birth_date && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: '#DB4437',
                                                }}
                                            >
                                                Birth Date
                                            </Typography>
                                            <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1">{selectedRequest.old_birth_date}</Typography>
                                                    </Grid>
                                                    <Grid item xs={2} sx={{ textAlign: 'center' }}>
                                                        <ArrowForwardIcon sx={{ color: '#DB4437' }} />
                                                    </Grid>
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1">{selectedRequest.birth_date}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        </Box>
                                    )}
                                {selectedRequest.old_address !== selectedRequest.address && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: '#DB4437',
                                                }}
                                            >
                                                Address
                                            </Typography>
                                            <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{selectedRequest.old_address}</Typography>
                                                    </Grid>
                                                    <Grid item xs={2} sx={{ textAlign: 'center' }}>
                                                        <ArrowForwardIcon sx={{ color: '#DB4437' }} />
                                                    </Grid>
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{selectedRequest.address}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        </Box>
                                    )}
                                    {selectedRequest.old_phone !== selectedRequest.phone && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: '#DB4437',
                                                }}
                                            >
                                                Phone
                                            </Typography>
                                            <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{selectedRequest.old_phone}</Typography>
                                                    </Grid>
                                                    <Grid item xs={2} sx={{ textAlign: 'center' }}>
                                                        <ArrowForwardIcon sx={{ color: '#DB4437' }} />
                                                    </Grid>
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{selectedRequest.phone}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        </Box>
                                    )}
                                    {selectedRequest.old_grade_id !== selectedRequest.grade_id && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: '#DB4437',
                                                }}
                                            >
                                                Grade
                                            </Typography>
                                            <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{gradeName?.old || "Unknown Grade"}</Typography>
                                                    </Grid>
                                                    <Grid item xs={2} sx={{ textAlign: 'center' }}>
                                                        <ArrowForwardIcon sx={{ color: '#DB4437' }} />
                                                    </Grid>
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{gradeName?.new || "Unknown Grade"}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        </Box>
                                    )}
                                    {selectedRequest.old_job_position_id !== selectedRequest.job_position_id && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: '#DB4437',
                                                }}
                                            >
                                                Job Position
                                            </Typography>
                                            <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{jobPositionName?.old || "Unknown Job Position"}</Typography>
                                                    </Grid>
                                                    <Grid item xs={2} sx={{ textAlign: 'center' }}>
                                                        <ArrowForwardIcon sx={{ color: '#DB4437' }} />
                                                    </Grid>
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{jobPositionName?.new || "Unknown Job Position"}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        </Box>
                                    )}
                                    {selectedRequest.old_location_id !== selectedRequest.location_id && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: '#DB4437',
                                                }}
                                            >
                                                Location
                                            </Typography>
                                            <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{locationName?.old || "Unknown Location"}</Typography>
                                                    </Grid>
                                                    <Grid item xs={2} sx={{ textAlign: 'center' }}>
                                                        <ArrowForwardIcon sx={{ color: '#DB4437' }} />
                                                    </Grid>
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{locationName?.new || "Unknown Location"}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        </Box>
                                    )}
                                    {selectedRequest.old_email !== selectedRequest.email && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: '#DB4437',
                                                }}
                                            >
                                                Email
                                            </Typography>
                                            <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{selectedRequest.old_email}</Typography>
                                                    </Grid>
                                                    <Grid item xs={2} sx={{ textAlign: 'center' }}>
                                                        <ArrowForwardIcon sx={{ color: '#DB4437' }} />
                                                    </Grid>
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>{selectedRequest.email}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        </Box>
                                    )}
                                    {selectedRequest.old_marital_status !== selectedRequest.marital_status && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: '#DB4437',
                                                }}
                                            >
                                                Marital Status
                                            </Typography>
                                            <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1">{selectedRequest.old_marital_status}</Typography>
                                                    </Grid>
                                                    <Grid item xs={2} sx={{ textAlign: 'center' }}>
                                                        <ArrowForwardIcon sx={{ color: '#DB4437' }} />
                                                    </Grid>
                                                    <Grid item xs={5} sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body1">{selectedRequest.marital_status}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        </Box>
                                    )}
                                </Box>
                            </DialogContent>
                            <DialogActions>
                                <Button 
                                    onClick={handleCloseDetail} 
                                    sx={{ 
                                        backgroundColor: '#DB4437', 
                                        color: '#fff', 
                                        borderRadius: '8px', 
                                        padding: '10px 20px', 
                                        '&:hover': {
                                            backgroundColor: '#c63e30',
                                        },
                                    }} 
                                    variant="contained"
                                >
                                    Close
                                </Button>
                            </DialogActions>
                        </Dialog>
                    )}

                    {/* Reject Modal */}
                    {selectedRequest && (
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
                                    sx={{ backgroundColor: '#DB4437', color: '#fff', borderRadius: '8px', padding: '5px 10px', '&:hover': { backgroundColor: '#c63e30', }, }} 
                                    variant="contained"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={() => {
                                        handleReject(selectedRequest.ptid, rejectReason);
                                    }}
                                    sx={{ backgroundColor: '#DB4437', color: '#fff', borderRadius: '8px', padding: '5px 10px', '&:hover': { backgroundColor: '#c63e30', }, }} 
                                    variant="contained"
                                >
                                    Submit
                                </Button>
                            </DialogActions>
                        </Dialog>
                    )}
                </Paper>
            </Box>
        </>
    );
};

export default DataChangeApproval;
