
import { NavLink } from "react-router-dom";
import { CheckSquare, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-todoDesk-text">TodoDesk</h1>
        <nav className="flex gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-todoDesk-orange-soft text-todoDesk-text"
                  : "text-todoDesk-text hover:bg-gray-100"
              )
            }
          >
            <CheckSquare size={20} />
            <span>Tasks</span>
          </NavLink>
          
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-todoDesk-text hover:bg-gray-100"
              )
            }
          >
            <Calendar size={20} />
            <span>Calendar</span>
          </NavLink>
          
          <NavLink
            to="/documents"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-todoDesk-text hover:bg-gray-100"
              )
            }
          >
            <FileText size={20} />
            <span>Documents</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
