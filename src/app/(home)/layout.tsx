import ArtifactViewer from "@/components/artifact";
import Navbar from "@/components/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SidebarProvider>
        <ArtifactViewer />
        <main className="flex justify-center w-full">
          <div className="p-4 w-full">
            <Navbar />
            {children}
          </div>
        </main>
      </SidebarProvider>
    </>
  );
}
