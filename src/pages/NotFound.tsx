import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="text-center max-w-md w-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 md:p-12 shadow-2xl">
        <h1 className="mb-2 text-6xl font-display font-bold text-[var(--primary)] tracking-tight">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="mb-8 text-sm text-gray-400">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="inline-block bg-[var(--primary)] text-white px-8 py-3 font-bold text-sm hover:bg-red-700 transition-colors rounded">
          Return to Home
        </Link>
      </div>
    </motion.div>
  );
};

export default NotFound;
