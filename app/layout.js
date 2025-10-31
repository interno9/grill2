import "./globals.css";

export const metadata = {
  title: "Map",
  description: "Demo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased overflow-hidden`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
