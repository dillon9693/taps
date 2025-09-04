import { gql } from "@apollo/client";

export const FEATURED_BEERS = gql`
  query GetFeaturedBeers {
    featuredBeers {
      id
      name
      brewery {
        name
        location
      }
      style
      styleDisplay
      abv
      ibu
      description
      averageRating
      imageUrl
      tags {
        name
      }
    }
  }
`;

export const SEARCH_BEERS = gql`
  query SearchBeers(
    $style: String
    $minAbv: Float
    $maxAbv: Float
    $search: String
  ) {
    allBeers(style: $style, minAbv: $minAbv, maxAbv: $maxAbv, search: $search) {
      id
      name
      brewery {
        name
        location
      }
      style
      styleDisplay
      abv
      ibu
      description
      averageRating
      imageUrl
      tags {
        name
      }
    }
  }
`;

export const GET_BEER = gql`
  query GetBeer($id: ID!) {
    beerById(id: $id) {
      id
      name
      brewery {
        name
        location
      }
      style
      styleDisplay
      abv
      ibu
      description
      averageRating
      imageUrl
      tags {
        name
      }
    }
  }
`;
