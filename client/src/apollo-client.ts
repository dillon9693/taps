import { ApolloClient, InMemoryCache } from "@apollo/client";

// Use environment variable with fallback for local development
const GRAPHQL_ENDPOINT = process.env.REACT_APP_API_URL || "http://localhost:8000/graphql";

const client = new ApolloClient({
  uri: GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

export default client;
