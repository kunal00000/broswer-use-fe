import { ModeToggle } from "./mode-toggle";

export default function Navbar() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center">
          <p>Navbar</p>
        </div>
        <ModeToggle />
      </div>
    </>
  );
}
