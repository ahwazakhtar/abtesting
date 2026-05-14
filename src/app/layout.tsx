import type { Metadata } from "next";
import ThemeProvider from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Experimentation Playground",
  description: "Versioned, iterable AB testing plans for real-world experiments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
        <ThemeProvider>
          {user ? (
            <>
              <Sidebar user={user} />
              <div className="lg:pl-60 min-h-screen flex flex-col">
                <TopBar />
                <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
              </div>
            </>
          ) : (
            children
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
