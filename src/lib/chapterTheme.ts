import {
  Recycle,
  Leaf,
  Trash2,
  Package,
  Lightbulb,
  Globe,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Factory,
  Droplet,
  TreePine,
  Sprout,
  Building2,
  Users,
  BookOpen,
  GraduationCap,
  Target,
  Zap,
  Flame,
  Wind,
  Boxes,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

export interface ChapterTheme {
  icon: LucideIcon;
  gradient: string; // tailwind classes
  iconBg: string;
  accent: string; // hex-like or class for accent
  emoji: string;
}

interface ThemeRule {
  match: RegExp;
  theme: ChapterTheme;
}

const RULES: ThemeRule[] = [
  {
    match: /(welcome|overview|introduction|intro|begin|start)/i,
    theme: {
      icon: Sparkles,
      gradient: "from-violet-500/15 via-fuchsia-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
      accent: "text-violet-600 dark:text-violet-400",
      emoji: "👋",
    },
  },
  {
    match: /(recycle|recycling|blue box|material recovery)/i,
    theme: {
      icon: Recycle,
      gradient: "from-emerald-500/15 via-teal-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
      accent: "text-emerald-600 dark:text-emerald-400",
      emoji: "♻️",
    },
  },
  {
    match: /(compost|organic|food waste|green bin)/i,
    theme: {
      icon: Sprout,
      gradient: "from-lime-500/15 via-green-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-lime-500 to-green-600",
      accent: "text-green-600 dark:text-green-400",
      emoji: "🌱",
    },
  },
  {
    match: /(landfill|garbage|trash|waste|dump)/i,
    theme: {
      icon: Trash2,
      gradient: "from-stone-500/15 via-slate-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-stone-600 to-slate-700",
      accent: "text-stone-700 dark:text-stone-300",
      emoji: "🗑️",
    },
  },
  {
    match: /(packaging|plastic|container|bottle)/i,
    theme: {
      icon: Package,
      gradient: "from-sky-500/15 via-blue-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-sky-500 to-blue-600",
      accent: "text-sky-600 dark:text-sky-400",
      emoji: "📦",
    },
  },
  {
    match: /(hazard|danger|battery|chemical|toxic|electronic)/i,
    theme: {
      icon: AlertTriangle,
      gradient: "from-amber-500/15 via-orange-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      accent: "text-amber-600 dark:text-amber-400",
      emoji: "⚠️",
    },
  },
  {
    match: /(rule|regulation|law|policy|act|legal|compliance)/i,
    theme: {
      icon: ScrollText,
      gradient: "from-indigo-500/15 via-blue-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600",
      accent: "text-indigo-600 dark:text-indigo-400",
      emoji: "📜",
    },
  },
  {
    match: /(community|household|resident|family|people|public)/i,
    theme: {
      icon: Users,
      gradient: "from-rose-500/15 via-pink-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
      accent: "text-rose-600 dark:text-rose-400",
      emoji: "🏘️",
    },
  },
  {
    match: /(industry|industrial|business|company|producer|manufactur)/i,
    theme: {
      icon: Factory,
      gradient: "from-zinc-500/15 via-slate-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-zinc-600 to-slate-700",
      accent: "text-zinc-700 dark:text-zinc-300",
      emoji: "🏭",
    },
  },
  {
    match: /(transport|truck|collect|pickup|haul)/i,
    theme: {
      icon: Truck,
      gradient: "from-cyan-500/15 via-sky-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-cyan-500 to-sky-600",
      accent: "text-cyan-600 dark:text-cyan-400",
      emoji: "🚛",
    },
  },
  {
    match: /(water|liquid|drain|sewer|ocean|lake)/i,
    theme: {
      icon: Droplet,
      gradient: "from-blue-500/15 via-cyan-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
      accent: "text-blue-600 dark:text-blue-400",
      emoji: "💧",
    },
  },
  {
    match: /(forest|tree|nature|wildlife|ecosystem)/i,
    theme: {
      icon: TreePine,
      gradient: "from-green-600/15 via-emerald-600/10 to-transparent",
      iconBg: "bg-gradient-to-br from-green-700 to-emerald-700",
      accent: "text-green-700 dark:text-green-400",
      emoji: "🌲",
    },
  },
  {
    match: /(energy|power|electric|fuel)/i,
    theme: {
      icon: Zap,
      gradient: "from-yellow-500/15 via-amber-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-yellow-500 to-amber-500",
      accent: "text-yellow-600 dark:text-yellow-400",
      emoji: "⚡",
    },
  },
  {
    match: /(climate|emission|carbon|greenhouse|global warming)/i,
    theme: {
      icon: Globe,
      gradient: "from-teal-500/15 via-emerald-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-teal-500 to-emerald-500",
      accent: "text-teal-600 dark:text-teal-400",
      emoji: "🌍",
    },
  },
  {
    match: /(tip|practice|how to|guide|step)/i,
    theme: {
      icon: Lightbulb,
      gradient: "from-amber-500/15 via-yellow-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-amber-400 to-yellow-500",
      accent: "text-amber-600 dark:text-amber-400",
      emoji: "💡",
    },
  },
  {
    match: /(goal|target|objective|outcome)/i,
    theme: {
      icon: Target,
      gradient: "from-red-500/15 via-rose-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
      accent: "text-red-600 dark:text-red-400",
      emoji: "🎯",
    },
  },
  {
    match: /(quiz|test|assessment|review|check)/i,
    theme: {
      icon: GraduationCap,
      gradient: "from-purple-500/15 via-violet-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-purple-500 to-violet-600",
      accent: "text-purple-600 dark:text-purple-400",
      emoji: "🎓",
    },
  },
  {
    match: /(summary|conclusion|wrap|recap|finish|complete)/i,
    theme: {
      icon: CheckCircle2,
      gradient: "from-emerald-500/15 via-green-500/10 to-transparent",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
      accent: "text-emerald-600 dark:text-emerald-400",
      emoji: "✅",
    },
  },
];

const FALLBACK_THEMES: ChapterTheme[] = [
  {
    icon: Leaf,
    gradient: "from-emerald-500/15 via-green-500/10 to-transparent",
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
    accent: "text-emerald-600 dark:text-emerald-400",
    emoji: "🍃",
  },
  {
    icon: BookOpen,
    gradient: "from-blue-500/15 via-indigo-500/10 to-transparent",
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    accent: "text-blue-600 dark:text-blue-400",
    emoji: "📖",
  },
  {
    icon: Boxes,
    gradient: "from-orange-500/15 via-amber-500/10 to-transparent",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
    accent: "text-orange-600 dark:text-orange-400",
    emoji: "📦",
  },
  {
    icon: Wind,
    gradient: "from-cyan-500/15 via-teal-500/10 to-transparent",
    iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600",
    accent: "text-cyan-600 dark:text-cyan-400",
    emoji: "💨",
  },
  {
    icon: Flame,
    gradient: "from-rose-500/15 via-pink-500/10 to-transparent",
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
    accent: "text-rose-600 dark:text-rose-400",
    emoji: "🔥",
  },
  {
    icon: Building2,
    gradient: "from-slate-500/15 via-gray-500/10 to-transparent",
    iconBg: "bg-gradient-to-br from-slate-500 to-gray-600",
    accent: "text-slate-600 dark:text-slate-400",
    emoji: "🏢",
  },
];

export function getChapterTheme(title: string, index: number): ChapterTheme {
  for (const rule of RULES) {
    if (rule.match.test(title)) return rule.theme;
  }
  return FALLBACK_THEMES[index % FALLBACK_THEMES.length];
}
