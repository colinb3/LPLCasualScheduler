/** Shifts.tsx
 * Colin Brown
 */

import React from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import HomeIcon from "@mui/icons-material/Home";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { queryRows, runSql } from "../db/sqlite";

type BranchRow = {
  id: number;
  name: string;
  shiftCount: number;
};

type ShiftRow = {
  id: number;
  branch_id: number;
  date: Date;
  start: Date;
  end: Date;
};

export default function Shifts() {
  const [weekDate, setWeekDate] = React.useState<Dayjs | null>(dayjs());
  const [branches, setBranches] = React.useState<BranchRow[]>([]);
  const [shifts, setShifts] = React.useState<ShiftRow[]>([]);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [addShiftDialogOpen, setAddShiftDialogOpen] = React.useState(false);
  const [selectedBranchId, setSelectedBranchId] = React.useState<number | null>(
    null,
  );
  const [selectedWeekDay, setSelectedWeekDay] = React.useState<Dayjs | null>(
    null,
  );
  const [shiftStartTime, setShiftStartTime] = React.useState<Dayjs | null>(
    dayjs(),
  );
  const [shiftEndTime, setShiftEndTime] = React.useState<Dayjs | null>(dayjs());
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    let isActive = true;

    async function loadBranches() {
      try {
        const rows = await queryRows<BranchRow>(
          `
            SELECT
              Branch.id,
              Branch.name,
              COUNT(Shift.id) AS shiftCount
            FROM Branch
            LEFT JOIN Shift ON Shift.branch_id = Branch.id
            GROUP BY Branch.id, Branch.name
            ORDER BY Branch.name
          `,
        );

        if (isActive) {
          setBranches(rows);
          setLoadError(null);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load branches",
          );
        }
      }
    }

    void loadBranches();

    return () => {
      isActive = false;
    };
  }, []);

  React.useEffect(() => {
    let isActive = true;

    async function loadShifts() {
      try {
        const rows = await queryRows<ShiftRow>(
          `
            SELECT
              id,
              date,
              start_time,
              end_time,
              branch_id
            FROM Shift
          `,
        );

        if (isActive) {
          setShifts(rows);
          setLoadError(null);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load shifts",
          );
        }
      }
    }

    void loadShifts();

    return () => {
      isActive = false;
      console.log(shifts);
    };
  }, []);

  const refreshData = async () => {
    const branchRows = await queryRows<BranchRow>(
      `
          SELECT
            Branch.id,
            Branch.name,
            COUNT(Shift.id) AS shiftCount
          FROM Branch
          LEFT JOIN Shift ON Shift.branch_id = Branch.id
          GROUP BY Branch.id, Branch.name
          ORDER BY Branch.name
        `,
    );
    setBranches(branchRows);

    const shiftRows = await queryRows<ShiftRow>(
      `
            SELECT
              id,
              date,
              start_time,
              end_time,
              branch_id
            FROM Shift
          `,
    );
    setShifts(shiftRows);
  };

  const handleOpenAddShift = (branchId: number) => {
    setSelectedBranchId(branchId);
    setSelectedWeekDay(null);
    setSaveError(null);
    setAddShiftDialogOpen(true);
  };

  const getWeekStart = (date: Dayjs | null) => {
    if (!date) {
      return null;
    }

    const monday = date.clone().startOf("week").add(1, "day");

    return date.day() === 0 ? monday.subtract(7, "day") : monday;
  };

  const getWeekDays = (date: Dayjs | null) => {
    const monday = getWeekStart(date);

    if (!monday) {
      return [];
    }

    const days = [];

    for (let i = 0; i < 7; i++) {
      days.push(monday.add(i, "day"));
    }

    return days;
  };

  const handleAddShift = async () => {
    if (!selectedBranchId || !selectedWeekDay) {
      setSaveError("Please select a day");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const shiftDateStr = selectedWeekDay.format("YYYY-MM-DD");
      const shiftStartStr = shiftStartTime?.format("HH:mm");
      const shiftEndStr = shiftEndTime?.format("HH:mm");
      await runSql(
        `
          INSERT INTO Shift (date, start_time, end_time, branch_id)
          VALUES (?, ?, ?, ?)
        `,
        [shiftDateStr, shiftStartStr, shiftEndStr, selectedBranchId],
      );

      setAddShiftDialogOpen(false);
      setSelectedWeekDay(null);

      refreshData();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to add shift",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveShift = async (rmId: number) => {
    try {
      await runSql(
        `DELETE FROM Shift 
      WHERE id = ?`,
        [rmId],
      );

      refreshData();
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to remove shift",
      );
    }
  };

  const handleCloseDialog = () => {
    setAddShiftDialogOpen(false);
    setSaveError(null);
    setSelectedWeekDay(null);
  };

  return (
    <>
      <Box sx={{ padding: 1 }}>
        <Button sx={{ mb: 1 }} href="/" startIcon={<HomeIcon />}>
          Home
        </Button>
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
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <DatePicker
                label="Select Week"
                value={weekDate}
                onChange={(newValue) => setWeekDate(newValue)}
              />
              {weekDate && getWeekStart(weekDate) && (
                <Stack direction={"column"}>
                  <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                    Week: {getWeekStart(weekDate)?.format("MMM D")} -{" "}
                    {getWeekStart(weekDate)?.add(6, "day").format("MMM D")}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                    Shifts this week: N/A
                  </Typography>
                </Stack>
              )}
            </Stack>
          </LocalizationProvider>
        </Box>

        {loadError ? (
          <Typography color="error" sx={{ mb: 2 }}>
            {loadError}
          </Typography>
        ) : null}

        <Grid container spacing={2}>
          {branches.map((branch) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={branch.id}>
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
                  <Stack direction={"column"}>
                    <Typography sx={{ fontWeight: "3em" }}>
                      {branch.name}
                    </Typography>
                    <Typography variant="body2">
                      {branch.shiftCount} scheduled shift
                      {branch.shiftCount === 1 ? "" : "s"}
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    onClick={() => handleOpenAddShift(branch.id)}
                    startIcon={<AddIcon />}
                    size="small"
                  >
                    Shift
                  </Button>
                </Stack>
                {branch.shiftCount > 0 && (
                  <Divider sx={{ mt: 1.5, mb: 0.5, color: "b" }} />
                )}
                <Box>
                  {shifts.map((shift) => (
                    <>
                      {branch.id === shift.branch_id && (
                        <>
                          <Stack
                            direction={"row"}
                            sx={{
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Stack direction={"row"} spacing={1}>
                              <Typography variant="body1">
                                {shift.id}
                              </Typography>
                              <Typography variant="body1">
                                {shift.date}
                              </Typography>
                              <Typography variant="body1">
                                {shift.start}
                              </Typography>
                              <Typography variant="body1">
                                {shift.end}
                              </Typography>
                            </Stack>
                            <Tooltip title="Remove Shift">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  handleRemoveShift(shift.id);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </>
                      )}
                    </>
                  ))}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Dialog open={addShiftDialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>
            Add Shift to{" "}
            {selectedBranchId
              ? branches.find((b) => b.id === selectedBranchId)?.name
              : ""}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ py: 1 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack direction={"column"} spacing={2}>
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Select Day of Week
                  </Typography>
                  <Stack
                    direction="row"
                    sx={{
                      flexWrap: "wrap",
                      gap: "4px",
                      alignItems: "flex-start",
                    }}
                  >
                    {getWeekDays(weekDate).map((day) => (
                      <Chip
                        key={day.format("YYYY-MM-DD")}
                        label={day.format("ddd MMM D")}
                        onClick={() => setSelectedWeekDay(day)}
                        variant={
                          selectedWeekDay?.format("YYYY-MM-DD") ===
                          day.format("YYYY-MM-DD")
                            ? "filled"
                            : "outlined"
                        }
                        color={
                          selectedWeekDay?.format("YYYY-MM-DD") ===
                          day.format("YYYY-MM-DD")
                            ? "primary"
                            : "default"
                        }
                        sx={{}}
                      />
                    ))}
                  </Stack>
                  <TimePicker
                    label="Shift Start Time"
                    value={shiftStartTime}
                    onChange={(newValue) => setShiftStartTime(newValue)}
                  />
                  <TimePicker
                    label="Shift End Time"
                    value={shiftEndTime}
                    onChange={(newValue) => setShiftEndTime(newValue)}
                  />
                  {saveError && (
                    <Typography color="error" variant="body2">
                      {saveError}
                    </Typography>
                  )}
                </Stack>
              </LocalizationProvider>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              disabled={isSaving}
              onClick={() => {
                void handleAddShift();
              }}
            >
              {isSaving ? "Saving..." : "Add Shift"}
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
