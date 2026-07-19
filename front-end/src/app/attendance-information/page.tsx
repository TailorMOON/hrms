"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Attendance } from "../types/Attendance";
import { getAttendanceByDate } from "../services/attendanceService";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Typography,
  CircularProgress,
  Box,
  TextField,
  Button,
} from "@mui/material";
import { getEmployeeById } from "../services/employeeService";

const generateDateRange = (start: string, end: string) => {
  const dates = [];
  let currentDate = new Date(start);
  const endDate = new Date(end);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA');
};

const getDayName = (dateString: string) => {
  const date = new Date(dateString);
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return daysOfWeek[date.getDay()];
};

const getTotalDays = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
};

const AttendanceInformation: React.FC = () => {
  const searchParams = useSearchParams();
  const idStr = searchParams.get("id");
  const id = Number(idStr);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  const [nip, setNip] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      const localUserIdStr = localStorage.getItem('id');
      const localUserId = Number(localUserIdStr);
      if (!token) {
        console.log("Unauthorized access, redirecting to login...");
        router.push('/');
      } else if (!isAdmin && localUserId !== id) {
        router.push(`/attendance-information?id=${localUserIdStr}`);
      }
    }
  }, [router]);

  useEffect(() => {
    const fetchNip = async () => {
      try {
        console.log("ID:",id);
        if (id) {
          const employeeData = await getEmployeeById(id);
          if (employeeData && employeeData.ptid) {
            setNip(employeeData.ptid);
            console.log(employeeData.ptid);
          } else {
            setError("Failed to fetch NIP for the given employee ID.");
          }
        }
      } catch (err) {
        setError("Error fetching employee data.");
      }
    };

    fetchNip();
  }, [id]);

  const fetchAttendances = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      const localUserIdStr = localStorage.getItem('id');
      const localUserId = Number(localUserIdStr);
      console.log(isAdmin)

      if (!token) {
        router.push('/unauthorized');
        return;
      }

      if (nip && startDate && endDate) {
        if (!isAdmin && localUserId !== id) {
          setError("Unauthorized access to other user's attendance data.");
          setLoading(false);
          return;
        }

        const offset = page * rowsPerPage;
        const totalDays = getTotalDays(startDate, endDate);
        const remainingRows = totalDays - offset;
        const currentPageRows = Math.min(rowsPerPage, remainingRows);

        const currentPageStartDate = new Date(startDate);
        currentPageStartDate.setDate(currentPageStartDate.getDate() + offset);
        const currentPageEndDate = new Date(currentPageStartDate);
        currentPageEndDate.setDate(currentPageEndDate.getDate() + currentPageRows - 1);

        if (currentPageStartDate > new Date(endDate)) {
          setLoading(false);
          return;
        }

        const allDates = generateDateRange(
          currentPageStartDate.toLocaleDateString('en-CA'),
          currentPageEndDate.toLocaleDateString('en-CA')
        );

        let attendanceData: Attendance[] = [];
        console.log("NIP:", nip);
        const response: Attendance[] | null = await getAttendanceByDate(
          String(nip),
          currentPageStartDate.toLocaleDateString('en-CA'),
          currentPageEndDate.toLocaleDateString('en-CA'),
          currentPageRows,
          0
        );
        attendanceData = response ?? [];

        if (attendanceData.length === 0) {
          const emptyData = allDates.map((date) => ({
            id: date.getTime(),
            employee_id: nip,
            date: date.toLocaleDateString('en-CA'),
            check_in_time: "-",
            check_out_time: "-",
            is_late: false,
          }));
          setAttendances(emptyData);
        } else {
          const fullData = allDates.map((date) => {
            const attendance = attendanceData.find((att) =>
              new Date(att.date).toLocaleDateString('en-CA') === date.toLocaleDateString('en-CA')
            );

            return attendance || {
              id: date.getTime(),
              employee_id: nip,
              date: date.toLocaleDateString('en-CA'),
              check_in_time: "-",
              check_out_time: "-",
              is_late: false,
            };
          });
          setAttendances(fullData);
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 404) {
          setAttendances([]);
        } else {
          setError(`Failed to load attendance data: ${error.response?.statusText}`);
        }
      } else if (error instanceof Error) {
        setError(`An unexpected error occurred: ${error.message}`);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showResults && nip) {
      fetchAttendances();
    }
  }, [page, rowsPerPage, nip]);

  const handleSearch = () => {
    if (startDate && endDate) {
      setPage(0);
      setShowResults(true);
      fetchAttendances();
    } else {
      setError("Please fill both start and end dates.");
      setStartDate("");
      setEndDate("");
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const totalDays = getTotalDays(startDate, endDate);

  return (
    <Box sx={{ maxWidth: "1000px", margin: "0 auto", minHeight: '625px', paddingTop: '40px' }}>
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
          <TextField
            label="Start Date"
            type="date"
            variant="outlined"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              marginBottom: '5px',
              "& label.Mui-focused": { color: "#DB4437" },
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": { borderColor: "#DB4437" }
              }
            }}
          />
          <TextField
            label="End Date"
            type="date"
            variant="outlined"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              marginBottom: '5px',
              "& label.Mui-focused": { color: "#DB4437" },
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": { borderColor: "#DB4437" }
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              backgroundColor: '#DB4437',
              height: '40px',
              width: '120px',
              padding: '10px 20px',
              marginTop: '6px',
              fontSize: '16px',
              '&:hover': { backgroundColor: '#c63e30' }
            }}
          >
            Search
          </Button>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            showResults && (
              <TableContainer component={Paper} sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                <Table stickyHeader aria-label="attendance table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left" sx={{ backgroundColor: '#f0f0f0' }}>Day</TableCell>
                      <TableCell align="left" sx={{ backgroundColor: '#f0f0f0' }}>Date</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: '#f0f0f0' }}>Check-In Time</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: '#f0f0f0' }}>Check-Out Time</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: '#f0f0f0' }}>Late</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendances.map((attendance) => (
                      <TableRow key={attendance.id}>
                        <TableCell align="left">{getDayName(attendance.date)}</TableCell>
                        <TableCell align="left">{formatDate(attendance.date)}</TableCell>
                        <TableCell align="center">{attendance.check_in_time}</TableCell>
                        <TableCell align="center">{attendance.check_out_time}</TableCell>
                        <TableCell align="center">{attendance.is_late ? "Yes" : "No"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  sx={{ backgroundColor: '#f0f0f0' }}
                  rowsPerPageOptions={[10, 25, 50]}
                  component="div"
                  count={totalDays}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            )
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AttendanceInformation;
