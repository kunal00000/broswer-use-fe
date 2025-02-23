import { ModeToggle } from "./mode-toggle";
import { SidebarTrigger } from "./ui/sidebar";

export default function Navbar() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center">
          <p></p>
        </div>
        <div className="flex items-center justify-center gap-x-4">
          <ModeToggle />
          <SidebarTrigger />
        </div>
      </div>
    </>
  );
}
