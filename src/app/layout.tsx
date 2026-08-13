import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DEFAULT_THEME, isTheme } from "@/lib/taskflow";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Taskflow",
    template: "%s | Taskflow",
  },
  description: "Personal command center untuk task, target, catatan, dan uang.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const savedTheme = cookieStore.get("taskflow_theme")?.value;
  const initialTheme = isTheme(savedTheme) ? savedTheme : DEFAULT_THEME;

  return (
    <html
      lang="id"
      data-theme={initialTheme}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
