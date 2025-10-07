import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { MockedProvider } from "@apollo/client/testing";
import App from "./App";
import { theme } from "./theme/theme";
import { AuthProvider } from "./contexts/AuthContext";
import { GET_CURRENT_USER } from "./graphql/queries";

const mocks = [
  {
    request: {
      query: GET_CURRENT_USER,
    },
    result: {
      data: {
        currentUser: null,
      },
    },
  },
];

test("renders app with navigation", () => {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AuthProvider>
        <MantineProvider theme={theme}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MantineProvider>
      </AuthProvider>
    </MockedProvider>,
  );

  // Test that the app renders with navigation links
  const homeLink = screen.getByRole("link", { name: /home/i });
  const searchLink = screen.getByRole("link", { name: /search/i });
  const appTitle = screen.getByText(/TAPS/i);

  expect(homeLink).toBeInTheDocument();
  expect(searchLink).toBeInTheDocument();
  expect(appTitle).toBeInTheDocument();
});
