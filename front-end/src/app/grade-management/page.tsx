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
import { getAllGrades } from '../services/gradeService';
import { Grade } from '../types/Grade';
import GradeModal from '../components/GradeModal';
import EditGradeModal from '../components/EditGradeModal';

const GradeManagement: React.FC = () => {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isGradeModalOpen, setGradeModalOpen] = useState(false);
    const [isEditGradeModalOpen, setEditGradeModalOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null); 
    
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
            const gradeData = await getAllGrades();
            setGrades(gradeData);
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

    const filteredGrades = grades.filter((grade) =>
        grade.grade_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenModal = () => {
        setGradeModalOpen(true);
    };

    const handleCloseModal = () => {
        setGradeModalOpen(false);
    };

    const handleOpenEditModal = (grade: Grade) => {
        setSelectedGrade(grade);
        setEditGradeModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditGradeModalOpen(false);
        setSelectedGrade(null); 
    };

    return (
        <Box sx={{ padding: '20px', maxWidth: '650px', margin: '0 auto', marginTop: '50px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <TextField
                    label="Search by Grade"
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
                    Register New Grade
                </Button>
            </Box>

            {!loading ? (
                <TableContainer component={Paper} >
                    <Table sx={{ width: '100%', tableLayout: 'auto', borderCollapse: 'collapse' }}>
                        <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                            <TableRow>
                                <TableCell align="center" sx={{ padding: '12px', width: '5%' }}><strong>No.</strong></TableCell>
                                <TableCell align="left" sx={{ padding: '12px', width: '60%' }}><strong>Grade Name</strong></TableCell>
                                <TableCell align="center" sx={{ padding: '12px', width: '20%' }}><strong>Action</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredGrades
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((grade, index) => (
                                    <TableRow key={grade.id} hover>
                                        <TableCell align="center" sx={{ padding: '12px' }}>
                                            {page * rowsPerPage + index + 1}
                                        </TableCell>
                                        <TableCell align="left" sx={{ padding: '12px' }}>{grade.grade_name}</TableCell>
                                        <TableCell align="center" sx={{ padding: '12px' }}>
                                            <IconButton 
                                                aria-label="edit-detail" 
                                                onClick={() => handleOpenEditModal(grade)}
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
                                            count={filteredGrades.length}
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

            <GradeModal 
                open={isGradeModalOpen} 
                onClose={handleCloseModal}
                onRegisterSuccess={handleRegisterSuccess}     
            />
            {selectedGrade && (
                <EditGradeModal 
                    open={isEditGradeModalOpen} 
                    onClose={handleCloseEditModal} 
                    grade={selectedGrade} 
                    onUpdateSuccess={handleUpdateSuccess}
                />
            )}
        </Box>
    );
};

export default GradeManagement;
