import ArtifactViewer from "@/components/artifact";
import { SidebarProvider } from "@/components/ui/sidebar";
import { WebSocketProvider } from "@/lib/providers/websocker-provider";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        <WebSocketProvider>
          {children}
          <ArtifactViewer />
        </WebSocketProvider>
      </SidebarProvider>
    </>
  );
}
