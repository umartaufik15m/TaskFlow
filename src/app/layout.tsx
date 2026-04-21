import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DEFAULT_THEME, isTheme } from "@/lib/taskflow";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taskflow",
  description: "Personal board untuk task, planning, dan deep work.",
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
    <html lang="id" data-theme={initialTheme} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
