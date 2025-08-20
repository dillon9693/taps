import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

test("renders app with navigation", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );

  // Test that the app renders with navigation links
  const homeLink = screen.getByRole("link", { name: /home/i });
  const searchLink = screen.getByRole("link", { name: /search/i });
  const appTitle = screen.getByText(/TAPS/i);

  expect(homeLink).toBeInTheDocument();
  expect(searchLink).toBeInTheDocument();
  expect(appTitle).toBeInTheDocument();
});
