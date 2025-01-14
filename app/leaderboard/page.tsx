"use client";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
} from '@mui/material';
import { useEffect, useState } from 'react';
import Link from 'next/link'

type DataItem = {
  name: string,
  trusted_score: number;
  checked_claims: number;
};
export default function InfluencerLeaderboard(){
  const [data, setData] = useState([]);
  const [totalCheckedClaims, setTotalCheckedClaims] = useState(0);
  const [averageTrustedScore, setAverageTrustedScore]= useState(0)
  const categories = ['All', 'Nutrition', 'Fitness', 'Medicine', 'Mental Health'];
  useEffect(() => {
    fetch('/api/influencers')
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        const totalCheckedClaim = data.reduce((sum:number, item:any) => sum + item.checked_claims, 0);
        const totalTrustedScore = data.reduce((sum:number, item:any) => sum + item.trusted_score, 0);
        setAverageTrustedScore(data.length > 0 ? totalTrustedScore / data.length : 0);        
        setTotalCheckedClaims(totalCheckedClaim)
      })
  }, []);

  
  return (
    <main>
      <Box p={4} bgcolor="background.default" color="text.primary">
        {/* Header Section */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Influencer Trust Leaderboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Real-time rankings of health influencers based on scientific accuracy, credibility, and transparency. Updated daily using AI-powered analysis.
        </Typography>

        {/* Stats Section */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{data.length}</Typography>
              <Typography variant="body2" color="text.secondary">Active Influencers</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{totalCheckedClaims}</Typography>
              <Typography variant="body2" color="text.secondary">Claims Verified</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{averageTrustedScore.toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">Average Trust Score</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Category Filters 
          <Box mb={3}>
            {categories.map((category) => (
              <Button key={category} variant="contained" sx={{ mr: 1, mb: 1 }}>
                {category}
              </Button>
            ))}
          </Box>
        */}
        {/* Leaderboard Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Influencer</TableCell>
                <TableCell>Trust Score</TableCell>
                <TableCell>Verified Claims</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data && data.map((row:any, i) => (
                <TableRow key={i+1}>
                  <TableCell>{i+1}</TableCell>
                  <TableCell>
                    <Link href={`/influencer/${row.name}`}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2 }}>{row.name}</Avatar>
                      {row.name}
                    </Box>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Chip label={row.trusted_score} color="success" />
                  </TableCell>
                  <TableCell>{row.checked_claims}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </main>
  );
}

