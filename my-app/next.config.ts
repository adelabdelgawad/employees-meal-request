import type { NextConfig } from "next";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const nextConfig: NextConfig = {
  env: {
    VERSIONS: process.env.VERSION || "",
  },
};

export default nextConfig;
