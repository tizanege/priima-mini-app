import { useMutation, useQueryClient } from "@tanstack/react-query";
import decodeToken from "../components/utilites";
import { queryStringify } from "./useVerification";

export const useAddUser = () => {
  const queryClient = useQueryClient();
  const { baseUrl, queryParams } = decodeToken();

  return useMutation(
    ["add-user"],
    async (variables) => {
      const response = await fetch(
        `${baseUrl}create/${queryStringify({
          ...queryParams,
          env: true,
        })}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(variables),
        }
      );
      if (!response.ok) {
        throw new Error("Error in creating User.");
      }
      return response.json();
    },
    {
      onSuccess: async (data) => {
        localStorage.setItem(
          "password",
          JSON.stringify(data.user_details.password)
        );
        await queryClient.invalidateQueries(["verification-url", baseUrl]);
      },
      onError: () => {
        throw new Error("Error in creating User");
      },
    }
  );
};
