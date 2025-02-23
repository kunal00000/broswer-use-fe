import ArtifactViewer from "@/components/artifact";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SidebarProvider>
        <ArtifactViewer />
        {children}
      </SidebarProvider>
    </>
  );
}
