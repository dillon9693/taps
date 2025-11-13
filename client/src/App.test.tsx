import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const renderApp = () =>
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

test("renders app with navigation", () => {
  renderApp();

  // Test that the app renders with navigation links
  const homeLink = screen.getByRole("link", { name: /home/i });
  const searchLink = screen.getByRole("link", { name: /search/i });
  const appTitle = screen.getByText(/TAPS/i);

  expect(homeLink).toBeInTheDocument();
  expect(searchLink).toBeInTheDocument();
  expect(appTitle).toBeInTheDocument();
});

describe("Mobile navigation", () => {
  test("burger menu button is present", () => {
    renderApp();

    const burgerButton = screen.getByRole("button", {
      name: /toggle navigation/i,
    });
    expect(burgerButton).toBeInTheDocument();
  });

  test("mobile menu is hidden by default", () => {
    renderApp();

    // Mobile menu should not be visible initially
    const mobileHomeLinks = screen.queryAllByRole("link", { name: /home/i });
    // Should only find one Home link (the desktop one, or the logo link)
    expect(mobileHomeLinks.length).toBeLessThanOrEqual(2);
  });

  test("clicking burger menu toggles mobile menu visibility", () => {
    renderApp();

    const burgerButton = screen.getByRole("button", {
      name: /toggle navigation/i,
    });

    // Click to open
    userEvent.click(burgerButton);

    // Mobile menu should now be visible with navigation links
    const allHomeLinks = screen.getAllByRole("link", { name: /home/i });
    expect(allHomeLinks.length).toBeGreaterThan(1);

    // Click to close
    userEvent.click(burgerButton);

    // Menu should be closed again
    const homeLinksAfterClose = screen.queryAllByRole("link", {
      name: /home/i,
    });
    expect(homeLinksAfterClose.length).toBeLessThanOrEqual(2);
  });

  test("clicking a navigation link closes the mobile menu", () => {
    renderApp();

    const burgerButton = screen.getByRole("button", {
      name: /toggle navigation/i,
    });

    // Open the menu
    userEvent.click(burgerButton);

    // Find and click a navigation link in the mobile menu
    const allSearchLinks = screen.getAllByRole("link", { name: /search/i });
    const mobileSearchLink = allSearchLinks[allSearchLinks.length - 1];
    userEvent.click(mobileSearchLink);

    // Menu should be closed
    const homeLinksAfterClick = screen.queryAllByRole("link", {
      name: /home/i,
    });
    expect(homeLinksAfterClick.length).toBeLessThanOrEqual(2);
  });
});
