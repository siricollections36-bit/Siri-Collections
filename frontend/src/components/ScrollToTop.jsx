import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  // 1. Get the current URL path
  const { pathname } = useLocation();

  useEffect(() => {
    // 2. Every time the path changes (e.g., from / to /shop), 
    // immediately move the browser scroll to the very top (0,0)
    window.scrollTo(0, 0);
  }, [pathname]);

  // This component doesn't render anything, it just provides logic
  return null;
}