import { motion } from "framer-motion";

function StatCard({ title, value, detail, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-lg ${className}`}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{title}</p>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{detail}</p>
    </motion.div>
  );
}

export default StatCard;
