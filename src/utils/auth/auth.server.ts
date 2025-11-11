import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getBaseURL } from "../url.server";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let getAuthenticator = () => {
  return NextAuth({
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_OAUTH_SECRET_KEY || "",
        authorization: {
          params: {
            redirect_uri: getBaseURL() + "/oauth/google/callback",
          },
        },
      }),
    ],
    // Add other NextAuth options here as needed
  });
};