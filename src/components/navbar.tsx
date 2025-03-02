import { ModeToggle } from "./mode-toggle";

export default function Navbar() {
  return (
    <div className="flex items-center justify-end mr-5 gap-3">
      <ModeToggle />
    </div>
  );
}
