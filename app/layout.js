import "./globals.css";

export const metadata = {
  title: "Map",
  description: "Demo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
