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
    TextField 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { getAllJobPositions } from '../services/jobPositionService';
import { JobPosition } from '../types/JobPosition';
import JobModal from '../components/JobModal';
import EditJobModal from '../components/EditJobModal';

const JobManagement: React.FC = () => {
    const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isJobModalOpen, setJobModalOpen] = useState(false);
    const [isEditJobModalOpen, setEditJobModalOpen] = useState(false);
    const [selectedJobPosition, setSelectedJobPosition] = useState<JobPosition | null>(null);

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
            const jobPositionData = await getAllJobPositions();
            setJobPositions(jobPositionData);
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

    const handleUpdateSuccess = () => {
        fetchData();
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredJobPositions = jobPositions.filter((jobPosition) =>
        jobPosition.job_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenModal = () => {
        setJobModalOpen(true);
    };

    const handleCloseModal = () => {
        setJobModalOpen(false);
    };

    const handleOpenEditModal = (jobPosition: JobPosition) => {
        setSelectedJobPosition(jobPosition);
        setEditJobModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditJobModalOpen(false);
        setSelectedJobPosition(null);
    };

    return (
        <Box sx={{ padding: '20px', maxWidth: '650px', margin: '0 auto', marginTop: '50px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <TextField
                    label="Search by Job Position"
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
                    Register New Job Position
                </Button>
            </Box>

            {!loading ? (
                <TableContainer component={Paper}>
                    <Table sx={{ width: '100%', tableLayout: 'auto', borderCollapse: 'collapse' }}>
                        <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                            <TableRow>
                                <TableCell align="center" sx={{ padding: '12px', width: '5%' }}><strong>No.</strong></TableCell>
                                <TableCell align="left" sx={{ padding: '12px', width: '60%' }}><strong>Job Name</strong></TableCell>
                                <TableCell align="center" sx={{ padding: '12px', width: '20%' }}><strong>Action</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredJobPositions
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((jobPosition, index) => (
                                    <TableRow key={jobPosition.id} hover>
                                        <TableCell align="center" sx={{ padding: '12px' }}>
                                            {page * rowsPerPage + index + 1}
                                        </TableCell>
                                        <TableCell align="left" sx={{ padding: '12px' }}>{jobPosition.job_name}</TableCell>
                                        <TableCell align="center" sx={{ padding: '12px' }}>
                                            <IconButton 
                                                aria-label="edit-detail" 
                                                onClick={() => handleOpenEditModal(jobPosition)}
                                                sx={{ color: '#DB4437' }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                        <TableFooter sx={{ backgroundColor: '#f0f0f0' }}>
                            <TableRow>
                                <TableCell colSpan={3} sx={{ padding: '4px' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <TablePagination
                                            rowsPerPageOptions={[10, 25, 50]}
                                            count={filteredJobPositions.length}
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

            <JobModal 
                open={isJobModalOpen} 
                onClose={handleCloseModal} 
                onRegisterSuccess={handleRegisterSuccess}
            />
            {selectedJobPosition && (
                <EditJobModal 
                    open={isEditJobModalOpen} 
                    onClose={handleCloseEditModal} 
                    jobPosition={selectedJobPosition}
                    onUpdateSuccess={handleUpdateSuccess} 
                />
            )}
        </Box>
    );
};

export default JobManagement;
