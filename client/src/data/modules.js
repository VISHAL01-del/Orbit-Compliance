import { FileCheck2, HeartPulse, ShieldCheck } from "lucide-react";

export const complianceModules = [
  {
    id: "gdpr",
    title: "GDPR",
    subtitle: "Privacy and data residency",
    icon: ShieldCheck,
    accent: "from-cyan-400/60 to-sky-500/40",
    flags: [
      "Missing Data Encryption Clause",
      "Retention schedule not defined",
      "No DPA reference found"
    ]
  },
  {
    id: "hipaa",
    title: "HIPAA",
    subtitle: "Protected health information",
    icon: HeartPulse,
    accent: "from-emerald-400/60 to-teal-500/40",
    flags: [
      "Business Associate Agreement missing",
      "PHI access logging not documented",
      "Incident response workflow incomplete"
    ]
  },
  {
    id: "soc2",
    title: "SOC 2",
    subtitle: "Security and control posture",
    icon: FileCheck2,
    accent: "from-violet-400/60 to-fuchsia-500/40",
    flags: [
      "Vendor risk review absent",
      "Logical access review not evidenced",
      "No backup restoration test record"
    ]
  }
];
