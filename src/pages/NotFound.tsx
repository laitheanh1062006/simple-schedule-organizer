
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-todoDesk-orange-accent">404</h1>
        <p className="text-xl text-todoDesk-text mb-4">Oops! Page not found</p>
        <Button asChild>
          <Link to="/">Return to Tasks</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
