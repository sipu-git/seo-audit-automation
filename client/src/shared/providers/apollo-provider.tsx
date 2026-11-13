"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useState, type ReactNode } from "react";
import { AuthStateInitializer } from "@/src/features/auth/components/auth-state-initializer";
import { createApolloClient } from "@/src/shared/lib/apollo-client";
import { store } from "@/src/shared/lib/store";
import { Provider } from "react-redux";
import { ThemeInitializer } from "@/src/features/theme/theme-initializer";

export function AppApolloProvider({ children }: { children: ReactNode }) {
  const [client] = useState(createApolloClient);

  return (
    <Provider store={store}>
      <ThemeInitializer />
      <ApolloProvider client={client}>
        <AuthStateInitializer>{children}</AuthStateInitializer>
      </ApolloProvider>
    </Provider>
  );
}
