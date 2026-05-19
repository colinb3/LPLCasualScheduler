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
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Divider,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Link as RouterLink } from "react-router-dom";
import type { Dayjs } from "dayjs";
import { queryRows, runSql } from "../db/sqlite";

type CasualRow = {
  id: number;
  name: string;
};

export default function Availability({
  selectedWeekStart,
}: {
  selectedWeekStart: Dayjs | null;
}) {
  const [displayBy, setDisplayBy] = React.useState<"casual" | "shift">(
    () =>
      (localStorage.getItem("availabilityDisplayBy") as "casual" | "shift") ||
      "casual",
  );
  const [casuals, setCasuals] = React.useState<CasualRow[]>([]);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isActive = true;

    async function loadCasual() {
      try {
        const rows = await queryRows<CasualRow>(
          `
            SELECT id, name
            FROM Casual
          `,
        );

        if (isActive) {
          setCasuals(rows);
          setErrorMsg(null);
        }
      } catch (error) {
        if (isActive) {
          setErrorMsg(
            error instanceof Error ? error.message : "Failed to load branches",
          );
        }
      }
    }

    void loadCasual();

    return () => {
      isActive = false;
    };
  }, []);

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
          <FormControl>
            <FormLabel id="display-by-label">Display by:</FormLabel>
            <RadioGroup
              aria-labelledby="display-by-label"
              value={displayBy}
              row
            >
              <FormControlLabel
                value="casual"
                control={<Radio />}
                label="Casual"
              />
              <FormControlLabel
                value="shift"
                control={<Radio />}
                label="Shift"
              />
            </RadioGroup>
          </FormControl>
        </Stack>

        {errorMsg ? (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Typography>
        ) : null}

        <Grid container spacing={2}>
          {casuals.map((casual) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={casual.id}>
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
                  spacing={1}
                  sx={{
                    justifyContent: "space-between",
                  }}
                >
                  <Stack
                    direction={"row"}
                    spacing={1.5}
                    sx={{
                      alignItems: "center",
                    }}
                  >
                    <Avatar sx={{ width: 40, height: 40, flexShrink: 0 }}>
                      {casual.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography
                      variant="body1"
                      sx={{
                        minWidth: 0,
                        flex: 1,
                        overflowWrap: "anywhere",
                        whiteSpace: "normal",
                      }}
                    >
                      {casual.name}
                    </Typography>
                  </Stack>
                  <Box>
                    <Button
                      variant="contained"
                      // onClick={() => handleOpenAddShift(branch.id)}
                      startIcon={<AddIcon />}
                      size="small"
                    >
                      Availability
                    </Button>
                  </Box>
                </Stack>
                <Divider sx={{ mt: 1.5, mb: 0.5, color: "b" }} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
