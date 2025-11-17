import { gql } from "@apollo/client";
import { Beer, Tag } from "../types";

// Reusable fragments
const BREWERY_INFO_FRAGMENT = gql`
  fragment BreweryInfo on BreweryType {
    id
    name
    city
    stateProvince
    address1
    address2
    postalCode
    country
    longitude
    latitude
    phone
  }
`;

const BEER_FIELDS_FRAGMENT = gql`
  fragment BeerFields on BeerType {
    id
    name
    brewery {
      ...BreweryInfo
    }
    style
    styleDisplay
    abv
    ibu
    description
    averageRating
    imageUrl
    isSaved
    tags {
      id
      name
    }
    tagsWithVotes {
      tagId
      tagName
      upvoteCount
      downvoteCount
      currentUserVote
    }
  }
  ${BREWERY_INFO_FRAGMENT}
`;

export const FEATURED_BEERS = gql`
  query GetFeaturedBeers {
    featuredBeers {
      ...BeerFields
    }
  }
  ${BEER_FIELDS_FRAGMENT}
`;

export const SEARCH_BEERS = gql`
  query SearchBeers(
    $style: String
    $minAbv: Float
    $maxAbv: Float
    $search: String
  ) {
    allBeers(style: $style, minAbv: $minAbv, maxAbv: $maxAbv, search: $search) {
      ...BeerFields
    }
  }
  ${BEER_FIELDS_FRAGMENT}
`;

export const GET_BEER = gql`
  query GetBeer($id: ID!) {
    beerById(id: $id) {
      ...BeerFields
    }
  }
  ${BEER_FIELDS_FRAGMENT}
`;

export const GET_BREWERY_BY_ID = gql`
  query GetBreweryById($id: ID!) {
    breweryById(id: $id) {
      id
      name
      city
      stateProvince
      address1
      address2
      postalCode
      country
      longitude
      latitude
      phone
      description
      yearFounded
      website
      beerCount
      beers {
        id
        name
        style
        styleDisplay
        abv
        ibu
        averageRating
        imageUrl
      }
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      email
      firstName
      lastName
    }
  }
`;

export type SavedBeersResult = {
  savedBeers: Beer[];
};

export const SAVED_BEERS = gql`
  query GetSavedBeers {
    savedBeers {
      ...BeerFields
    }
  }
  ${BEER_FIELDS_FRAGMENT}
`;

export type NewTagsForBeerResult = {
  newTagsForBeer: Tag[];
};

export const NEW_TAGS_FOR_BEER = gql`
  query NewTagsForBeer($beerId: ID!, $search: String) {
    newTagsForBeer(beerId: $beerId, search: $search) {
      id
      name
    }
  }
`;
