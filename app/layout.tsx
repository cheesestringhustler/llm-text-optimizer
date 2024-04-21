import type { Metadata } from "next";
import { Inter } from "next/font/google";
import './global.css';
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Text Optimizer",
  description: "A simple app to optimize the text for better readability",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
