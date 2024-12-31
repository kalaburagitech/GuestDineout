import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import "./App.css";

import NavBar from "./components/NavBar";
import HotelPage from "./components/HotelPage";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import BookingModel from "./components/BookingModal";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const MyComp = () => {
    const [searchedHotel, setSearchedHotel] = useState("");
    return (
      <>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <SnackbarProvider maxSnack={3}>
            <NavBar setSearchedHotel={setSearchedHotel} />
            <HotelPage searchedHotel={searchedHotel} />
          </SnackbarProvider>
        </ThemeProvider>
      </>
    );
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <BrowserRouter>
          <Routes>
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/:location" element={<MyComp />} />
            <Route path="/bookingmodel" element={<BookingModel />} />
            <Route path="*" element={<MyComp />} />
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
