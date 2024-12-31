import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Grid,
  Slider,
  Chip,
  Button,
  IconButton,
  TextField,
  Rating,
} from "@mui/material";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import axios from "axios";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";
import { LocationOn, Phone, Email, Restaurant, LocalOffer, Star, AttachMoney, Group, Close, Reviews } from "@mui/icons-material";


export default function BookingModal({ handleClose, modalState }) {
  const { id, location } = modalState || {};
  const { enqueueSnackbar } = useSnackbar();
  const username = localStorage.getItem("authToken");
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const { name, email, _id: userId } = userInfo;
  const [bookingState, setBookingState] = useState({
    selectedTime: "",
    selectedDate: "",
    selectedSeats: 1,
  });

  const [hotelDetails, setHotelDetails] = useState(null);
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // New state for review and rating
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reply, setReply] = useState("");

  // console.log(reviews);

  useEffect(() => {
    if (id && location) {
      setBookingState({
        selectedTime: "",
        selectedDate: "",
        selectedSeats: 1,
      });
      getHotelDetails(location, id);
    }
  }, [id, location]);

  const getHotelDetails = async (city, hotelId) => {
    try {
      const response = await axios.get(`https://guestdineout-backend.onrender.com/api/restaurants/${city}/${hotelId}`);
      const data = response.data;

      if (data) {
        setHotelDetails(data);
        getReviews(hotelId);  // Fetch reviews when hotel details are loaded
      } else {
        enqueueSnackbar("Hotel not found!", { variant: "error" });
      }
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      enqueueSnackbar("Error fetching hotel details!", { variant: "error" });
    }
  };

  const getReviews = async (hotelId) => {
    try {
      const response = await axios.get(`https://guestdineout-backend.onrender.com/api/get-reviews/${hotelId}`);
      
      if (response.data && Array.isArray(response.data)) {
        setReviews(response.data); // Set the reviews if found
      } else {
        setReviews([]); // Clear reviews if no reviews are found
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]); // Handle error by clearing reviews
    }
  };
  
  

  const handleSliderChange = (event, newValue) => {
    setBookingState({
      ...bookingState,
      selectedSeats: newValue,
    });
  };

  const handleChipClick = (eachTime) => {
    setBookingState({
      ...bookingState,
      selectedTime: eachTime,
    });
  };

  const handleDateChange = (event) => {
    const selectedDate = event ? event.format("DD-MM-YYYY") : "";
    setBookingState({
      ...bookingState,
      selectedDate,
    });
    if (selectedDate) {
      getBookingSlots(selectedDate);
    }
  };

  const handleBooking = async () => {
    setIsLoading(true);

    const { selectedDate, selectedTime, selectedSeats } = bookingState;

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const { _id: userId, name: userName, email: userEmail } = userInfo;

    if (userId && userName && userEmail && id && selectedDate && selectedTime && selectedSeats) {
      try {
        const response = await axios.post(
          "https://guestdineout-backend.onrender.com/api/create-booking",
          {
            userId,
            userName,
            userEmail,
            hotelId: id,
            selectedDate,
            selectedTime,
            selectedSeats,
            status: "pending",
          }
        );

        if (response.status === 201) {
          setBookingState({
            selectedTime: "",
            selectedDate: "",
            selectedSeats: 1,
          });
          handleClose();
          enqueueSnackbar("Booking Created successfully!", { variant: "success" });
        }
      } catch (error) {
        console.error("Error creating booking:", error);
        enqueueSnackbar("Error creating booking!", { variant: "error" });
      } finally {
        setIsLoading(false);
      }
    } else {
      enqueueSnackbar("Please fill all the details!", { variant: "warning" });
      setIsLoading(false);
    }
  };

  const getBookingSlots = async (selectedDate) => {
    try {
      const response = await axios.get(
        `https://fsd6061we-t-node.onrender.com/getBookingSlots/${id}/${selectedDate}`
      );
      if (response?.data?.length) {
        const selectedTimes = response?.data.map((ele) => ele.selectedTime);
        setBookedTimeSlots(selectedTimes);
      }
    } catch (error) {
      console.error("Error fetching booking slots:", error);
    }
  };

  const handleReviewSubmit = async () => {
    if (rating === 0 || review.trim() === "") {
      enqueueSnackbar("Please provide both a rating and a review!", { variant: "warning" });
      return;
    }

    try {
      const response = await axios.post(
        "https://guestdineout-backend.onrender.com/api/submit-review",
        {
          hotelId: id,
          userId,
          name,
          rating,
          review,
        }
      );

      if (response.status === 201) {
        enqueueSnackbar("Review submitted successfully!", { variant: "success" });
        setRating(0);
        setReview("");
        useEffect(() => {
          getReviews(hotelId);
        }, [hotelId]); // Refresh reviews after submitting one
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      // enqueueSnackbar("Error submitting review!", { variant: "error" });
    }
  };


  const handleAdminReply = async (reviewId) => {
    if (!reply.trim()) {
      enqueueSnackbar("Please enter a reply!", { variant: "warning" });
      return;
    }

    try {
      const response = await axios.post(
        "https://guestdineout-backend.onrender.com/api/admin/reply",
        {
          reviewId,
          adminReply: reply,
        }
      );

      if (response.status === 200) {
        enqueueSnackbar("Reply submitted successfully!", { variant: "success" });
        setReply("");  // Clear reply input after submitting
        useEffect(() => {
          getReviews(hotelId);
        }, [hotelId]);  // Refresh reviews after reply
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      enqueueSnackbar("Error submitting reply!", { variant: "error" });
    }
  };

  return (
    <Modal open={Boolean(modalState)} onClose={handleClose}>
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">User Details:</Typography>
          <Typography variant="body1">
            <strong>Name:</strong> {name}
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {email}
          </Typography>
          <Typography variant="body1">
            <strong>User ID:</strong> {userId}
          </Typography>
          <Typography variant="body1">
            <strong>Hotel ID:</strong> {id}
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {/* Left side - Hotel Details */}
          <Grid item xs={12} md={6}>
            {hotelDetails && (
              <Box>
                {/* Hotel Image */}
                <img
                  src={hotelDetails.image}
                  alt={hotelDetails.name}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />

                {/* Hotel Name */}
                <Typography variant="h4" sx={{ mt: 2, mb: 1, fontWeight: "bold" }}>
                  {hotelDetails.name}
                </Typography>

                {/* Hotel Location */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <LocationOn color="primary" />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {hotelDetails.location}
                  </Typography>
                </Box>

                {/* Hotel Discount */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <LocalOffer color="primary" />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {hotelDetails.discount}
                  </Typography>
                </Box>
                {/* Hotel Menu */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Restaurant color="primary" />
                    <Typography variant="body1" sx={{ ml: 1, fontWeight: "bold", fontFamily: "'Poppins', sans-serif", fontSize: "1.2rem" }}>
                      Menu:
                    </Typography>
                  </Box>
                  <Box sx={{ pl: 3 }}>
                    {hotelDetails.menuItems.map((item, index) => (
                      <Typography
                        key={index}
                        variant="body2"
                        sx={{
                          mb: 1,
                          fontFamily: "'Poppins', sans-serif", // You can use any font family here
                          fontWeight: 500,
                          fontSize: "1rem",
                          color: index % 2 === 0 ? "#FF6347" : "#4CAF50", // Alternate color for each item
                          letterSpacing: "0.5px",
                          transition: "color 0.3s ease, transform 0.2s ease",
                          "&:hover": {
                            color: "#FFA500", // Hover color
                            transform: "scale(1.05)", // Slight scale effect on hover
                          },
                        }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>


                {/* Hotel Phone */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Phone color="primary" />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {hotelDetails.contact.phone}
                  </Typography>
                </Box>

                {/* Hotel Email */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Email color="primary" />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {hotelDetails.contact.email}
                  </Typography>
                </Box>

                {/* Hotel Price */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <AttachMoney color="primary" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    ₹{hotelDetails.price}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({hotelDetails.priceDetail})
                  </Typography>
                </Box>

                {/* Hotel Ratings */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Star color="primary" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {hotelDetails.ratings}
                  </Typography>
                </Box>

                {/* Hotel Tags */}
                <Box>
                  {hotelDetails.tags.map((tag, index) => (
                    <Chip key={index} label={tag} sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
              </Box>
            )}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Reviews
              </Typography>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <Box key={review.hotelId} sx={{ mt: 2, border: "1px solid #ddd", padding: "16px", borderRadius: "8px" }}>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      {/* Username in large letters and uppercase */}
                      <Typography variant="h6" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                        {review.userName}
                      </Typography>

                      {/* Rating Display */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Rating value={review.rating} readOnly />
                      </Box>

                      {/* Review text */}
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {review.review}
                      </Typography>

                      {/* Date */}
                      <Typography variant="caption" sx={{ mt: 1, display: "block", color: "gray" }}>
                        {new Date(review.createdAt).toLocaleString()}
                      </Typography>

                      {/* Admin Reply Section */}
                      {review.adminReply && (
                        <Box sx={{ mt: 2, borderTop: "1px solid #ddd", pt: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            Admin Reply
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: "italic", color: "gray" }}>
                            {review.adminReply}
                          </Typography>
                        </Box>
                      )}

                      {/* Admin Reply Input (Only visible to admin) */}
                      {email === "admin@gmail.com" && !review.adminReply && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            Admin Reply
                          </Typography>
                          <TextField
                            label="Write your reply"
                            multiline
                            rows={3}
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            fullWidth
                          />
                          <LoadingButton
                            variant="contained"
                            color="primary"
                            onClick={() => handleAdminReply(review._id)}
                            sx={{ mt: 2 }}
                          >
                            Reply
                          </LoadingButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No reviews yet.</Typography>
              )}
            </Box>


          </Grid>

          {/* Right side - Booking Form + Review Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Make a Reservation
            </Typography>
            <Box sx={{ mb: 3 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    label="Select Date"
                    onChange={handleDateChange}
                    sx={{ width: "100%" }}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Select Time
              </Typography>
              <Grid container spacing={1}>
                {timeSlots.map((eachTime) => (
                  <Grid item key={eachTime}>
                    <Chip
                      color={bookingState.selectedTime === eachTime ? "primary" : "default"}
                      onClick={() => handleChipClick(eachTime)}
                      label={eachTime}
                      clickable
                      disabled={bookedTimeSlots.includes(eachTime)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Select Seats
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Group color="primary" />
                <Slider
                  value={bookingState.selectedSeats}
                  onChange={handleSliderChange}
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={1}
                  max={20}
                  sx={{ ml: 2, flex: 1 }}
                />
              </Box>
            </Box>

            <LoadingButton
              loading={isLoading}
              variant="contained"
              color="primary"
              onClick={handleBooking}
              fullWidth
              size="large"
            >
              Make a Booking
            </LoadingButton>

            {/* Add Star Rating and Review Inputs */}
            <Box sx={{ mb: 3, mt: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontSize: "1.5rem",
                  mb: 2,
                }}
                gutterBottom
              >
                Rate and Review
              </Typography>

              <Rating
                name="rating"
                value={rating}
                onChange={(event, newValue) => setRating(newValue)}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Write a Review"
                multiline
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                fullWidth
                variant="outlined"
              />
            </Box>

            <LoadingButton
              loading={isLoading}
              variant="contained"
              color="primary"
              onClick={handleReviewSubmit}
              fullWidth
              size="large"
            >
              Submit Review
            </LoadingButton>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "1000px",
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

const timeSlots = [
  "10 AM - 11 AM",
  "11 AM - 12 PM",
  "12 PM - 1 PM",
  "1 PM - 2 PM",
  "7 PM - 8 PM",
  "8 PM - 9 PM",
  "9 PM - 10 PM",
];

