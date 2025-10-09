import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import { MantineProvider } from "@mantine/core";
import { theme } from "../theme/theme";
import { AuthProvider } from "../contexts/AuthContext";
import AddTagModal from "./AddTagModal";
import type { Beer } from "../types";
import { NEW_TAGS_FOR_BEER, GET_CURRENT_USER } from "../graphql/queries";

const mockBeer: Beer = {
  id: "1",
  name: "Test IPA",
  brewery: {
    id: "1",
    name: "Test Brewery",
    location: "Test City",
  },
  style: "IPA",
  styleDisplay: "India Pale Ale",
  abv: 6.5,
  ibu: 60,
  description: "A hoppy IPA",
  averageRating: "4.5",
  imageUrl: "",
  isSaved: false,
  tags: [],
  tagsWithVotes: [],
};

const currentUserMock = {
  request: {
    query: GET_CURRENT_USER,
  },
  result: {
    data: {
      currentUser: null,
    },
  },
};

describe("AddTagModal", () => {
  const mockClose = jest.fn();

  beforeEach(() => {
    mockClose.mockClear();
  });

  it("renders search input when modal is opened", async () => {
    const mocks = [
      currentUserMock,
      {
        request: {
          query: NEW_TAGS_FOR_BEER,
          variables: { beerId: "1", search: undefined },
        },
        result: {
          data: {
            newTagsForBeer: [],
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthProvider>
          <MantineProvider theme={theme}>
            <AddTagModal beer={mockBeer} opened={true} close={mockClose} />
          </MantineProvider>
        </AuthProvider>
      </MockedProvider>,
    );

    expect(
      screen.getByPlaceholderText("Search for tags..."),
    ).toBeInTheDocument();
  });

  it("enforces max length of 50 characters on search input", () => {
    const mocks = [
      currentUserMock,
      {
        request: {
          query: NEW_TAGS_FOR_BEER,
          variables: { beerId: "1", search: undefined },
        },
        result: {
          data: {
            newTagsForBeer: [],
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthProvider>
          <MantineProvider theme={theme}>
            <AddTagModal beer={mockBeer} opened={true} close={mockClose} />
          </MantineProvider>
        </AuthProvider>
      </MockedProvider>,
    );

    const searchInput = screen.getByPlaceholderText(
      "Search for tags...",
    ) as HTMLInputElement;
    expect(searchInput.maxLength).toBe(50);
  });

  it("updates search input value when user types", async () => {
    const mocks = [
      currentUserMock,
      {
        request: {
          query: NEW_TAGS_FOR_BEER,
          variables: { beerId: "1", search: undefined },
        },
        result: {
          data: {
            newTagsForBeer: [],
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthProvider>
          <MantineProvider theme={theme}>
            <AddTagModal beer={mockBeer} opened={true} close={mockClose} />
          </MantineProvider>
        </AuthProvider>
      </MockedProvider>,
    );

    const searchInput = screen.getByPlaceholderText(
      "Search for tags...",
    ) as HTMLInputElement;

    await userEvent.type(searchInput, "hoppy");

    expect(searchInput.value).toBe("hoppy");
  });

  it("displays message when no tags are available", async () => {
    const mocks = [
      currentUserMock,
      {
        request: {
          query: NEW_TAGS_FOR_BEER,
          variables: { beerId: "1", search: undefined },
        },
        result: {
          data: {
            newTagsForBeer: [],
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthProvider>
          <MantineProvider theme={theme}>
            <AddTagModal beer={mockBeer} opened={true} close={mockClose} />
          </MantineProvider>
        </AuthProvider>
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("No tags available to add."),
      ).toBeInTheDocument();
    });
  });

});
