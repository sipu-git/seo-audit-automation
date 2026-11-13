"use client";

import { useApolloClient, useQuery } from "@apollo/client/react";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { useEffect, type ReactNode } from "react";
import {
  CURRENT_USER_QUERY,
  type CurrentUserQueryData,
} from "@/src/features/auth/api/auth-queries";
import { clearAuth, setAuthenticated, setUser } from "@/src/features/auth/auth-slice";
import { useAppDispatch } from "@/src/shared/lib/redux-hooks";

function isUnauthenticated(error: unknown) {
  return CombinedGraphQLErrors.is(error) &&
    error.errors.some(
      (graphQLError) =>
        graphQLError.extensions?.code === "UNAUTHENTICATED",
    );
}

export function AuthStateInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const client = useApolloClient();
  const currentUserQuery = useQuery<CurrentUserQueryData>(CURRENT_USER_QUERY, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  useEffect(() => {
    if (currentUserQuery.data?.me) {
      dispatch(setAuthenticated(true));
      dispatch(setUser(currentUserQuery.data.me));
      return;
    }

    if (currentUserQuery.error) {
      if (isUnauthenticated(currentUserQuery.error)) {
        dispatch(clearAuth());
        void client.clearStore();
      } else if (!currentUserQuery.loading) {
        dispatch(clearAuth());
      }
      return;
    }

    if (!currentUserQuery.loading) dispatch(clearAuth());
  }, [
    currentUserQuery.data,
    currentUserQuery.error,
    currentUserQuery.loading,
    client,
    dispatch,
  ]);

  return <>{children}</>;
}
