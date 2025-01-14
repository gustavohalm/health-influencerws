"use client";

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useRouter } from 'next/navigation';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
const filter = createFilterOptions<any>();

const ResearchTasks = () => {
  const [timeRange, setTimeRange] = useState('Last Month');
  const [researchType, setResearchType] = useState('specific');
  const [journals, setJournals] = useState<string[]>([]);
  const [includeReview, setIncludeReview] = useState(true);
  const [includeScientific, setIncludeScientific] = useState(true);
  const [influencerName, setInfluencerName] = useState('');
  const [claimsAnalysis, setClaimsAnalysis] = useState(false);
  const [researchNotes, setResearchNotes] = useState('');
  const [value, setValue] = useState<string | null>(null);
  const [options, setOptions] = useState([])

  const router = useRouter();
  
  const handleSubmit = () => {
    // Handle research submission logic here
    console.log({
      timeRange,
      researchType,
      influencerName,
      claimsAnalysis,
      includeReview,
      includeScientific,
      journals,
      researchNotes,
    });
    router.push(`/influencer/${value}`)
  };
  useEffect(() => {
    fetch('/api/influencers/keys')
      .then((res) => res.json())
      .then((data) => {
        setOptions(data)
      })
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Research Configuration
      </Typography>

      <Grid container spacing={4}>
        {/* Research Type Selection */}
        <Grid item xs={12} md={6}>
          <ToggleButtonGroup
            value={researchType}
            exclusive
            aria-label="research type"
            fullWidth
          >
            <ToggleButton value="specific">Specific Influencer</ToggleButton>
        {/* Time Range Selection         <ToggleButton value="discover">Discover New</ToggleButton>*/}
          </ToggleButtonGroup>
        </Grid>

        {/* Time Range Selection 
        <Grid item xs={12} md={6}>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            aria-label="time range"
            fullWidth
          >
            <ToggleButton value="Last Week">Last Week</ToggleButton>
            <ToggleButton value="Last Month">Last Month</ToggleButton>
            <ToggleButton value="All Time">All Time</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        */}
        {/* Influencer Name Input */}
        {researchType === 'specific' && (
          <Grid item xs={12}>
          <Autocomplete
                value={value}
                onChange={(event, newValue) => {
                  if (typeof newValue === 'string') {
                    setValue(newValue);
                  } else if (newValue && newValue) {
                    // Create a new value from the user input
                    setValue(newValue);
                  } else {
                    setValue(newValue);
                  }
                }}
                filterOptions={(options, params) => {
                  const filtered = filter(options, params);

                  const { inputValue } = params;
                  // Suggest the creation of a new value
                  const isExisting = options.some((option) => inputValue === option);
                  if (inputValue !== '' && !isExisting) {
                    filtered.push( inputValue);
                  }

                  return filtered;
                }}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                id="free-solo-with-text-demo"
                options={options}
                getOptionLabel={(option) => {
                  // Value selected with enter, right from the input
                  if (typeof option === 'string') {
                    return option;
                  }    
                  // Add "xxx" option created dynamically
                  if (option) {
                    return option;
                  }
                  // Regular option
                  return option;
                }}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;
                  return (
                    <li key={key} {...optionProps}>
                      {option}
                    </li>
                  );
                }}
                sx={{ width: 300 }}
                freeSolo
                renderInput={(params) => (
                  <TextField {...params} fullWidth label="Influencer Name"/>
                )}
              />

            </Grid>
        )}

        {/* Claims Analysis Checkbox 
        {researchType === 'specific' && (
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={claimsAnalysis}
                  onChange={(e) => setClaimsAnalysis(e.target.checked)}
                />
              }
              label="Claims to Analyze Per Influencer"
            />
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeReview}
                onChange={(e) => setIncludeReview(e.target.checked)}
              />
            }
            label="Include Reviews Analysis"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeScientific}
                onChange={(e) => setIncludeScientific(e.target.checked)}
              />
            }
            label="Include Scientific Articles"
          />
        </Grid>
        */}
        {/* Scientific Journals Selector 
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Scientific Journals</InputLabel>
            <Select
              multiple
              value={journals}
              onChange={handleJournalsChange}
              renderValue={(selected) => (selected as string[]).join(', ')}
            >
              <MenuItem value="PubMed Central">PubMed Central</MenuItem>
              <MenuItem value="arXiv">arXiv</MenuItem>
              <MenuItem value="The Lancet">The Lancet</MenuItem>
              <MenuItem value="JAMA Network">JAMA Network</MenuItem>
              <MenuItem value="New England Journal of Medicine">
                New England Journal of Medicine
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
*/}
        {/* Research Notes Input 
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes for Research"
            value={researchNotes}
            onChange={(e) => setResearchNotes(e.target.value)}
          />
        </Grid>
*/}
        {/* Submit Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
          >
            Start Research
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResearchTasks;
