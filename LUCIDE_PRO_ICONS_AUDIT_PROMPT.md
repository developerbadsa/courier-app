# 🎨 Enterprise AI Agent Prompt: Lucide React Pro Icons & UI Audit Guide

> **Official Standard for Shohnaat Logistics & Modern Web Applications**  
> **Rule:** *Zero cheap icons, zero raw unicode emojis (e.g. 🏍️, 🚐, 🚚, 📦, 📍, ⏳), and zero pixelated glyphs in tables, cards, badges, or headers. ALWAYS use crisp, tailored [Lucide React](https://lucide.dev/guide/react/) SVG components with consistent stroke weights, sizes, and harmonious color tokens.*

---

## 🤖 Copy-Paste AI Agent Master Prompt

```markdown
### 🎯 MISSION: Full-Stack Frontend UI Audit & Lucide React Icon Upgrade

You are tasked with conducting a deep, strict visual and code quality audit across all pages, components, and tables in the frontend codebase.

### 🚫 STRICT PROHIBITIONS:
1. DO NOT use raw Unicode emojis (e.g. 🏍️, 🚐, 🚚, 📦, 📍, ⏳, 👤, 🚗, 🌅, ☀️, 💵, 💳, 🏢, 🏠, 🛡️, ⚙️) anywhere in table columns, cards, badges, buttons, form inputs, or tabs.
2. DO NOT use cheap, non-standard text glyphs (e.g. `->`, `[+]`, `[x]`, `|`) when a sleek Lucide icon is available.
3. DO NOT introduce unstyled inline SVG dumps.

### ✅ MANDATORY REPLACEMENTS USING LUCIDE REACT:
Whenever an entity or domain concept is represented, map it strictly to the official Lucide React component:

| Domain / Concept | Forbidden Cheap / Emoji | Approved Lucide React Icon | Import Example |
|---|---|---|---|
| **Bike / 2-Wheeler** | 🏍️ / 🚲 | `<Bike className="w-3.5 h-3.5 text-blue-600 shrink-0" />` | `import { Bike } from 'lucide-react';` |
| **Van / Courier Van** | 🚐 | `<Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />` | `import { Truck } from 'lucide-react';` |
| **Heavy Truck / Freight** | 🚚 / 🚛 | `<Truck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />` | `import { Truck } from 'lucide-react';` |
| **Location / Hub / City** | 📍 / 🗺️ | `<MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />` | `import { MapPin } from 'lucide-react';` |
| **Calendar / Schedule Date**| 📅 / 🗓️ | `<Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />` | `import { Calendar } from 'lucide-react';` |
| **Time / Time Slot** | ⏰ / ⌛ / ⏳ | `<Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />` | `import { Clock } from 'lucide-react';` |
| **Morning / Sunrise** | 🌅 | `<Sunrise className="w-4 h-4 text-amber-500 shrink-0" />` | `import { Sunrise } from 'lucide-react';` |
| **Afternoon / Sun** | ☀️ | `<Sun className="w-4 h-4 text-amber-500 shrink-0" />` | `import { Sun } from 'lucide-react';` |
| **Parcels / Packages** | 📦 | `<Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />` | `import { Package } from 'lucide-react';` |
| **Rider / Driver / User** | 👤 / 🧑 | `<User className="w-3.5 h-3.5 text-slate-400 shrink-0" />` | `import { User } from 'lucide-react';` |
| **Active Pulse / Status** | 🟢 / 🔴 / 🟡 | `<StatusBadge status={status} size="sm" />` | `import { StatusBadge } from '@/components/ui';` |
| **Success / Verified** | ✅ / ✔️ | `<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />` | `import { CheckCircle2 } from 'lucide-react';` |
| **Failed / Rejected** | ❌ / 🚫 | `<XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />` | `import { XCircle } from 'lucide-react';` |
| **Warning / Attention** | ⚠️ | `<AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />` | `import { AlertTriangle } from 'lucide-react';` |
| **Finance / Cash / COD** | 💵 / 💰 | `<DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />` | `import { DollarSign } from 'lucide-react';` |
| **Warehouse / Hub** | 🏢 / 🏭 | `<Building2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />` | `import { Building2 } from 'lucide-react';` |
| **Search / Filter** | 🔍 | `<Search className="w-4 h-4 text-slate-400 shrink-0" />` | `import { Search } from 'lucide-react';` |

### 🛠️ EXECUTION & SAFETY CHECKLIST:
1. **Search All Files:** Run ripgrep for emoji regex (`[\u{1F300}-\u{1F6FF}]`, `[\u{2600}-\u{26FF}]`, `[\u{2700}-\u{27BF}]`).
2. **Replace with Proper Props:** Ensure every Lucide icon has appropriate Tailwind classes:
   - Size: `w-3.5 h-3.5` (compact table/badge) or `w-4 h-4` / `w-5 h-5` (cards/headers).
   - Shrink prevention: Always include `shrink-0` when rendered beside text.
   - Contrast color: Use tailored text colors (e.g. `text-blue-600`, `text-slate-400`, `text-amber-600`).
3. **Type-Check Validation:** Run `node_modules/.bin/tsc --noEmit --project tsconfig.json` to guarantee 0 compile errors.
4. **Deploy & Verify:** Push updates and verify live rendering in the browser.
```

---

## 📋 Summary of Upgrades Already Applied to Shohnaat:
1. **`dashboard/pickups/page.tsx`:**
   - Replaced `🏍️ Bike`, `🚐 Van`, `🚚 Truck` with `<Bike className="w-3.5 h-3.5 text-blue-600" />`, `<Truck className="w-3.5 h-3.5 text-amber-600" />`, and `<Truck className="w-3.5 h-3.5 text-indigo-600" />`.
   - Replaced emoji user/location icons with crisp Lucide `<User />`, `<MapPin />`, `<Calendar />`, `<Clock />`, `<Package />`.
2. **`dashboard/pickups/new/page.tsx`:**
   - Replaced `🌅 Morning` and `☀️ Afternoon` with Lucide `<Sunrise />` and `<Sun />`.
   - Replaced vehicle card emojis with Lucide SVG components in rounded preview boxes.
3. **`admin/fleet/page.tsx`:**
   - Upgraded all filter tab buttons and modal vehicle selectors to Lucide `<Bike />` and `<Truck />` icons.
