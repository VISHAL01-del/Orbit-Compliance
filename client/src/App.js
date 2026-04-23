import { AnimatePresence, motion } from "framer-motion";
import { Activity, FolderSearch, ShieldAlert } from "lucide-react";
import { useState } from "react";
import Dock from "./components/Dock";
import DropZone from "./components/DropZone";
import StatCard from "./components/StatCard";
import Window from "./components/Window";
import { complianceModules } from "./data/modules";

const initialWindows = complianceModules.map((module, index) => ({
  ...module,
  isOpen: true,
  isMinimized: false,
  isMaximized: false,
  position: { x: 80 + index * 54, y: 120 + index * 22 },
  size: { width: 460, height: 540 },
  zIndex: 10 + index
}));

const initialAuditState = complianceModules.reduce((accumulator, module) => {
  accumulator[module.id] = {
    result: null,
    isScanning: false,
    progress: 0
  };
  return accumulator;
}, {});

function App() {
  const [windows, setWindows] = useState(initialWindows);
  const [auditState, setAuditState] = useState(initialAuditState);

  const focusWindow = (id, dragInfo) => {
    setWindows((currentWindows) => {
      const nextZIndex = currentWindows.reduce(
        (max, windowItem) => Math.max(max, windowItem.zIndex),
        10
      ) + 1;

      return currentWindows.map((windowItem) => {
        if (windowItem.id !== id) {
          return windowItem;
        }

        const nextPosition = dragInfo
          ? {
              x: Math.max(20, windowItem.position.x + dragInfo.offset.x),
              y: Math.max(20, windowItem.position.y + dragInfo.offset.y)
            }
          : windowItem.position;

        return {
          ...windowItem,
          position: nextPosition,
          zIndex: nextZIndex
        };
      });
    });
  };

  const closeWindow = (id) => {
    setWindows((currentWindows) =>
      currentWindows.map((windowItem) =>
        windowItem.id === id ? { ...windowItem, isOpen: false, isMinimized: false } : windowItem
      )
    );
  };

  const minimizeWindow = (id) => {
    setWindows((currentWindows) =>
      currentWindows.map((windowItem) =>
        windowItem.id === id ? { ...windowItem, isMinimized: true } : windowItem
      )
    );
  };

  const restoreWindow = (id) => {
    setWindows((currentWindows) => {
      const nextZIndex = currentWindows.reduce(
        (max, windowItem) => Math.max(max, windowItem.zIndex),
        10
      ) + 1;

      return currentWindows.map((windowItem) =>
        windowItem.id === id
          ? { ...windowItem, isOpen: true, isMinimized: false, zIndex: nextZIndex }
          : windowItem
      );
    });
  };

  const toggleMaximize = (id) => {
    setWindows((currentWindows) => {
      const nextZIndex = currentWindows.reduce(
        (max, windowItem) => Math.max(max, windowItem.zIndex),
        10
      ) + 1;

      return currentWindows.map((windowItem) =>
        windowItem.id === id
          ? {
              ...windowItem,
              isMaximized: !windowItem.isMaximized,
              isMinimized: false,
              isOpen: true,
              zIndex: nextZIndex
            }
          : windowItem
      );
    });
  };

  const launchWindow = (id) => {
    const selectedWindow = windows.find((windowItem) => windowItem.id === id);

    if (!selectedWindow) {
      return;
    }

    if (!selectedWindow.isOpen || selectedWindow.isMinimized) {
      restoreWindow(id);
      return;
    }

    focusWindow(id);
  };

  const runAudit = async (moduleId, file, progressSteps) => {
    setAuditState((current) => ({
      ...current,
      [moduleId]: {
        ...current[moduleId],
        isScanning: true,
        progress: 6
      }
    }));

    progressSteps.forEach((step, index) => {
      window.setTimeout(() => {
        setAuditState((current) => ({
          ...current,
          [moduleId]: {
            ...current[moduleId],
            progress: step
          }
        }));
      }, 220 * (index + 1));
    });

    const formData = new FormData();
    formData.append("regulation", moduleId);
    formData.append("file", file);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Audit request failed.");
      }

      setAuditState((current) => ({
        ...current,
        [moduleId]: {
          result: data.report,
          isScanning: false,
          progress: 100
        }
      }));
    } catch (error) {
      setAuditState((current) => ({
        ...current,
        [moduleId]: {
          result: {
            fileName: file.name,
            auditScore: "Error",
            flags: [error.message || "Unable to reach the audit API. Check the Express server."]
          },
          isScanning: false,
          progress: 0
        }
      }));
    }
  };

  const visibleWindows = windows.filter((windowItem) => windowItem.isOpen && !windowItem.isMinimized);
  const minimizedWindows = windows.filter((windowItem) => windowItem.isMinimized);

  return (
    <main className="relative min-h-screen overflow-hidden bg-desktop-grid px-6 py-6 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:70px_70px] opacity-20" />

      <section className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Orbit Compliance</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">AI Audit Desktop</h1>
          </div>
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-lg"
          >
            <span className="text-sm text-slate-200">Live posture synced across GDPR, HIPAA, and SOC 2</span>
          </motion.div>
        </div>

        <div className="grid auto-rows-[minmax(140px,1fr)] grid-cols-12 gap-4">
          <StatCard
            title="Overall Risk Score"
            value="72 / 100"
            detail="6 policy gaps detected during the latest simulation."
            className="col-span-12 md:col-span-4"
          />
          <StatCard
            title="Recent Scans"
            value="18"
            detail="4 new audit uploads processed in the last 24 hours."
            className="col-span-12 md:col-span-4"
          />
          <StatCard
            title="Active Regulations"
            value="3"
            detail="Desktop windows open for privacy, health, and security workflows."
            className="col-span-12 md:col-span-4"
          />

          <div className="col-span-12 grid gap-4 lg:col-span-8 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-lg"
            >
              <div className="mb-4 flex items-center gap-3">
                <ShieldAlert className="text-cyan-300" size={20} />
                <h2 className="text-lg font-semibold text-white">Recent Findings</h2>
              </div>
              <div className="space-y-3 text-sm text-slate-200">
                <div className="rounded-2xl bg-black/20 p-3">GDPR document missing DPA language.</div>
                <div className="rounded-2xl bg-black/20 p-3">HIPAA upload lacks access logging evidence.</div>
                <div className="rounded-2xl bg-black/20 p-3">SOC 2 control set has no restoration test note.</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-lg"
            >
              <div className="mb-4 flex items-center gap-3">
                <FolderSearch className="text-cyan-300" size={20} />
                <h2 className="text-lg font-semibold text-white">Window Launchpad</h2>
              </div>
              <div className="space-y-3">
                {windows.map((module) => (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => launchWindow(module.id)}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left transition hover:bg-white/10"
                  >
                    <div>
                      <span className="block text-sm font-medium text-white">{module.title}</span>
                      <span className="mt-1 block text-xs text-slate-400">
                        {module.isMinimized
                          ? "Restore from dock"
                          : module.isOpen
                            ? "Bring window to front"
                            : "Reopen module"}
                      </span>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                      {module.isMinimized ? "Docked" : module.isOpen ? "Active" : "Closed"}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="col-span-12 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-lg lg:col-span-4"
          >
            <div className="mb-4 flex items-center gap-3">
              <Activity className="text-cyan-300" size={20} />
              <h2 className="text-lg font-semibold text-white">Scanning Activity</h2>
            </div>
            <div className="space-y-4">
              {complianceModules.map((module) => {
                const state = auditState[module.id];
                return (
                  <div key={module.id}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>{module.title}</span>
                      <span className="text-slate-400">
                        {state.isScanning ? `${state.progress}%` : state.result ? "Completed" : "Idle"}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-black/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                        style={{ width: `${state.progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {visibleWindows.map((windowItem) => (
          <Window
            key={windowItem.id}
            windowItem={windowItem}
            zIndex={windowItem.zIndex}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
            onToggleMaximize={toggleMaximize}
            onFocus={focusWindow}
          >
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Module Brief</p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Upload source policies, vendor agreements, or evidence files to simulate an AI-driven
                  compliance review for {windowItem.title}.
                </p>
              </div>

              <DropZone
                moduleId={windowItem.id}
                auditResult={auditState[windowItem.id].result}
                isScanning={auditState[windowItem.id].isScanning}
                progress={auditState[windowItem.id].progress}
                onUpload={runAudit}
              />
            </div>
          </Window>
        ))}
      </AnimatePresence>

      <Dock minimizedWindows={minimizedWindows} onRestore={restoreWindow} />
    </main>
  );
}

export default App;
