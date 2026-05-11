import { Box, Button, Stack, Typography } from "@mui/material";

export default function Home() {
  return (
    <Box sx={{ padding: 1 }}>
      <Typography variant="h4">LPL Casual Scheduler</Typography>
      <Stack direction="row" sx={{ spacing: 2, mt: 2, gap: 1 }}>
        <Button variant="contained" href="/shifts">
          View Shifts
        </Button>
        <Button variant="contained" href="/casuals">
          View Casuals
        </Button>
      </Stack>
    </Box>
  );
}
