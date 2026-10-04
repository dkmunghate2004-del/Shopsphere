import { motion } from 'framer-motion';

const variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function Page({ children, className = '' }) {
  return (
    <motion.main variants={variants} initial="initial" animate="animate" exit="exit" className={`page ${className}`}>
      <div className="container">{children}</div>
    </motion.main>
  );
}
