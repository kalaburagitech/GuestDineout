import { Card, CardContent, Grid2, Typography, CardMedia } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import BookingModal from "./BookingModal";
import { useState, useEffect } from "react";

export default function HotelCards({ selectedTags, sort, searchedHotel }) {
  const username = localStorage.getItem("authToken");
  const [modalState, setModalState] = useState(null); // Hold clicked hotel data
  const [restaurentInfo, setRestaurentInfo] = useState([]); // Fetched hotel data
  const [filteredHotels, setFilteredHotels] = useState([]); // Filtered and sorted data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error handling
  const navigate = useNavigate();
  const { location } = useParams();

  // Fetch hotel data from the API
  useEffect(() => {
    const fetchHotelData = async () => {
      setLoading(true);
      setError(null);

      try {
        const cityName = location ? location.toLowerCase() : "delhi";
        const response = await fetch(`https://guestdineout-backend.onrender.com/api/restaurants/${cityName}`);

        if (!response.ok) {
          throw new Error("Failed to fetch hotel data");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setRestaurentInfo(data); // Store original data
          setFilteredHotels(data); // Initialize filtered data
        } else {
          setRestaurentInfo([]);
          setFilteredHotels([]);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [location]);

  // Apply filters (search and tags)
  useEffect(() => {
    let updatedHotels = [...restaurentInfo];

    // Apply search filter
    if (searchedHotel) {
      updatedHotels = updatedHotels.filter((hotel) =>
        hotel.name.toLowerCase().includes(searchedHotel.toLowerCase())
      );
    }

    // Apply tags filter
    if (selectedTags?.length) {
      updatedHotels = updatedHotels.filter((hotel) =>
        hotel.tags.some((tag) => selectedTags.includes(tag))
      );
    }

    // Apply sorting
    if (sort === "Rating") {
      updatedHotels.sort((a, b) => b.ratings - a.ratings);
    } else if (sort === "Price High To Low") {
      updatedHotels.sort((a, b) => b.price - a.price);
    } else if (sort === "Price Low To High") {
      updatedHotels.sort((a, b) => a.price - b.price);
    }

    setFilteredHotels(updatedHotels);
  }, [searchedHotel, selectedTags, sort, restaurentInfo]);

  const handleBookingModelOpen = (eachHotel) => {
    if (username) {
      setModalState({ ...eachHotel, location: location.toLowerCase() });
    } else {
      alert("Please log in first.");
      navigate("/signin");
    }
  };

  // Loading and error handling UI
  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  if (error) {
    return <Typography variant="h6" color="error">{error}</Typography>;
  }

  return (
    <>
      <Grid2 container gap={1}>
        {filteredHotels.map((eachHotel) => {
          const { id, name, location, priceDetail, ratings, tags, image } = eachHotel;

          return (
            <Grid2 key={id} onClick={() => handleBookingModelOpen(eachHotel)} style={{ cursor: "pointer" }}>
              <Card sx={{ maxWidth: 345 }}>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      backgroundColor: "rgba(192, 226, 21, 0.93)",
                      width: 50,
                      height: 25,
                      borderRadius: 20,
                      textAlign: "center",
                      right: 10,
                      top: 10,
                      color: "white",
                    }}
                  >
                    {ratings}
                  </div>
                  <CardMedia sx={{ height: 250 }} image={image} title={name} />
                </div>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {location}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {priceDetail}, {tags.join(", ")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
          );
        })}
      </Grid2>

      <BookingModal
        modalState={modalState}
        handleClose={() => setModalState(null)}
      />
    </>
  );
}
