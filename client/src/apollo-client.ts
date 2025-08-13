import { ApolloClient, InMemoryCache } from '@apollo/client';

// TODO generalize this for different environments
const GRAPHQL_ENDPOINT = 'http://localhost:8000/graphql';

const client = new ApolloClient({
  uri: GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default client;
