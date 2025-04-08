import { ChakraProvider, CSSReset } from "@chakra-ui/react";

export const metadata = {
  title: "Login",
  description: "Authentication pages",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <CSSReset />
          <div className="auth-content">{children}</div>
        </ChakraProvider>
      </body>
    </html>
  );
}
