"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname  } from 'next/navigation';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Box, 
    Button,
    IconButton,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
    Popover,
    ListItemIcon,
    Menu,
    MenuItem,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InfoIcon from '@mui/icons-material/Info';
import MenuIcon from '@mui/icons-material/Menu';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Link from 'next/link';
import LoginPopover from './LoginPopover';
import PersonalInfoModal from './PersonalInfoModal';
import { logout } from '../services/authService';
import { getEmployeeById } from '../services/employeeService';

const Header: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [accountName, setAccountName] = useState<string>('');
    
    const [anchorMenuEl, setAnchorMenuEl] = useState<null | HTMLElement>(null);
    const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openPersonalModal, setOpenPersonalModal] = useState<boolean>(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchEmployeeData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userIdStr = localStorage.getItem('id');
                    const userId = Number(userIdStr);
                    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    
                    if (userId) {
                        const employee = await getEmployeeById(userId);
                        if (employee) {
                            setAccountName(employee.username || '');
                        } else {
                            console.error("Employee not found");
                        }
                    } else {
                        console.error("Invalid userId");
                    }
    
                    setIsAdmin(adminStatus);
                    setIsLoggedIn(true);
                } catch (error) {
                    console.error("Error fetching employee data:", error);
                }
            } else {
                console.error("Token is missing");
            }
        };
    
        fetchEmployeeData();
    }, []);    

    const handleIconMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorMenuEl(event.currentTarget);
    };

    const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
        setProfileAnchorEl(event.currentTarget);
    };

    const handleLoginClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePersonalInfoClick = () => {
        setOpenPersonalModal(true);
        handleCloseProfileMenu();
    };

    const handleClosePersonalModal = () => {
        setOpenPersonalModal(false);
    };

    const handleCloseMenu = () => {
        setAnchorMenuEl(null);
    };

    const handleCloseProfileMenu = () => {
        setProfileAnchorEl(null);
    };

    const handleCloseLogin = () => {
        setAnchorEl(null);
    };

    const handleLoginSuccess = (username: string, isAdmin: boolean) => {
        setAccountName(username);
        setIsAdmin(isAdmin);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        setAccountName('');
        setIsAdmin(false);
        handleCloseProfileMenu();
        router.push('/');
    };

    const handleAttendanceInformation = () => {
        const id = localStorage.getItem('id');
        if (id) {
            console.log(`Navigating to attendance-information for Id: ${id}`);
            router.push(`/attendance-information?id=${id}`);
        } else {
            console.error('Employee ID not found in localStorage');
        }
    };

    const openMenu = Boolean(anchorMenuEl);
    const openLogin = Boolean(anchorEl);
    const openProfileMenu = Boolean(profileAnchorEl);
    const idMenu = openMenu ? 'menu-popover' : undefined;

    return (
        <>
            <AppBar 
                position="fixed" 
                component="header" 
                sx={{ 
                    width: '100%', 
                    height: '11%',
                    backgroundColor: '#000000', 
                    padding: '10px 0', 
                    boxShadow: 'none',
                    borderBottom: '5px solid #5a5a5a'
                }}
            >
                <Toolbar>
                    <IconButton 
                        edge="start" 
                        color="inherit" 
                        aria-label="menu" 
                        sx={{ mr: 2 }} 
                        onClick={handleIconMenuClick}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            flexGrow: 1 
                            }}
                    >
                        <Link 
                            href="/" 
                            passHref 
                            style={{ 
                                textDecoration: 'none' 
                                }}
                        >
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center' 
                                }}
                            >
                                <Box
                                    component="img"
                                    sx={{
                                        height: 50,
                                        width: 50,
                                        marginRight: 2,
                                        borderRadius: '30%',
                                        backgroundColor: '#ffffff',
                                        objectFit: 'cover', 
                                    }}
                                    alt="Logo Wahana Ritelindo"
                                    src="/header_logo.png"
                                />
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column' 
                                    }}
                                >
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            textAlign: 'left' 
                                        }}
                                    >
                                        <span 
                                            style={{ 
                                                color: '#e00404', 
                                                fontWeight: 'bold' 
                                            }}
                                        >
                                            WAHANA
                                        </span>{' '}
                                        <span 
                                            style={{ 
                                                color: '#ffffff', 
                                                fontWeight: 'bold' 
                                            }}
                                        >
                                            Ritelindo
                                        </span>
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            textAlign: 'left', 
                                            fontWeight: 'bold', 
                                            color: '#ffffff',
                                            fontSize: '9.6px'
                                        }}>
                                        AUTHORIZED DEALER HONDA MOTORCYCLE
                                    </Typography>
                                </Box>
                            </Box>
                        </Link>
                    </Box>

                    {isLoggedIn ? (
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center' 
                            }}
                        >
                            <Button 
                                color="inherit" 
                                startIcon={
                                    <AccountCircleIcon 
                                        sx={{ 
                                            width: 40, 
                                            height: 40
                                        }}
                                    />
                                }
                                endIcon={<ArrowDropDownIcon />}
                                sx={{ 
                                    fontSize: '18px',
                                }}
                                onClick={handleProfileClick}
                            >
                                {accountName}
                            </Button>
                        </Box>
                    ) : (
                        <Button 
                            color="inherit" 
                            startIcon={
                                <AccountCircleIcon 
                                    sx={{ 
                                        width: 40, 
                                        height: 40 
                                    }}
                                />
                            }
                            endIcon={<ArrowDropDownIcon />}
                            sx={{ 
                                fontSize: '18px',
                            }}
                            onClick={handleLoginClick}
                        >
                            LOGIN
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Menu
                anchorEl={profileAnchorEl}
                open={openProfileMenu}
                onClose={handleCloseProfileMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem
                    onClick={handlePersonalInfoClick}
                    sx={{
                        padding: '10px 20px',
                        '&:hover': {
                            backgroundColor: '#f0f0f0',
                            transition: 'background-color 0.3s ease',
                            cursor: 'pointer',
                            '& .MuiTypography-root': {
                                color: '#e00404',
                            },
                            '& .MuiSvgIcon-root': {
                                color: '#e00404',
                            }
                        },
                    }}
                >
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            fontWeight: 'bold' 
                        }}
                    >
                        Personal Information
                    </Typography>
                </MenuItem>

                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        padding: '10px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        '&:hover': {
                            backgroundColor: '#f0f0f0',
                            transition: 'background-color 0.3s ease',
                            cursor: 'pointer',
                            '& .MuiTypography-root': {
                                color: '#e00404',
                            },
                            '& .MuiSvgIcon-root': {
                                color: '#e00404',
                            }
                        },
                    }}
                >
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            fontWeight: 'bold',
                        }}
                    >
                        Logout
                    </Typography>
                    <LogoutIcon sx={{ transform: 'rotate(180deg)' }} />
                </MenuItem>
            </Menu>

            <PersonalInfoModal 
                open={openPersonalModal} 
                handleClose={handleClosePersonalModal}
            />

            <Popover
                id={idMenu}
                open={openMenu}
                anchorEl={anchorMenuEl}
                onClose={handleCloseMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <Paper 
                    sx={{ 
                        padding: 2, 
                        width: '325px', 
                        height: '590px' 
                    }}
                >
                    <List>
                        <ListItem 
                            component={Link} 
                            href="/" 
                            passHref
                            sx={{
                                '&:hover': {
                                    backgroundColor: '#f0f0f0',
                                    transition: 'background-color 0.3s ease',
                                    cursor: 'pointer',
                                    '& .MuiTypography-root': {
                                        color: '#e00404',
                                    },
                                    '& .MuiSvgIcon-root': {
                                        color: '#e00404',
                                    }
                                },
                                backgroundColor: pathname === '/' ? '#e00404' : 'inherit',
                                '& .MuiTypography-root': {
                                    fontWeight: pathname === '/' ? 'bold' : 'bold',
                                    color: pathname === '/' ? '#ffffff' : '#000000',
                                },
                                '& .MuiSvgIcon-root': {
                                    color: pathname === '/' ? '#ffffff' : '#000000',
                                },
                                mb: 2,
                            }}
                        >
                            <ListItemIcon>
                                <SpaceDashboardIcon />
                            </ListItemIcon>
                            <ListItemText 
                                primary={
                                    <Typography 
                                        sx={{ 
                                            fontWeight: 'bold' 
                                        }}
                                    >
                                        Dashboard
                                    </Typography>
                                } 
                            />
                        </ListItem>
                        <Divider />
                        {isLoggedIn && !isAdmin && (
                            <>  
                                <ListItem 
                                    onClick={handleAttendanceInformation}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: '#f0f0f0',
                                            transition: 'background-color 0.3s ease',
                                            cursor: 'pointer',
                                            '& .MuiTypography-root': {
                                                color: '#e00404',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: '#e00404',
                                            }
                                        },
                                        backgroundColor: pathname === '/attendance-information' ? '#e00404' : 'inherit',
                                        '& .MuiTypography-root': {
                                            fontWeight: pathname === '/attendance-information' ? 'bold' : 'bold',
                                            color: pathname === '/attendance-information' ? '#ffffff' : '#000000',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: pathname === '/attendance-information' ? '#ffffff' : '#000000',
                                        },
                                        mb: 2,
                                        mt: 2
                                    }}
                                >
                                    <ListItemIcon>
                                        <InfoIcon />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={
                                            <Typography 
                                                sx={{ 
                                                    fontWeight: 'bold' 
                                                }}
                                            >
                                                Attendance Information
                                            </Typography>
                                        }  
                                    />
                                </ListItem>
                                <Divider />
                                {/* Attendance Request */}
                                <ListItem 
                                    component={Link} 
                                    href="/attendance-request" 
                                    passHref
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: '#f0f0f0',
                                            transition: 'background-color 0.3s ease',
                                            cursor: 'pointer',
                                            '& .MuiTypography-root': {
                                                color: '#e00404',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: '#e00404',
                                            }
                                        },
                                        backgroundColor: pathname === '/attendance-request' ? '#e00404' : 'inherit',
                                        '& .MuiTypography-root': {
                                            fontWeight: pathname === '/attendance-request' ? 'bold' : 'bold',
                                            color: pathname === '/attendance-request' ? '#ffffff' : '#000000',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: pathname === '/attendance-request' ? '#ffffff' : '#000000',
                                        },
                                        mb: 2,
                                        mt: 2
                                    }}
                                >   
                                    <ListItemIcon>
                                        <BuildIcon />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={
                                            <Typography 
                                                sx={{ 
                                                    fontWeight: 'bold' 
                                                }}
                                            >
                                                Attendance Request
                                            </Typography>
                                        } 
                                    />
                                </ListItem>
                                <Divider />
                            </>
                        )}

                        {isLoggedIn && isAdmin && (
                            <>
                                {/* Employee Management */}
                                <ListItem 
                                    component={Link} 
                                    href="/employee-management" 
                                    passHref
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: '#f0f0f0',
                                            transition: 'background-color 0.3s ease',
                                            cursor: 'pointer',
                                            '& .MuiTypography-root': {
                                                color: '#e00404',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: '#e00404',
                                            }
                                        },
                                        backgroundColor: pathname === '/employee-management' ? '#e00404' : 'inherit',
                                        '& .MuiTypography-root': {
                                            fontWeight: pathname === '/employee-management' ? 'bold' : 'bold',
                                            color: pathname === '/employee-management' ? '#ffffff' : '#000000',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: pathname === '/employee-management' ? '#ffffff' : '#000000',
                                        },
                                        mb: 2,
                                        mt: 2
                                    }}
                                >
                                    <ListItemIcon>
                                        <PeopleIcon />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={
                                            <Typography 
                                                sx={{ 
                                                    fontWeight: 'bold' 
                                                }}
                                            >
                                                Employee Management
                                            </Typography>
                                        }  
                                    />
                                </ListItem>
                                <Divider />
                                {/* Location Management */}
                                <ListItem 
                                    component={Link} 
                                    href="/location-management" 
                                    passHref
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: '#f0f0f0',
                                            transition: 'background-color 0.3s ease',
                                            cursor: 'pointer',
                                            '& .MuiTypography-root': {
                                                color: '#e00404',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: '#e00404',
                                            }
                                        },
                                        backgroundColor: pathname === '/location-management' ? '#e00404' : 'inherit',
                                        '& .MuiTypography-root': {
                                            fontWeight: pathname === '/location-management' ? 'bold' : 'bold',
                                            color: pathname === '/location-management' ? '#ffffff' : '#000000',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: pathname === '/location-management' ? '#ffffff' : '#000000',
                                        },
                                        mb: 2,
                                        mt: 2
                                    }}
                                >   
                                    <ListItemIcon>
                                        <LocationOnIcon/>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={
                                            <Typography 
                                                sx={{ 
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                Location Management
                                            </Typography>
                                        } 
                                    />
                                </ListItem>
                                <Divider />
                                {/* Grade Management */}
                                <ListItem 
                                    component={Link} 
                                    href="/grade-management" 
                                    passHref
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: '#f0f0f0',
                                            transition: 'background-color 0.3s ease',
                                            cursor: 'pointer',
                                            '& .MuiTypography-root': {
                                                color: '#e00404',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: '#e00404',
                                            }
                                        },
                                        backgroundColor: pathname === '/grade-management' ? '#e00404' : 'inherit',
                                        '& .MuiTypography-root': {
                                            fontWeight: pathname === '/grade-management' ? 'bold' : 'bold',
                                            color: pathname === '/grade-management' ? '#ffffff' : '#000000',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: pathname === '/grade-management' ? '#ffffff' : '#000000',
                                        },
                                        mb: 2,
                                        mt: 2
                                    }}
                                >
                                    <ListItemIcon>
                                        <DoubleArrowIcon 
                                            sx={{ 
                                                transform: 'rotate(-90deg)' 
                                            }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={
                                            <Typography 
                                                sx={{ 
                                                    fontWeight: 'bold' 
                                                }}
                                            >
                                                Grade Management
                                            </Typography>
                                        }  
                                    />
                                </ListItem>
                                <Divider />
                                {/* Job Management */}
                                <ListItem 
                                    component={Link} 
                                    href="/job-management" 
                                    passHref
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: '#f0f0f0',
                                            transition: 'background-color 0.3s ease',
                                            cursor: 'pointer',
                                            '& .MuiTypography-root': {
                                                color: '#e00404',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: '#e00404',
                                            }
                                        },
                                        backgroundColor: pathname === '/job-management' ? '#e00404' : 'inherit',
                                        '& .MuiTypography-root': {
                                            fontWeight: pathname === '/job-management' ? 'bold' : 'bold',
                                            color: pathname === '/job-management' ? '#ffffff' : '#000000',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: pathname === '/job-management' ? '#ffffff' : '#000000',
                                        },
                                        mb: 2,
                                        mt: 2
                                    }}
                                >   
                                    <ListItemIcon>
                                        <WorkIcon />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={
                                            <Typography 
                                                sx={{ 
                                                    fontWeight: 'bold' 
                                                }}
                                            >
                                                Job Management
                                            </Typography>
                                        } 
                                    />
                                </ListItem>
                                <Divider />
                                <ListItem 
                                    component={Link} 
                                    href="/attendance-approval" 
                                    passHref
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: '#f0f0f0',
                                            transition: 'background-color 0.3s ease',
                                            cursor: 'pointer',
                                            '& .MuiTypography-root': {
                                                color: '#e00404',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: '#e00404',
                                            }
                                        },
                                        backgroundColor: pathname === '/attendance-approval' ? '#e00404' : 'inherit',
                                        '& .MuiTypography-root': {
                                            fontWeight: pathname === '/attendance-approval' ? 'bold' : 'bold',
                                            color: pathname === '/attendance-approval' ? '#ffffff' : '#000000',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: pathname === '/attendance-approval' ? '#ffffff' : '#000000',
                                        },
                                        mb: 2,
                                        mt: 2
                                    }}
                                >
                                    <ListItemIcon>
                                        <AssignmentTurnedInIcon />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={
                                            <Typography 
                                                sx={{ 
                                                    fontWeight: 'bold' 
                                                }}
                                            >
                                                Attendance Approval 
                                            </Typography>
                                        }  
                                    />
                                </ListItem>
                                <Divider />
                                <ListItem 
                                    component={Link} 
                                    href="/data-change-approval" 
                                    passHref
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: '#f0f0f0',
                                            transition: 'background-color 0.3s ease',
                                            cursor: 'pointer',
                                            '& .MuiTypography-root': {
                                                color: '#e00404',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: '#e00404',
                                            }
                                        },
                                        backgroundColor: pathname === '/data-change-approval' ? '#e00404' : 'inherit',
                                        '& .MuiTypography-root': {
                                            fontWeight: pathname === '/data-change-approval' ? 'bold' : 'bold',
                                            color: pathname === '/data-change-approval' ? '#ffffff' : '#000000',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: pathname === '/data-change-approval' ? '#ffffff' : '#000000',
                                        },
                                        mb: 2,
                                        mt: 2
                                    }}
                                >   
                                    <ListItemIcon>
                                        <FactCheckIcon />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={
                                            <Typography 
                                            sx={{ 
                                                fontWeight: 'bold' 
                                            }}
                                        >
                                                Data Change Approval
                                            </Typography>
                                        } 
                                    />
                                </ListItem>
                                <Divider />
                            </>
                        )}
                    </List>
                </Paper>
            </Popover>

            <LoginPopover 
                anchorEl={anchorEl} 
                open={openLogin} 
                handleClose={handleCloseLogin} 
                handleLoginSuccess={handleLoginSuccess} 
            />
        </>
    );
};

export default Header;
