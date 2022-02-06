import React from 'react';
import Paper from '@mui/material/Paper';

const ContentWrapper = ({ children }) => (
  <Paper
    elevation={1}
    sx={{
      m: 2,
      p: 2,
      maxHeight: (theme) => `calc(100vh - ${theme.spacing(10)})`,
      overflowY: 'auto',
    }}
  >
    {children}
  </Paper>
);

export default ContentWrapper;
