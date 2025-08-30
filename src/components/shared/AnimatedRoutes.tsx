import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode } from "react";

type AnimatedRoutesProps = {
  children: ReactNode;
  y?: number;
  opacity?: number;
  duration?: number;
};

export default function AnimatedRoutes({
  children,
  y = 20,
  opacity = 0.01,
  duration = 0.6,
}: AnimatedRoutesProps) {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ y, opacity }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
