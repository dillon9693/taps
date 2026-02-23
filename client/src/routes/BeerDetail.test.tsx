import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { MockedProvider, type MockedResponse } from "@apollo/client/testing";
import { AuthProvider } from "../contexts/AuthContext";
import BeerDetail from "./BeerDetail";
import { GET_BEER, GET_CURRENT_USER } from "../graphql/queries";
import { theme } from "../theme/theme";

const mockBrewery = {
  __typename: "BreweryType",
  id: "brewery-1",
  name: "Test Brewery",
  location: "Test City",
  city: "Test City",
  stateProvince: null,
  address1: null,
  address2: null,
  postalCode: null,
  country: null,
  longitude: null,
  latitude: null,
  phone: null,
};

const mockBeer = {
  __typename: "BeerType",
  id: "1",
  name: "Test IPA",
  brewery: mockBrewery,
  style: "IPA",
  styleDisplay: "India Pale Ale",
  abv: 6.5,
  ibu: 60,
  description: "A hoppy IPA",
  averageRating: 4.5,
  imageUrl: "",
  isSaved: false,
  tags: [],
  tagsWithVotes: [],
};

// Factory to avoid sharing object references across tests, which causes MockedProvider
// to exhaust the mock after first use
const makeGetBeerMock = () => ({
  request: { query: GET_BEER, variables: { id: "1" } },
  result: { data: { beerById: mockBeer } },
});

const unauthenticatedMock = {
  request: { query: GET_CURRENT_USER },
  result: { data: { currentUser: null } },
};

const authenticatedMock = {
  request: { query: GET_CURRENT_USER },
  result: {
    data: {
      currentUser: {
        __typename: "UserType",
        id: "user-1",
        email: "test@test.com",
        firstName: "Test",
        lastName: "User",
      },
    },
  },
};

const renderBeerDetail = (mocks: MockedResponse[]) =>
  render(
    <MockedProvider mocks={mocks} addTypename>
      <AuthProvider>
        <MantineProvider theme={theme}>
          <MemoryRouter initialEntries={["/beer/1"]}>
            <Routes>
              <Route path="beer/:id" element={<BeerDetail />} />
            </Routes>
          </MemoryRouter>
        </MantineProvider>
      </AuthProvider>
    </MockedProvider>,
  );

describe("BeerDetail save button", () => {
  it("is disabled when user is not authenticated", async () => {
    renderBeerDetail([unauthenticatedMock, makeGetBeerMock()]);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /save this beer/i }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /save this beer/i }),
    ).toBeDisabled();
  });

  it("shows a tooltip prompting sign-in when hovered while unauthenticated", async () => {
    renderBeerDetail([unauthenticatedMock, makeGetBeerMock()]);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /save this beer/i }),
      ).toBeInTheDocument();
    });

    const saveButton = screen.getByRole("button", { name: /save this beer/i });
    fireEvent.mouseEnter(saveButton);

    // Mantine Tooltip renders via a portal with role="tooltip"
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toHaveTextContent(
        "Sign in to save beers",
      );
    });
  });

  it("is enabled when user is authenticated", async () => {
    renderBeerDetail([authenticatedMock, makeGetBeerMock()]);

    // Wait for both GET_CURRENT_USER and GET_BEER to resolve, then confirm
    // the save button is enabled (isAuthenticated = true)
    await waitFor(
      () => {
        expect(
          screen.getByRole("button", { name: /save this beer/i }),
        ).not.toBeDisabled();
      },
      { timeout: 5000 },
    );
  });
});
