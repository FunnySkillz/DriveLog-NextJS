// app/ClientLayout.tsx
"use client";

import { Toaster } from "sonner";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Authenticated } from "convex/react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DL</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">DriveLog</h2>
            <p className="text-xs text-gray-500">
              Verwalten Sie Fahrzeuge smarter.
            </p>
          </div>
        </div>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>

      <main className="flex-1">{children}</main>
      <Toaster />
    </>
  );
}
