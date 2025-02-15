import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { AppBar, Toolbar, Button, Container, Box, Typography } from '@mui/material';
import client from './apollo-client';
import TapsLogoSmooth from './components/TapsLogoSmooth';
import './App.css';

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Box sx={{ mr: 1 }}>
                <TapsLogoSmooth width={32} height={32} />
              </Box>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                TAPS
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
              <Button color="inherit" component={Link} to="/home">
                Home
              </Button>
              <Button color="inherit" component={Link} to="/search">
                Search
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Container>
          <Outlet />
        </Container>
      </div>
    </ApolloProvider>
  );
}

export default App;
