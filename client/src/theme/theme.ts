import { createTheme } from "@mantine/core";

// Custom theme configuration using Mantine's theming system
export const theme = createTheme({
  colors: {
    // Custom accent color palette - Mantine requires 10 shades
    // Based on your chosen color #9FC5E8
    accent: [
      "#f0f9ff", // lightest
      "#e0f2fe",
      "#bae6fd",
      "#7dd3fc",
      "#38bdf8",
      "#9FC5E8", // your chosen color (index 5)
      "#0ea5e9",
      "#0284c7",
      "#0369a1",
      "#0c4a6e", // darkest
    ],
  },
  // Set accent as the primary color for the app
  primaryColor: "accent",
});

export default theme;
