import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Table, 
    TableBody, 
    TableCell, 
    TableRow, 
    IconButton, 
    Typography, 
    TextField,
    Select,
    MenuItem,
    Divider,
    Alert,
    Portal,
    Grid, 
    Box, 
    Card, 
    CardContent
} from '@mui/material';
import { format } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { getEmployeeById, updateEmployee, getReqUpdateEmployeeByNIP, deleteReqUpdateEmployee} from '../services/employeeService';
import { getAllGrades } from '../services/gradeService';
import { getAllJobPositions } from '../services/jobPositionService';
import { getAllLocations } from '../services/locationService';
import { createReqUpdateEmployee } from '../services/employeeService';
import { Grade } from '../types/Grade';
import { Location } from '../types/Location';
import { JobPosition } from '../types/JobPosition';
import { Employee, RequestSummary } from '../types/Employee';
import { EmployeeRequest } from '../types/Employee';

interface PersonalInfoModalProps {
  open: boolean;
  handleClose: () => void;
}

interface EditableFields {
  [key: string]: boolean;
}

const addHoursToDate = (dateString: string, hours: number) => {
  const date = new Date(dateString);
  date.setHours(date.getHours() + hours);
  return date.toLocaleString();
};

const PersonalInfoModal: React.FC<PersonalInfoModalProps> = ({ open, handleClose }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [editableFields, setEditableFields] = useState<EditableFields>({
    name: false,
    username: false,
    password: false,
    birth_date: false,
    email: false,
    phone: false,
    marital_status: false,
    address: false
  });
  const [changes, setChanges] = useState<Partial<EmployeeRequest>>({});
  const [isChangesModalOpen, setChangesModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [lastRequest, setLastRequest] = useState<RequestSummary | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const alertTimeoutDuration = 3000;

  const handleOpenHistoryModal = () => {
    if (employee) {
      getReqUpdateEmployeeByNIP(employee.ptid)
        .then((data) => {
          if (data) {
            setLastRequest({ status: data.status, created_at: data.created_at });
          } else {
            setLastRequest(null);
          }
          setHistoryModalOpen(true);
        })
        .catch((error) => {
          console.error('Failed to fetch request history:', error);
          setLastRequest(null);
          setHistoryModalOpen(true);
        });
    }
  };

  const handleCloseHistoryModal = () => {
    setHistoryModalOpen(false);
  };

  useEffect(() => {
    if (open) {
      const employeeId = localStorage.getItem('id');
      if (employeeId) {
        getEmployeeById(Number(employeeId))
          .then((data) => {
            setEmployee(data);
          })
          .catch((error) => {
            console.error('Failed to fetch employee data', error);
          });

        getAllLocations()
        .then((locations) => {
          const activeLocations = locations.filter((location) => location.status === "Active");
          setLocations(activeLocations);
        })
        .catch((err) => {
          console.error("Failed to fetch locations:", err);
        });
        getAllGrades().then(setGrades).catch((err) => console.error('Failed to fetch grades', err));
        getAllJobPositions().then(setJobPositions).catch((err) => console.error('Failed to fetch job positions', err));
      }
    }
  }, [open]);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), alertTimeoutDuration);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const handleEditToggle = (field: string) => {
    setEditableFields((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChange = (field: keyof Employee, value: string | number) => {
    if (employee) {
      setChanges((prev) => ({
        ...prev,
        [`old_${field}`]: prev[`old_${field}` as keyof EmployeeRequest] || employee[field],
        [field]: value,
      }));
  
      setEmployee((prev) => (prev ? { ...prev, [field]: value } : prev));
    }
  };  

  const handleViewChanges = () => {
    setChangesModalOpen(true);
  };

  const closeChangesModal = () => {
    setChangesModalOpen(false);
  };

  const requestChangesModal = async () => {
    if (employee) {
      const now = new Date();

      const formattedDate = format(now, "yyyy-MM-dd'T'HH:mm:ss");

      const requestData: Partial<EmployeeRequest> = {
        ptid: employee.ptid,
        username: changes.username || employee.username,
        old_username: changes.old_username || employee.username,

        birth_date: changes.birth_date || employee.birth_date,
        old_birth_date: changes.old_birth_date || employee.birth_date,

        address: changes.address || employee.address,
        old_address: changes.old_address || employee.address,

        location_id: changes.location_id || employee.location_id,
        old_location_id: changes.old_location_id || employee.location_id,

        phone: changes.phone || employee.phone,
        old_phone: changes.old_phone || employee.phone,

        marital_status: changes.marital_status || employee.marital_status,
        old_marital_status: changes.old_marital_status || employee.marital_status,

        grade_id: changes.grade_id || employee.grade_id,
        old_grade_id: changes.old_grade_id || employee.grade_id,

        name: changes.name || employee.name,
        old_name: changes.old_name || employee.name,

        job_position_id: changes.job_position_id || employee.job_position_id,
        old_job_position_id: changes.old_job_position_id || employee.job_position_id,

        email: changes.email || employee.email,
        old_email: changes.old_email || employee.email,

        status: 'Pending',

        created_at: formattedDate,
        updated_at: formattedDate,
      };

      try {
        await deleteReqUpdateEmployee(employee.ptid);
        await createReqUpdateEmployee(requestData);
        closeChangesModal();
        handleClose();
        setAlertSeverity('success');
        setAlertMessage('Request sent successfully.');
      } catch (error) {
        console.error("Failed to create update request:", error);
        setAlertSeverity('error');
        setAlertMessage('Failed to send request.');
      }
    }

    reset();
  };

  const reset = () => {
    resetChanges();
    setEditableFields({
      name: false,
      username: false,
      password: false,
      birth_date: false,
      email: false,
      phone: false,
      marital_status: false,
      address: false
    });
  };

  const resetChanges = () => {
    setChanges({});
  };

  const getLocationName = (locationId: number) => {
    const location = locations.find((l) => l.id === locationId);
    return location ? location.location_name : 'Unknown Location';
  };

  const getGradeName = (gradeId: number) => {
    const grade = grades.find((g) => g.id === gradeId);
    return grade ? grade.grade_name : 'Unknown Grade';
  };

  const getJobPositionName = (jobPositionId: number) => {
    const jobPosition = jobPositions.find((jp) => jp.id === jobPositionId);
    return jobPosition ? jobPosition.job_name : 'Unknown Job Position';
  };
  
  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      setAlertSeverity('error');
      setAlertMessage('Password must be at least 8 characters long');
      return;
    }
  
    const hasNumber = /\d/.test(newPassword);
    if (!hasNumber) {
      setAlertSeverity('error');
      setAlertMessage('Password must contain at least one number');
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setAlertSeverity('error');
      setAlertMessage('New Password and Confirm Password do not match');
      return;
    }
  
    if (employee) {
      try {
        await updateEmployee(employee.id, { ...employee, password: newPassword });
        setPasswordModalOpen(false);
        resetPasswordFields();
        setAlertSeverity('success');
        setAlertMessage('Password updated successfully.');
      } catch (error) {
        console.error("Failed to update password:", error);
        setAlertSeverity('error');
        setAlertMessage('Failed to update password.');
      }
    }
  };  

  const resetPasswordFields = () => {
    setNewPassword('');
    setConfirmPassword('');
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

      <Dialog 
        open={open} 
        onClose={() => {
          reset();
          handleClose();
        }} 
        maxWidth="sm" 
        fullWidth 
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 5px 30px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            color: '#DB4437',
            fontWeight: 'bold',
            fontSize: '1.5rem',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
              aria-label="history" 
              onClick={handleOpenHistoryModal} 
              sx={{ marginLeft: '10px' }}
            >
              <HistoryIcon sx={{ color: '#DB4437' }} />
            </IconButton>
            Personal Information
          </span>
          <IconButton onClick={() => {
            reset();
            handleClose();
          }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Table>
            <TableBody>
              {/* PTID (Uneditable) */}
              <TableRow>
                <TableCell sx={{ pb:'30px' }}><Typography variant="body1" fontWeight="bold">NIP</Typography></TableCell>
                <TableCell sx={{ pb:'30px' }}>{employee?.ptid}</TableCell>
              </TableRow>

              {/* Name */}
              <TableRow>
                <TableCell><Typography variant="body1" fontWeight="bold">Name</Typography></TableCell>
                <TableCell>
                  <TextField
                    value={employee?.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    fullWidth
                    disabled={!editableFields.name}
                    error={!employee?.name}
                    helperText={!employee?.name && 'Name cannot be empty'}
                    InputProps={{
                      sx: {
                        '&:focus-within .MuiOutlinedInput-notchedOutline': {
                          borderColor: editableFields.name ? '#DB4437' : undefined,
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit name" onClick={() => handleEditToggle('name')}>
                    <EditIcon sx={{ color: '#DB4437' }} />
                  </IconButton>
                </TableCell>
              </TableRow>

              {/* Username */}
              <TableRow>
                <TableCell><Typography variant="body1" fontWeight="bold">Username</Typography></TableCell>
                <TableCell>
                  <TextField
                    value={employee?.username || ''}
                    onChange={(e) => handleChange('username', e.target.value)}
                    fullWidth
                    disabled={!editableFields.username}
                    error={!employee?.username}
                    helperText={!employee?.username && 'Username cannot be empty'}
                    InputProps={{
                      sx: {
                        '&:focus-within .MuiOutlinedInput-notchedOutline': {
                          borderColor: editableFields.username ? '#DB4437' : undefined,
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit username" onClick={() => handleEditToggle('username')}>
                    <EditIcon sx={{ color: '#DB4437' }} />
                  </IconButton>
                </TableCell>
              </TableRow>

              {/* Password */}
              <TableRow>
                <TableCell><Typography variant="body1" fontWeight="bold">Password</Typography></TableCell>
                <TableCell>
                  <TextField
                    type="password"
                    value="******"
                    fullWidth
                    disabled
                    InputProps={{
                      sx: {
                        '& .MuiOutlinedInput-root.Mui-disabled': {
                          backgroundColor: '#f0f0f0',
                          borderColor: '#DB4437',
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit password" onClick={() => setPasswordModalOpen(true)}>
                    <EditIcon sx={{ color: '#DB4437' }} />
                  </IconButton>
                </TableCell>
              </TableRow>

              {/* Birth Date */}
              <TableRow>
                <TableCell><Typography variant="body1" fontWeight="bold">Birth Date</Typography></TableCell>
                <TableCell>
                  <TextField
                    type="date"
                    value={employee?.birth_date || ''}
                    onChange={(e) => handleChange('birth_date', e.target.value)}
                    fullWidth
                    disabled={!editableFields.birth_date}
                    error={!employee?.birth_date}
                    helperText={!employee?.birth_date && 'Birthdate cannot be empty'}
                    InputProps={{
                      sx: {
                        '&:focus-within .MuiOutlinedInput-notchedOutline': {
                          borderColor: editableFields.birth_date ? '#DB4437' : undefined,
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit birth date" onClick={() => handleEditToggle('birth_date')}>
                    <EditIcon sx={{ color: '#DB4437' }} />
                  </IconButton>
                </TableCell>
              </TableRow>

              {/* Email */}
              <TableRow>
                <TableCell><Typography variant="body1" fontWeight="bold">Email</Typography></TableCell>
                <TableCell>
                  <TextField
                    value={employee?.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    fullWidth
                    disabled={!editableFields.email}
                    error={!employee?.email}
                    helperText={!employee?.email && 'Email cannot be empty'}
                    InputProps={{
                      sx: {
                        '&:focus-within .MuiOutlinedInput-notchedOutline': {
                          borderColor: editableFields.email ? '#DB4437' : undefined,
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit email" onClick={() => handleEditToggle('email')}>
                    <EditIcon sx={{ color: '#DB4437' }} />
                  </IconButton>
                </TableCell>
              </TableRow>

              {/* Phone */}
              <TableRow>
                <TableCell><Typography variant="body1" fontWeight="bold">Phone</Typography></TableCell>
                <TableCell>
                  <TextField
                    value={employee?.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    fullWidth
                    disabled={!editableFields.phone}
                    error={!employee?.phone}
                    helperText={!employee?.phone && 'Phone cannot be empty'}
                    InputProps={{
                      sx: {
                        '&:focus-within .MuiOutlinedInput-notchedOutline': {
                          borderColor: editableFields.phone ? '#DB4437' : undefined,
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit phone" onClick={() => handleEditToggle('phone')}>
                    <EditIcon sx={{ color: '#DB4437' }} />
                  </IconButton>
                </TableCell>
              </TableRow>

              {/* Address */}
              <TableRow>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">Address</Typography>
                </TableCell>
                <TableCell>
                  <TextField
                    value={employee?.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    fullWidth
                    disabled={!editableFields.address}
                    error={!employee?.address}
                    helperText={!employee?.address && 'Address cannot be empty'}
                    multiline
                    rows={5}
                    InputProps={{
                      sx: {
                        '&:focus-within .MuiOutlinedInput-notchedOutline': {
                          borderColor: editableFields.address ? '#DB4437' : undefined,
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit address" onClick={() => handleEditToggle('address')}>
                    <EditIcon sx={{ color: '#DB4437' }} />
                  </IconButton>
                </TableCell>
              </TableRow>

              {/* Marital Status */}
              <TableRow>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">Marital Status</Typography>
                </TableCell>
                <TableCell>
                  <Select
                    value={employee?.marital_status || ''}
                    onChange={(e) => handleChange('marital_status', e.target.value)}
                    fullWidth
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#DB4437',
                      }
                    }}
                  >
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Married">Married</MenuItem>
                  </Select>
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>

              {/* Location */}
              <TableRow>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">Location</Typography>
                </TableCell>
                <TableCell>
                  <Select
                    value={employee?.location_id || ''}
                    onChange={(e) => handleChange('location_id', Number(e.target.value))}
                    fullWidth
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 100, 
                        },
                      },
                    }}
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#DB4437',
                      },
                    }}
                  >
                    {locations.map((location) => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.location_name}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>

              {/* Grade */}
              <TableRow>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">Grade</Typography>
                </TableCell>
                <TableCell>
                  <Select
                    value={employee?.grade_id || ''}
                    onChange={(e) => handleChange('grade_id', Number(e.target.value))}
                    fullWidth
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 100, 
                        },
                      },
                    }}
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#DB4437',
                      },
                    }}
                  >
                    {grades.map((grade) => (
                      <MenuItem key={grade.id} value={grade.id}>
                        {grade.grade_name}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>

              {/* Job Position */}
              <TableRow>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">Job Position</Typography>
                </TableCell>
                <TableCell>
                  <Select
                    value={employee?.job_position_id || ''}
                    onChange={(e) => handleChange('job_position_id', Number(e.target.value))}
                    fullWidth
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 100,
                        },
                      },
                    }}
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#DB4437',
                      },
                    }}
                  >
                    {jobPositions.map((position) => (
                      <MenuItem key={position.id} value={position.id}>
                        {position.job_name}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleViewChanges} 
            sx={{ 
              backgroundColor: '#DB4437', 
              color: '#fff', 
              borderRadius: '8px', 
              padding: '10px 20px',
              '&:hover': { backgroundColor: '#c63e30' }
            }}
          >
            View Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={isHistoryModalOpen} 
        onClose={handleCloseHistoryModal} 
        maxWidth="xs" 
        fullWidth
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 5px 30px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            color: '#DB4437',
            fontWeight: 'bold',
            fontSize: '1.25rem',
          }}
        >
          Request Summary
          <IconButton onClick={handleCloseHistoryModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent 
          sx={{ 
            paddingTop: '10px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          {lastRequest ? (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center', 
                padding: '10px 0', 
                backgroundColor: '#f9f9f9', 
                borderRadius: '8px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                marginBottom: '20px',
                width: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', color: '#6e6e6e', paddingLeft: '10px' }}>
                <CalendarTodayIcon sx={{ marginRight: '10px' }} />
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '18px', fontWeight: 'bold'}}>
                  {typeof lastRequest.created_at === 'string' ? addHoursToDate(lastRequest.created_at, 7) : 'Invalid date'}
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  justifyContent: 'center',
                  backgroundColor: lastRequest.status === 'Approved' 
                    ? '#E6F4EA'
                    : lastRequest.status === 'Rejected' 
                    ? '#FDECEA'
                    : '#F0F0F0',
                  borderRadius: '4px', 
                  padding: '4px 10px',
                  maxWidth: lastRequest.status === 'Pending' ? '75px' : '85px',
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    color: lastRequest.status === 'Approved' 
                      ? '#4CAF50' 
                      : lastRequest.status === 'Rejected' 
                      ? '#DB4437' 
                      : '#6e6e6e'
                  }}
                >
                  {lastRequest.status}
                </Typography>
              </Box>

              <Box sx={{ paddingRight: '1px' }} />
            </Box>
          ) : (
            <Box 
              sx={{ 
                padding: '20px', 
                textAlign: 'center', 
                backgroundColor: '#fefefe', 
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
                width: '100%',
              }}
            >
              <Typography
                 sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  fontWeight: 'bold',
                  color: '#f0f0f0',
                  fontSize: '1rem'
              }}
              >
                No request history found.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isPasswordModalOpen} 
        onClose={() => setPasswordModalOpen(false)} 
        maxWidth="xs" 
        fullWidth
      >
        <DialogTitle
        sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            color: '#DB4437',
            fontWeight: 'bold',
            fontSize: '20px',
          }}
        >
          Change Password          
          <IconButton onClick={() => {
            setPasswordModalOpen(false);
          }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
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
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
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
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handlePasswordChange} 
            sx={{ 
              backgroundColor: '#DB4437', 
              color: '#fff', 
              borderRadius: '8px', 
              padding: '10px 20px',
              '&:hover': { backgroundColor: '#c63e30' }
            }}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={isChangesModalOpen} 
        onClose={closeChangesModal} 
        maxWidth="xs" 
        fullWidth
        sx={{
            '& .MuiPaper-root': {
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 5px 30px rgba(0,0,0,0.2)',
            }
        }}
      >
        <DialogTitle
            sx={{
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '1 rem',
            color: '#DB4437',
            marginBottom: '10px'
            }}
        >
            Changes Summary
            <IconButton onClick={closeChangesModal}>
                <CloseIcon />
            </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent
          sx={{
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          <ul style={{ listStyleType: 'none', padding: '0' }}>
            {Object.entries(changes)
              .filter(([field, newValue]) => {
                const oldValueField = `old_${field}` as keyof EmployeeRequest;
                const newEmployeeValue = employee?.[field as keyof Employee];

                const oldValue = changes[oldValueField] || newEmployeeValue;

                return oldValue !== newValue && newValue !== undefined && oldValue !== undefined;
              })
              .map(([field, newValue]) => {
                let displayName = field;
                let displayNewValue = newValue;
                let displayOldValue = changes[`old_${field}` as keyof EmployeeRequest] || employee?.[field as keyof Employee];

                switch (field) {
                  case 'name':
                    displayName = 'Name';
                    break;
                  case 'username':
                    displayName = 'Username';
                    break;
                  case 'password':
                    displayName = 'Password';
                    break;
                  case 'birth_date':
                    displayName = 'Birth Date';
                    break;
                  case 'email':
                    displayName = 'Email';
                    break;
                  case 'phone':
                    displayName = 'Phone Number';
                    break;
                  case 'marital_status':
                    displayName = 'Marital Status';
                    break;
                  case 'address':
                    displayName = 'Address';
                    break;
                  case 'location_id':
                    displayName = 'Location';
                    displayNewValue = getLocationName(newValue as number);
                    displayOldValue = getLocationName(displayOldValue as number);
                    break;
                  case 'grade_id':
                    displayName = 'Grade';
                    displayNewValue = getGradeName(newValue as number);
                    displayOldValue = getGradeName(displayOldValue as number);
                    break;
                  case 'job_position_id':
                    displayName = 'Job Position';
                    displayNewValue = getJobPositionName(newValue as number);
                    displayOldValue = getJobPositionName(displayOldValue as number);
                    break;
                  default:
                    break;
                }

                return (
                  <li
                    key={field}
                    style={{
                      marginBottom: '10px',
                      background: '#f9f9f9',
                      padding: '10px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
                      <CardContent sx={{ padding: '0px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#DB4437', marginTop: '0px', marginBottom: '4px' }}>
                          {displayName}
                        </Typography>

                        <Grid container alignItems="center" justifyContent="center">
                          <Grid item xs={5} sx={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Box
                              sx={{
                                wordWrap: 'break-word',
                                padding: '5px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'normal',
                              }}
                            >
                              <Typography variant="body2">{displayOldValue}</Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={2} sx={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <ArrowForwardIcon sx={{ color: '#DB4437' }} />
                          </Grid>

                          <Grid item xs={5} sx={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Box
                              sx={{
                                wordWrap: 'break-word',
                                padding: '5px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'normal',
                              }}
                            >
                              <Typography variant="body2">{displayNewValue}</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
          </ul>
        </DialogContent>
        <Divider />
        <DialogActions>
            <Button 
              onClick={requestChangesModal}
              disabled={Object.keys(changes).length === 0}
              sx={{ 
                backgroundColor: Object.keys(changes).length === 0 ? '#f0f0f0' : '#DB4437',
                color: Object.keys(changes).length === 0 ? '#999' : '#fff',
                borderRadius: '8px', 
                padding: '10px 20px',
                '&:hover': {
                  backgroundColor: Object.keys(changes).length === 0 ? '#f0f0f0' : '#c63e30',
                },
              }}
            >
            Send Request
            </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PersonalInfoModal;
