import { motion } from "framer-motion";

function Dock({ minimizedWindows, onRestore }) {
  if (!minimizedWindows.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-slate-950/70 px-4 py-3 shadow-glass backdrop-blur-2xl"
    >
      {minimizedWindows.map((windowItem) => {
        const Icon = windowItem.icon;
        return (
          <button
            key={windowItem.id}
            type="button"
            onClick={() => onRestore(windowItem.id)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/20"
          >
            <Icon size={16} />
            <span>{windowItem.title}</span>
          </button>
        );
      })}
    </motion.div>
  );
}

export default Dock;
