import { motion } from "framer-motion";
import { Maximize2, Minimize2, Minus, X } from "lucide-react";

function Window({
  windowItem,
  zIndex,
  onClose,
  onMinimize,
  onToggleMaximize,
  onFocus,
  children
}) {
  const { id, title, subtitle, icon: Icon, position, size, isMaximized, accent } = windowItem;

  return (
    <motion.div
      drag={!isMaximized}
      dragMomentum={false}
      dragElastic={0.08}
      onDragEnd={(_, info) => onFocus(id, info)}
      onMouseDown={() => onFocus(id)}
      initial={{ opacity: 0, scale: 0.94, y: 18 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: isMaximized ? 0 : position.x,
        y: isMaximized ? 0 : position.y,
        width: isMaximized ? "calc(100vw - 48px)" : size.width,
        height: isMaximized ? "calc(100vh - 140px)" : size.height
      }}
      exit={{ opacity: 0, scale: 0.92, y: 16 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      style={{ zIndex }}
      className="absolute left-6 top-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/10 shadow-glass backdrop-blur-lg"
    >
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${accent} opacity-60`} />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-2 text-white">
              <Icon size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">{title}</h2>
              <p className="text-xs text-slate-300">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onMinimize(id)}
              className="rounded-full bg-amber-400 p-2 text-slate-950 transition hover:scale-105"
              aria-label={`Minimize ${title}`}
            >
              <Minus size={14} />
            </button>
            <button
              type="button"
              onClick={() => onToggleMaximize(id)}
              className="rounded-full bg-emerald-400 p-2 text-slate-950 transition hover:scale-105"
              aria-label={`Maximize ${title}`}
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              type="button"
              onClick={() => onClose(id)}
              className="rounded-full bg-rose-400 p-2 text-slate-950 transition hover:scale-105"
              aria-label={`Close ${title}`}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </motion.div>
  );
}

export default Window;
