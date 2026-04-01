import { Link } from "react-router-dom";
import Button from "./Button";

export default function PublicNavbar() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white">
      <h3>IAT459</h3>
      <div className="flex items-center gap-3">
        <Link to="/marketplace">
          <Button body="Marketplace" size="sm" style="secondary" />
        </Link>
        <Link to="/register">
          <Button body="Sign Up" size="sm" style="secondary" />
        </Link>
      </div>
    </nav>
  );
}
