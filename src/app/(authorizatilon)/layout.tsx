

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
        <div className="auth-content">{children}</div>
      </body>
    </html>
  );
}
