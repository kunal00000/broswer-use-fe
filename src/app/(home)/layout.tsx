import ArtifactViewer from "@/components/artifact";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        {children}
        <ArtifactViewer />
      </SidebarProvider>
    </>
  );
}
