import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

const quickFilter = [
  `3 Star`,
  `Buffet`,
  `Chinese`,
  `Dineout Pay`,
  `Happy Hours`,
  `Italian`,
  `North Indian`,
  `Pure Veg`,
];

const cuisinesFilter = [
  `American`,
  `Bengali`,
  `Cantonese`,
  `European`,
  `Greek`,
  `Beverages`,
  `Chettinad`,
  `Gujarati`,
  `Japanese`,
  `Malaysian`,
  `Moroccan`,
  `Arabian`,
];

const tagsFilter = [
  `1 plus 1 on Food and Drinks`,
  `Barbeque Nation Super Savers`,
  `Best Buffet`,
  `5 Star`,
  `Bars`,
  `Best Buffets`,
  `Best Burgers`,
  `Bakery`,
];

export default function Filter({ handleFilterChange }) {
  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          Quick Filter
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {quickFilter.map((element) => {
              return (
                <FormControlLabel
                  key={element}
                  value={element}
                  onChange={handleFilterChange}
                  control={<Checkbox />}
                  label={element}
                />
              );
            })}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          Cuisines
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {cuisinesFilter.map((element) => {
              return (
                <FormControlLabel
                  key={element}
                  value={element}
                  onChange={handleFilterChange}
                  control={<Checkbox />}
                  label={element}
                />
              );
            })}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          Tags
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {tagsFilter.map((element) => {
              return (
                <FormControlLabel
                  key={element}
                  value={element}
                  onChange={handleFilterChange}
                  control={<Checkbox />}
                  label={element}
                />
              );
            })}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
