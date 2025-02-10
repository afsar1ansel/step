import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true, // Enables React Strict Mode
  swcMinify: true, // Uses the SWC compiler for minification
  // images: {
  //   domains: ["example.com"], 
  // },
  i18n: {
    locales: ["en", "fr"], // Supported locales
    defaultLocale: "en", // Default language
  },
};

export default nextConfig;
