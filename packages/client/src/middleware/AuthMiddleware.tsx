import { useCookies } from "react-cookie";
import FullScreenLoader from "../components/FullScreenLoader";
import React from "react";
import { IUser } from "../libs/types";
import { useQueryClient } from "@tanstack/react-query";
import useStore from "../store";
import { trpc } from "../utils/trpc";

type AuthMiddlewareProps = {
  children: React.ReactElement;
};

const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const [cookies] = useCookies(["logged_in"]);
  const store = useStore();

  const queryClient = useQueryClient();
  const { refetch } = trpc.refreshToken.useQuery(undefined, {
    retry: 1,
    enabled: false,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries([["getMe"]]);
    },
    onError: (err: any) => {
      document.location.href = "/login";
    },
  });

  const query = trpc.getMe.useQuery(undefined, {
    enabled: !!cookies.logged_in,
    retry: 1,
    select: (data: any) => data.data.user,
    onSuccess: (data: any) => {
      store.setAuthUser(data as unknown as IUser);
    },
    onError: (error: any) => {
      let retryRequest = true;
      if (error.message.includes("must be logged in") && retryRequest) {
        retryRequest = false;
        try {
          refetch({ throwOnError: true });
        } catch (err: any) {
          if (err.message.includes("Could not refresh access token")) {
            document.location.href = "/login";
          }
        }
      }
    },
  });

  if (query.isLoading && cookies.logged_in) {
    return <FullScreenLoader />;
  }

  return children;
};

export default AuthMiddleware;