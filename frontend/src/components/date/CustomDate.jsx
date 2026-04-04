// CustomDay.jsx

import { styled } from "@mui/material/styles"
import { PickersDay } from "@mui/x-date-pickers/PickersDay"

// Styled PickersDay component to apply custom colors
const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) => prop !== "isSelected" && prop !== "isHovered",
})(({ theme, isSelected, isHovered, day }) => ({
  borderRadius: theme.shape.borderRadius || "0.5rem",
  transition: "background-color 150ms ease-out",
  ...(isSelected && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover, &:focus": {
      backgroundColor: theme.palette.primary.dark,
    },
    "&:focus-visible": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: "2px",
    },
  }),
  ...(!isSelected &&
    isHovered && {
      backgroundColor: theme.palette.primary.light,
      "&:hover, &:focus": {
        backgroundColor: theme.palette.primary.light,
      },
      ...theme.applyStyles("dark", {
        backgroundColor: theme.palette.primary.dark,
        "&:hover, &:focus": {
          backgroundColor: theme.palette.primary.dark,
        },
      }),
    }),
  ...(!isSelected &&
    !isHovered && {
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
      "&:focus-visible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: "2px",
      },
    }),
  // Apply rounded corners for start/end of the week for visual consistency
  ...(day.day() === 0 && {
    borderTopLeftRadius: "50%",
    borderBottomLeftRadius: "50%",
  }),
  ...(day.day() === 6 && {
    borderTopRightRadius: "50%",
    borderBottomRightRadius: "50%",
  }),
}))

// Helper function to check if two Dayjs objects represent the same day
const isSameDay = (dayA, dayB) => {
  if (dayB == null) {
    return false
  }
  return dayA.isSame(dayB, "day")
}

// Wrapper Day component to pass custom props to CustomPickersDay
function Day(props) {
  const { day, selectedDay, hoveredDay, ...other } = props

  return (
    <CustomPickersDay
      {...other}
      day={day}
      sx={{ px: 2.5 }}
      disableMargin
      selected={false} // We manage selection visually with isSelected
      isSelected={isSameDay(day, selectedDay)}
      isHovered={isSameDay(day, hoveredDay)}
    />
  )
}

// Export the Day component as the default export
export default Day
