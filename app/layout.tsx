import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

<link
  href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
