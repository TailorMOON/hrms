"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Typography, 
    Box, 
    Button, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    IconButton, 
    TablePagination, 
    TableFooter, 
    TextField, 
    Modal,
    Divider
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import { getAllEmployees } from '../services/employeeService';
import { getAllGrades } from '../services/gradeService';
import { getAllJobPositions } from '../services/jobPositionService';
import { getAllLocations } from '../services/locationService';
import { Employee } from '../types/Employee';
import { Grade } from '../types/Grade';
import { JobPosition } from '../types/JobPosition';
import { Location } from '../types/Location';
import RegisterModal from '../components/RegisterModal';

const EmployeeManagement: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    
    const router = useRouter();

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

    const fetchData = async () => {
        try {
            const employeeData = await getAllEmployees();
            const gradeData = await getAllGrades();
            const jobPositionData = await getAllJobPositions();
            const locationData = await getAllLocations();
            
            setEmployees(employeeData);
            setGrades(gradeData);
            setJobPositions(jobPositionData);
            setLocations(locationData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRegisterSuccess = () => {
        fetchData();
    };

    const getGradeName = (grade_id: number) => {
        const grade = grades.find(g => g.id === grade_id);
        return grade ? grade.grade_name : 'N/A';
    };

    const getJobPositionName = (job_position_id: number) => {
        const job = jobPositions.find(j => j.id === job_position_id);
        return job ? job.job_name : 'N/A';
    };

    const getLocationName = (location_id: number) => {
        const location = locations.find(l => l.id === location_id);
        return location ? location.location_name : 'N/A';
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredEmployees = employees.filter((employee) =>
        new RegExp(`^${searchQuery}`, 'i').test(employee.ptid)
    );    

    const handleOpenModal = () => {
        setRegisterModalOpen(true);
    };

    const handleCloseModal = () => {
        setRegisterModalOpen(false);
    };

    const handleViewAttendance = (ID: number) => {
        router.push(`/attendance-information?id=${ID}`);
        console.log(`View Attendance for Employee ID: ${ID}`);
    };

    const handleViewDetail = (PTID: string) => {
        const employee = employees.find(emp => emp.ptid === PTID);
        if (employee) {
            setSelectedEmployee(employee);
            setDetailModalOpen(true);
        }
    };

    const handleCloseDetailModal = () => {
        setDetailModalOpen(false);
        setSelectedEmployee(null);
    };

    const getOrdinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    const formatDateWithOrdinal = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
        const year = date.getFullYear();
        
        return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
    };

    return (
        <Box sx={{ maxWidth: '1000px', minHeight: '625px', margin: '0 auto', marginTop: '50px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <TextField
                    label="Search by NIP"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ 
                        width: '200px',
                        height: '30px',
                        "& label.Mui-focused": { color: "#DB4437" },
                        "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": { borderColor: "#DB4437" }
                        }
                    }}
                    size="small"
                />
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{ backgroundColor: '#DB4437', textTransform: 'none', padding: '6px 16px' }}
                    onClick={handleOpenModal}
                >
                    Register New Employee
                </Button>
            </Box>

            {!loading ? (
                <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <Table stickyHeader sx={{ width: '100%', tableLayout: 'auto', borderCollapse: 'collapse' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left" sx={{ padding: '12px', width: '10%', backgroundColor: '#f0f0f0' }}><strong>NIP</strong></TableCell>
                                <TableCell align="left" sx={{ padding: '12px', width: '20%', backgroundColor: '#f0f0f0' }}><strong>Name</strong></TableCell>
                                <TableCell align="left" sx={{ padding: '12px', width: '25%', backgroundColor: '#f0f0f0' }}><strong>Job Position</strong></TableCell>
                                <TableCell align="left" sx={{ padding: '12px', width: '17%', backgroundColor: '#f0f0f0' }}><strong>Grade</strong></TableCell>
                                <TableCell align="left" sx={{ padding: '12px', width: '17%', backgroundColor: '#f0f0f0' }}><strong>Location</strong></TableCell>
                                <TableCell align="center" sx={{ padding: '12px', width: '10%', backgroundColor: '#f0f0f0' }}><strong>Action</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((employee) => (
                                        <TableRow key={employee.id} hover>
                                            <TableCell align="left" sx={{ padding: '12px' }}>{employee.ptid}</TableCell>
                                            <TableCell align="left" sx={{ padding: '12px' }}>{employee.name}</TableCell>
                                            <TableCell align="left" sx={{ padding: '12px' }}>{getJobPositionName(employee.job_position_id)}</TableCell>
                                            <TableCell align="left" sx={{ padding: '12px' }}>{getGradeName(employee.grade_id)}</TableCell>
                                            <TableCell align="left" sx={{ padding: '12px' }}>{getLocationName(employee.location_id)}</TableCell>
                                            <TableCell align="center" sx={{ padding: '12px' }}>
                                                <Box 
                                                    sx={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'center', 
                                                        alignItems: 'center', 
                                                        gap: 1 
                                                    }}
                                                >
                                                    <IconButton 
                                                        aria-label="view-detail" 
                                                        onClick={() => handleViewDetail(employee.ptid)}
                                                        sx={{ color: '#DB4437' }}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                    <IconButton 
                                                        aria-label="view-attendance" 
                                                        onClick={() => handleViewAttendance(employee.id)}
                                                        sx={{ color: '#DB4437' }}
                                                    >
                                                        <InfoIcon />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ padding: '24px' }}>
                                        <Typography variant="body1">No matching records found</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter sx={{ backgroundColor: '#f0f0f0' }}>
                            <TableRow>
                                <TableCell colSpan={6} sx={{ padding: '4px' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <TablePagination
                                            rowsPerPageOptions={[10, 25, 50]}
                                            count={filteredEmployees.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            onPageChange={handleChangePage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            sx={{ padding: '4px' }}
                                        />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body1" align="center">
                    Loading...
                </Typography>
            )}

            <RegisterModal 
                open={isRegisterModalOpen} 
                onClose={handleCloseModal} 
                onRegisterSuccess={handleRegisterSuccess} 
            />

            <Modal
                open={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                aria-labelledby="modal-employee-detail-title"
                aria-describedby="modal-employee-detail-description"
                sx={{
                    '& .MuiBackdrop-root': {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }}
            >
                <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    width: 600,
                    maxHeight: '90vh', 
                    overflowY: 'auto',
                    bgcolor: '#ffffff',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}>
                    <Typography 
                        id="modal-employee-detail-title" 
                        variant="h4" 
                        component="h2" 
                        gutterBottom 
                        sx={{ 
                            color: '#DB4437', 
                            fontWeight: 'bold', 
                            textAlign: 'center', 
                            marginBottom: 3,
                            fontSize: '1.5rem' 
                        }}
                    >
                        Employee Details
                    </Typography>
                    <Divider sx={{ marginBottom: 3 }} />
                    
                    {selectedEmployee ? (
                        <Table sx={{ 
                            minWidth: 500,
                            '& .MuiTableCell-root': {
                                borderBottom: 'none'
                            }
                        }}>
                            <TableBody>
                                {[
                                    { label: 'PTID', value: selectedEmployee.ptid },
                                    { label: 'Name', value: selectedEmployee.name },
                                    { label: 'Username', value: selectedEmployee.username },
                                    { label: 'Phone', value: selectedEmployee.phone },
                                    { label: 'Email', value: selectedEmployee.email },
                                    { label: 'Birth Date', value: selectedEmployee.birth_date ? formatDateWithOrdinal(selectedEmployee.birth_date) : 'N/A' },
                                    { label: 'Marital Status', value: selectedEmployee.marital_status },
                                    { label: 'Address', value: selectedEmployee.address },
                                    { label: 'Join Date', value: selectedEmployee.join_date ? formatDateWithOrdinal(selectedEmployee.join_date) : 'N/A' },
                                    { label: 'Job Position', value: getJobPositionName(selectedEmployee.job_position_id) },
                                    { label: 'Grade', value: getGradeName(selectedEmployee.grade_id) },
                                    { label: 'Location', value: getLocationName(selectedEmployee.location_id) }
                                ].map((item, index) => (
                                    <TableRow 
                                        key={item.label}
                                        sx={{ 
                                            backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                                            '&:hover': {
                                                backgroundColor: '#e0e0e0',
                                            },
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>
                                            {item.label}
                                        </TableCell>
                                        <TableCell>{item.value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Typography>No employee selected.</Typography>
                    )}
                    
                    <Divider sx={{ marginTop: 3 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Button 
                            variant="contained" 
                            onClick={handleCloseDetailModal} 
                            sx={{ 
                                backgroundColor: '#DB4437',
                                color: '#fff',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                '&:hover': { 
                                    backgroundColor: '#c63e30'
                                }
                            }}
                        >
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default EmployeeManagement;
