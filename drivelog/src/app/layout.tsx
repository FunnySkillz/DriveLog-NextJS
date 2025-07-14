import { Metadata } from "next";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClientLayout } from "./ClientLayout";

export const metadata: Metadata = {
  title: "DriveLog",
  description: "Verwalten Sie Fahrzeuge smarter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <ConvexClientProvider>
          <ClientLayout>{children}</ClientLayout>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
