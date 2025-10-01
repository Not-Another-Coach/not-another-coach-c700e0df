import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { NotAnotherCoachError } from "@/components/errors/NotAnotherCoachError";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return <NotAnotherCoachError code="404" homeHref="/" supportHref="/contact" />;
};

export default NotFound;
