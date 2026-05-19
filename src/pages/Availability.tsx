/**
 * Availability.tsx
 * Colin Brown May 18, 2026
 */

import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Avatar,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Link as RouterLink } from "react-router-dom";
import type { Dayjs } from "dayjs";

export default function Availability({
  selectedWeekStart,
}: {
  selectedWeekStart: Dayjs | null;
}) {
  return (
    <>
      <Box sx={{ padding: 1 }}>
        <Button
          sx={{ mb: 1 }}
          component={RouterLink}
          to="/"
          startIcon={<HomeIcon />}
        >
          Home
        </Button>
        <Stack
          direction={"row"}
          sx={{ justifyContent: "space-between", spacing: 2, mb: 2 }}
        >
          <Typography variant="h4">Availability</Typography>
        </Stack>
      </Box>
    </>
  );
}
