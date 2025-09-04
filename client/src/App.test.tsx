import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import App from "./App";
import { theme } from "./theme/theme";

test("renders app with navigation", () => {
  render(
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>,
  );

  // Test that the app renders with navigation links
  const homeLink = screen.getByRole("link", { name: /home/i });
  const searchLink = screen.getByRole("link", { name: /search/i });
  const appTitle = screen.getByText(/TAPS/i);

  expect(homeLink).toBeInTheDocument();
  expect(searchLink).toBeInTheDocument();
  expect(appTitle).toBeInTheDocument();
});
