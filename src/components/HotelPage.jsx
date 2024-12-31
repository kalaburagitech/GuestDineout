import { useState, useEffect } from "react";
import { Grid2 } from "@mui/material";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import Filter from "./Filter";
import HotelCards from "./HotelCards";
import { useParams, useNavigate } from "react-router-dom";

const sortByData = [
  { value: "Rating", name: "Rating" },
  { value: "Price High To Low", name: "Price High To Low" },
  { value: "Price Low To High", name: "Price Low To High" },
];

export default function HotelPage({ searchedHotel }) {
  const [sort, setSort] = useState("Rating");
  const [selectedTags, setSelectedTags] = useState([]);
  const [restaurant, setRestaurant] = useState([]); // Filtered data
  const [allRestaurants, setAllRestaurants] = useState([]); // Original data
  const { location } = useParams(); // Extract location from URL
  const navigate = useNavigate(); // Navigate to handle default location

  // Set default location if location is undefined
  useEffect(() => {
    if (!location) {
      navigate("/Delhi"); // Redirect to Delhi if no location is specified
    }
  }, [location, navigate]);

  // Fetch the restaurant data from the API based on the location
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!location) return;

      try {
        const response = await fetch(`https://guestdineout-backend.onrender.com/api/restaurants/${location}`);
        const data = await response.json();
        setAllRestaurants(data); // Store original data
        setRestaurant(data); // Initialize filtered data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchRestaurants();
  }, [location]);

  // Handle filter changes
  const handleFilterChange = (event) => {
    const value = event.target.value;

    let updatedTags = [];
    if (selectedTags.includes(value)) {
      updatedTags = selectedTags.filter((tag) => tag !== value);
    } else {
      updatedTags = [...selectedTags, value];
    }
    setSelectedTags(updatedTags);

    if (updatedTags.length === 0) {
      setRestaurant(allRestaurants); // Reset to original data if no filters
    } else {
      const filteredData = allRestaurants.filter((item) =>
        updatedTags.some((tag) => item.tags.includes(tag))
      );
      setRestaurant(filteredData);
    }
  };

  return (
    <Grid2 container display={"flex"} flexDirection={"row"} gap={2} width={"100%"} marginTop={1}>
      <Grid2 width={"20%"}>
        <Filter handleFilterChange={handleFilterChange} />
      </Grid2>
      <Grid2 container direction={"column"} spacing={2} width={"75%"}>
        <Grid2 container>
          <Grid2>
            <Breadcrumbs separator="›" aria-label="breadcrumb">
              <Link underline="hover" color="inherit">
                {location}
              </Link>
              <Typography sx={{ color: "text.primary" }}>
                {location} Location
              </Typography>
            </Breadcrumbs>
          </Grid2>
        </Grid2>

        <Grid2 container justifyContent={"space-between"} alignItems={"center"}>
          <Grid2>Best Restaurants Near Me in {location}(8483)</Grid2>

          <Grid2 container justifyContent={"center"} alignItems={"center"} flexDirection={"row"} width={"50%"}>
            <Grid2>Sort by</Grid2>

            <Grid2 width={"30%"}>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={sort}
                  label="Sort"
                  onChange={(event) => {
                    setSort(event.target.value);
                  }}
                >
                  {sortByData.map((element) => {
                    return (
                      <MenuItem key={element.value} value={element.value}>
                        {element.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>
        </Grid2>

        <Grid2 container>
          <HotelCards
            selectedTags={selectedTags}
            sort={sort}
            hotelData={restaurant}
            searchedHotel={searchedHotel}
          ></HotelCards>
        </Grid2>
      </Grid2>
    </Grid2>
  );
}
