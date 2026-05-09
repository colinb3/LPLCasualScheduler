/** Shifts.tsx
 * Colin Brown
 */

import React from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function Shifts({ branches }: { branches: string[] }) {
  const [date, setDate] = React.useState<Dayjs | null>(dayjs());
  return (
    <Box sx={{ padding: 1 }}>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", spacing: 2, mb: 2 }}
      >
        <Typography variant="h4">Shifts</Typography>

        <FormControl>
          <FormLabel id="display-by-label">Display by:</FormLabel>
          <RadioGroup
            aria-labelledby="display-by-label"
            defaultValue={"branch"}
            onChange={() => {}}
            row
          >
            <FormControlLabel
              value="branch"
              control={<Radio />}
              label="Branch"
            />
            <FormControlLabel value="date" control={<Radio />} label="Date" />
          </RadioGroup>
        </FormControl>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select Week"
            value={date}
            onChange={(newValue) => setDate(newValue)}
          />
        </LocalizationProvider>
        <Typography variant="body1" sx={{ my: 1 }}>
          Week of {date?.startOf("week").add(1, "day").format("MMM D")} -{" "}
          {date?.endOf("week").format("MMM D")}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {branches.map((branch) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={branch}>
            <Box
              sx={{
                border: "solid",
                borderWidth: "1px",
                borderColor: "primary.secondary",
                borderRadius: "3px",
                padding: "10px",
              }}
            >
              <Stack
                direction={"row"}
                sx={{ spacing: 2, justifyContent: "space-between" }}
              >
                <Typography sx={{ fontWeight: "3em" }}>{branch}</Typography>
                <Button variant="contained">Add Shift</Button>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
