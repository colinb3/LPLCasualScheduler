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
  Avatar,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Divider,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
//import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Link as RouterLink } from "react-router-dom";
import type { Dayjs } from "dayjs";
import { queryRows, runSql } from "../db/sqlite";

type CasualRow = {
  id: number;
  name: string;
};

type AvailabilityRow = {
  id: number;
  casualId: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  branchName: string;
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
  const [addAvailDialogOpen, setAddAvailDialogOpen] = React.useState(false);
  const [selectedCasualId, setSelectedCasualId] = React.useState<number | null>(
    null,
  );
  const [selectedShiftId, setSelectedShiftId] = React.useState<number | null>(
    null,
  );
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [availabilities, setAvailabilities] = React.useState<AvailabilityRow[]>(
    [],
  );

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

  React.useEffect(() => {
    let isActive = true;

    async function loadAvailability() {
      try {
        const rows = await queryRows<AvailabilityRow>(
          `
            SELECT 
            Available.id AS id, 
            Available.casual_id AS casualId, 
            Shift.date AS shiftDate,
            Shift.start_time AS startTime, 
            Shift.end_time AS endTime, 
            Branch.name AS branchName
            FROM Available 
            LEFT JOIN Shift ON Shift.id = Available.shift_id
            LEFT JOIN Branch ON Shift.branch_id = Branch.id
            WHERE date >= ? AND date < ?;
          `,
          [
            selectedWeekStart?.format("YYYY-MM-DD") || "2026-05-19",
            selectedWeekStart?.add(7, "day").format("YYYY-MM-DD") ||
              "2026-05-26",
          ],
        );

        if (isActive) {
          setAvailabilities(rows);
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

    void loadAvailability();

    return () => {
      isActive = false;
    };
  }, []);

  const getWeekStart = (date: Dayjs | null) => {
    if (!date) {
      return null;
    }

    const monday = date.clone().startOf("week").add(1, "day");

    return date.day() === 0 ? monday.subtract(7, "day") : monday;
  };

  const handleOpenAddAvailabilitySortCasual = (casualId: number) => {
    setSelectedCasualId(casualId);
    setSelectedShiftId(null);
    setSaveError(null);
    setAddAvailDialogOpen(true);
  };

  /*const handleOpenAddAvailabilitySortShift = (shiftId: number) => {
    setSelectedCasualId(null);
    setSelectedShiftId(shiftId);
    setSaveError(null);
    setAddAvailDialogOpen(true);
  };*/

  const handleCloseDialog = () => {
    setAddAvailDialogOpen(false);
    setSaveError(null);
    setSelectedCasualId(null);
    setSelectedShiftId(null);
  };

  const handleAddAvailability = async () => {
    if (!selectedCasualId || !selectedShiftId) {
      setSaveError("Please select a casual and a shift");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await runSql(
        `
            INSERT INTO Availability (casual_id, shift_id)
            VALUES (?, ?)
          `,
        [selectedCasualId, selectedShiftId],
      );

      setAddAvailDialogOpen(false);
      setSelectedCasualId(null);
      setSelectedShiftId(null);

      // refreshData();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to add availability",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Box sx={{ padding: 1 }}>
        <Stack
          direction={"row"}
          sx={{
            spacing: 1,
            mb: 1,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            sx={{ mb: 1 }}
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
          >
            Home
          </Button>
          {selectedWeekStart && getWeekStart(selectedWeekStart) && (
            <Typography sx={{ whiteSpace: "nowrap" }}>
              Week: {getWeekStart(selectedWeekStart)?.format("MMM D")} -{" "}
              {getWeekStart(selectedWeekStart)?.add(6, "day").format("MMM D")}
            </Typography>
          )}
        </Stack>
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
              onChange={(e) =>
                setDisplayBy(e.target.value as "casual" | "shift")
              }
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
                      onClick={() =>
                        handleOpenAddAvailabilitySortCasual(casual.id)
                      }
                      startIcon={<AddIcon />}
                      size="small"
                    >
                      Availability
                    </Button>
                  </Box>
                </Stack>
                <Divider sx={{ mt: 1.5, mb: 0.5, color: "b" }} />
                <Stack direction={"column"} spacing={0.5} sx={{ mt: 0.5 }}>
                  {availabilities
                    .filter((a) => a.casualId === casual.id)
                    .map((availability) => (
                      <Box key={availability.id} sx={{ py: 0.5 }}>
                        <Typography variant="body2">
                          {availability.shiftDate}: {availability.startTime} -{" "}
                          {availability.endTime}
                        </Typography>
                      </Box>
                    ))}
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Dialog open={addAvailDialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>
            Add Availability for{" "}
            {selectedCasualId
              ? casuals.find((c) => c.id === selectedCasualId)?.name
              : ""}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ py: 1 }}>
              {saveError && (
                <Typography color="error" variant="body2">
                  {saveError}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              disabled={isSaving}
              onClick={() => {
                void handleAddAvailability();
              }}
            >
              {isSaving ? "Saving..." : "Add Availability"}
            </Button>
            <Button onClick={handleCloseDialog} disabled={isSaving}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
