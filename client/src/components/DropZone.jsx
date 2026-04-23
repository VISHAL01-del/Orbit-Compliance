import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

const progressSteps = [12, 28, 43, 61, 76, 92];
const acceptedFileTypes =
  ".pdf,.doc,.docx,.xls,.xlsx,.csv,.xml,.png,.jpg,.jpeg";

function DropZone({ moduleId, auditResult, isScanning, progress, onUpload }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const forwardFiles = async (files) => {
    const [file] = Array.from(files || []);
    if (!file) {
      return;
    }

    await onUpload(moduleId, file, progressSteps);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);
    await forwardFiles(event.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex min-h-44 w-full flex-col items-center justify-center rounded-3xl border border-dashed px-6 text-center transition ${
          isDragging
            ? "border-cyan-300 bg-cyan-400/10"
            : "border-white/15 bg-black/20 hover:border-white/30 hover:bg-white/10"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedFileTypes}
          className="hidden"
          onChange={(event) => forwardFiles(event.target.files)}
        />
        <UploadCloud className="mb-3 text-cyan-300" size={30} />
        <p className="text-base font-medium text-white">
          Drop documents, spreadsheets, XML, or images into the {moduleId.toUpperCase()} portal
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Supported: PDF, DOC, DOCX, XLS, XLSX, CSV, XML, PNG, JPG, and JPEG.
        </p>
      </button>

      <AnimatePresence mode="wait">
        {isScanning ? (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-200">
              <LoaderCircle className="animate-spin" size={16} />
              AI audit simulation in progress
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                animate={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.28em] text-slate-400">
              Progress {progress}%
            </p>
          </motion.div>
        ) : auditResult ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">Latest audit report</p>
              <span className="rounded-full bg-black/20 px-3 py-1 text-xs text-emerald-200">
                Score {auditResult.auditScore}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-200">{auditResult.fileName}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-100">
              {auditResult.flags.map((flag) => (
                <li key={flag} className="rounded-xl bg-black/20 px-3 py-2">
                  {flag}
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default DropZone;
