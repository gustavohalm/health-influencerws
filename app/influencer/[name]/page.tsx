"use client";

import { useEffect, useState } from 'react';
import { Container, Box, Typography, Avatar, Button, Divider, CircularProgress, Link, Grid } from '@mui/material';

const ProfilePage = ({
  params,
}: {
  params: { name: string }
}) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const { name } = params;

  useEffect(() => {
    if (name) {
      fetch(`/api/influencer/${name}`)
        .then((response) => response.json())
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, [name]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#1E1E2F">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ bgcolor: '#2C2C3A', color: '#FFFFFF', p: 4, borderRadius: 2, mt: 4 }}>
      {/* Header Section */}
      <Box display="flex" alignItems="center" mb={4}>
        <Avatar
          src={'/profile.jpg'}
          alt="Profile"
          sx={{ width: 80, height: 80, mr: 3 }}
        />
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {data.name}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {data.description}
          </Typography>
        </Box>
      </Box>

      {/* Statistics Section */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={6} textAlign="center">
          <Typography variant="h5" color="primary">
            {data.trusted_score} %
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Trust Score
          </Typography>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Box display="flex" mb={3} borderBottom={1} borderColor="divider">
        <Button sx={{ color: '#FFFFFF' }}>Claims Analysis</Button>
      </Box>

      {/* Claims Section */}
      <Box>
        {data?.claims?.map((claim:any, index:number) => (
          <Box key={index} mb={3}>
            <Typography variant="h6" gutterBottom>
              {claim.claim}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {claim.data.status}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              AI Analysis: {claim.data.status_comment}
            </Typography>
            AI Sources: 
            {claim.data.citations?.map((citation:string) => (
           <> <Link href={citation} color="primary" underline="hover">
              {citation}
            </Link> | </>            ))}  
            {index < data.claims.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default ProfilePage;
