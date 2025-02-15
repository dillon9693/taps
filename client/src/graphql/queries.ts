import { gql } from '@apollo/client';

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
  query SearchBeers($style: String, $minAbv: Float, $maxAbv: Float, $search: String) {
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

export const ALL_BREWERIES = gql`
  query GetBreweries($location: String, $search: String) {
    allBreweries(location: $location, search: $search) {
      id
      name
      location
      description
      yearFounded
      website
      beerCount
    }
  }
`;

export const TOP_TAGS = gql`
  query GetTopTags {
    topTags {
      id
      name
      beerCount
    }
  }
`;
