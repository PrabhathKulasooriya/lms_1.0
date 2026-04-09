// src/auth.config.js
import Credentials from "next-auth/providers/credentials";

export default {
  providers: [
    Credentials({
      // Keep this empty or just defined; the logic moves to auth.js
    }),
  ],
};
