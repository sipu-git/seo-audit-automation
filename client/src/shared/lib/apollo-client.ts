import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

export function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: "/graphql", credentials: "same-origin" }),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        notifyOnNetworkStatusChange: true,
      },
    },
  });
}
