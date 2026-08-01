import React from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Box 
} from '@mui/material';

const Footer: React.FC = () => {
    return (
        <AppBar 
            position="fixed" 
            component="footer" 
            sx={{ 
                top: 'auto', 
                bottom: 0,
                width: '100%', 
                height: '11%',
                backgroundColor: '#e00404',
                padding: '10px 0', 
                boxShadow: 'none'
            }}
        >
            <Toolbar 
                sx={{ 
                    justifyContent: 'space-between',
                    height: '100%' 
                }}
            >
                <Box 
                    sx={{ 
                        textAlign: 'left' 
                    }}
                >
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            color: '#ffffff',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            fontStyle: 'italic'
                        }}
                    >
                        © {new Date().getFullYear()} PT WAHANAARTHA RITELINDO
                    </Typography>
                </Box>
                
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center' 
                    }}
                >
                    <Box
                        component="img"
                        src="/footer_oneheart_logo.png"
                        alt="Footer One Heart Logo"
                        sx={{
                            height: 40,
                            width: 140,
                        }}
                    />

                    <Box
                        component="img"
                        src="/footer_honda_logo.png"
                        alt="Footer Honda Logo"
                        sx={{
                            height: 50,
                            width: 80,
                            paddingBottom: '5px',
                        }}
                    />
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Footer;
