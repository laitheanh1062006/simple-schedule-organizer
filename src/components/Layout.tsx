
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-todoDesk-white flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
