import ArtifactViewer from "@/components/artifact";
import Chat from "@/components/chat";

export default function Home() {
  return (
    <div className="h-screen w-full">
      <Chat />
      {/* sidebar */}
      <ArtifactViewer />
    </div>
  );
}
