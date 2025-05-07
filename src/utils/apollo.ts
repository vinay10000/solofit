// src/utils/apollo.ts
import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { nhost } from './nhost'; // Your existing Nhost client instance

// HTTP connection to the GraphQL endpoint
const httpLink = createHttpLink({
  uri: nhost.graphql.getUrl(), // Nhost GraphQL endpoint
});

// Middleware for attaching the JWT token to requests
const authLink = setContext(async (_, { headers }) => {
  // Get the authentication token from Nhost session
  const token = nhost.auth.getAccessToken();

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create the Apollo Client instance
const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink) as unknown as ApolloLink, // Type assertion might be needed depending on @apollo/client version
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network', // Good default for dynamic data
    },
    query: {
      fetchPolicy: 'network-only', // Ensures fresh data for queries by default
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  }
});

export default apolloClient;
