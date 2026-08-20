# 🎨 Shohnaat Logistics — Enterprise Reusable Architecture & Component Dictionary

> **Comprehensive Developer Reference Guide**  
> **Golden Rule:** *Before writing any new UI element, hook, API caller, or backend utility, ALWAYS check this document first to reuse established components and maintain 100% design and architectural consistency.*

---

## 📑 Quick Navigation
1. [🎨 1. Frontend UI Components](#1-frontend-ui-components)
2. [🪝 2. Frontend Custom React Hooks](#2-frontend-custom-react-hooks)
3. [🌐 3. Frontend API & PDF Utilities](#3-frontend-api--pdf-utilities)
4. [⚙️ 4. Backend Services & Reusable Engines](#4-backend-services--reusable-engines)
5. [📐 5. Layout & Spacing Design Standards](#5-layout--spacing-design-standards)

---

## 🎨 1. Frontend UI Components

All components live in `@/components/ui` or `@/components/layout` and are barrel-exported from `@/components/ui`.

| Component Name | Import Location | Primary Purpose | Key Props & Signature |
|---|---|---|---|
| **`DashboardLayout`** | `@/components/layout` | Standard dashboard shell with persistent sidebar, top navigation, search, and role-based guards. | `role: 'merchant' \| 'admin'`, `title`, `subtitle`, `action?: ReactNode` |
| **`ExpandableCard`** | `@/components/ui` | Sleek minimal card with title, badge, action slots, and animated accordion detail expansion. | `title`, `subtitle`, `icon`, `highlight`, `highlightSubtext`, `headerActions`, `badge`, `children` |
| **`Card`** | `@/components/ui` | Standard container with clean white background, border, subtle shadow, and hover transitions. | `children`, `className` |
| **`StatCard`** | `@/components/ui` | Executive metric & KPI card with icon, numeric value, positive/negative change, and subtext. | `title`, `value`, `icon`, `iconColor`, `iconBg`, `change?: { value, isPositive }`, `subtext` |
| **`Button`** | `@/components/ui` | Accessible button with loading spinner (`isLoading`), left/right icon slots, and multiple variants. | `variant: 'primary' \| 'outline' \| 'danger' \| 'ghost'`, `size: 'sm' \| 'md' \| 'lg'`, `isLoading`, `leftIcon`, `rightIcon` |
| **`DataTable`** | `@/components/ui` | Full-featured responsive table with column sorting, live search filtering, pagination, and header slot. | `data`, `columns: Column<T>[]`, `searchable`, `searchPlaceholder`, `pageSize`, `headerRight` |
| **`Badge`** | `@/components/ui` | Compact tag for roles, counts, or categories with curated theme styles. | `variant: 'blue' \| 'green' \| 'amber' \| 'red' \| 'purple' \| 'default'`, `size: 'sm' \| 'md'`, `dot?: boolean` |
| **`StatusBadge`** | `@/components/ui` | Specialized shipment lifecycle badge with dynamic color dots for all courier statuses (`PENDING`, `DELIVERED`, etc.). | `status: ShipmentStatus`, `size?: 'sm' \| 'md'` |
| **`Modal`** | `@/components/ui` | Accessible dialog popup with backdrop blur, title header, scrollable body, and action footer. | `isOpen`, `onClose`, `title`, `size: 'sm' \| 'md' \| 'lg' \| 'xl'`, `footer` |
| **`Input`** | `@/components/ui` | Form text input with label, prefix icon slot, helper message, and error styling. | `label`, `error`, `leftIcon`, `helperText`, `...inputProps` |
| **`Select`** | `@/components/ui` | Custom dropdown selector with label, option list, and error feedback. | `label`, `options: { value, label }[]`, `error`, `value`, `onChange` |
| **`Checkbox`** | `@/components/ui` | Custom checkbox component with label and descriptive caption. | `label`, `description`, `checked`, `onChange` |
| **`Textarea`** | `@/components/ui` | Multi-line text field with label and character count/error helper. | `label`, `error`, `rows`, `...textareaProps` |
| **`Tabs`** | `@/components/ui` | Horizontal tab switcher with optional numeric badge counters. | `tabs: { key, label, count? }[]`, `activeTab`, `onChange` |
| **`Avatar`** | `@/components/ui` | User or company avatar with automatic name initials and dynamic color gradients. | `name`, `size: 'sm' \| 'md' \| 'lg'`, `imageSrc` |
| **`EmptyState`** | `@/components/ui` | Friendly placeholder illustrated with icon and action button when data lists are empty. | `title`, `description`, `icon`, `action` |
| **`Toast`** | `@/components/ui` | Global floating toast container rendering active notifications. | Rendered in Root Layout via `<ToastContainer />` |

---

## 🪝 2. Frontend Custom React Hooks

Located in `@/lib/hooks.ts`:

```typescript
import { useDebounce, useLocalStorage, useMediaQuery, usePagination, useToggle } from '@/lib/hooks';

// 1. Debounce live search inputs (e.g. 400ms delay)
const debouncedSearch = useDebounce(searchTerm, 400);

// 2. Persistent LocalStorage state with SSR safety
const [theme, setTheme] = useLocalStorage('app_theme', 'dark');

// 3. Responsive breakpoint detector
const isMobile = useMediaQuery('(max-width: 768px)');

// 4. Client-side pagination controller
const { currentPage, totalPages, nextPage, prevPage, setPage } = usePagination({ totalItems: 100, pageSize: 10 });

// 5. Safe boolean toggle helper
const [isOpen, toggleOpen, setIsOpen] = useToggle(false);
```

---

## 🌐 3. Frontend API & PDF Utilities

Located in `@/lib/api.ts` and `@/lib/invoicePdf.ts`:

### Typed API Client (`api.ts`)
```typescript
import { api, apiGet, apiPost, apiPatch, apiDelete, showToast } from '@/lib/api';

// 1. Standard GET with auto token injection
const res = await apiGet<Shipment[]>('/api/v1/shipments');

// 2. Standard POST with error normalization
const createRes = await apiPost('/api/v1/shipments', parcelData);

// 3. Global Toast Alerts
showToast('success', 'Parcel created successfully!');
showToast('error', 'Unable to connect to server.');
showToast('warning', 'Session expiring in 2 minutes.');
```

### PDF & Receipt Generator (`invoicePdf.ts`)
```typescript
import { downloadInvoicePDF } from '@/lib/invoicePdf';

// Generates an official, print-ready PDF invoice with itemized tax breakdowns
downloadInvoicePDF({
  invoiceNumber: 'INV-2026-001',
  invoiceDate: 'August 20, 2026',
  dueDate: 'September 5, 2026',
  from: { name: 'Shohnaat Logistics', address: 'Headquarters Hub, USA', email: 'billing@shohnaat.com', phone: '+1-800-555-0199' },
  to: { name: 'Acme Merchant LLC', address: '100 Logistics Blvd, Austin, TX' },
  items: [
    { description: 'Shipment Delivery — 12 parcels', quantity: 12, unitPrice: 8.50 },
    { description: 'COD Processing Fee', quantity: 12, unitPrice: 1.50 }
  ],
  taxRate: 8,
  currency: 'USD',
  notes: 'Payment due within 15 days.'
});
```

---

## ⚙️ 4. Backend Services & Reusable Engines

All backend core engines are structured as modular domain services in `shohnaat-backend/src/`:

| Service / Engine | File Path | Capability & Methods |
|---|---|---|
| **`LedgerService`** | `services/ledgerService.js` | Double-entry append-only financial ledger. Methods: `recordEntry()`, `recordCODCollection()`, `getMerchantBalance()`, `getEntries()`, `exportEntriesCSV()`, `generateSettlement()`. |
| **`PaymentService`** | `services/paymentService.js` | Stripe PaymentIntent creation, PayPal Checkout capture, Sandbox top-ups, and webhook processors. |
| **`NotificationService`** | `services/notificationService.js` | BullMQ Redis background worker, transactional HTML email templates, SMS OTP dispatches, and merchant HMAC webhooks. |
| **`CacheService`** | `lib/cache.js` | Sub-millisecond Redis caching with graceful DB fallback. Methods: `get()`, `set()`, `del()`, `delByPattern()`, `cacheMiddleware(prefix, ttl)`. |
| **`BackupService`** | `services/backupService.js` | Automated Gzip `.sql.gz` PostgreSQL dumps, `triggerEmergencyBackup()` on fatal errors, local auto-pruning, and Google Drive `rclone` hook. |
| **`ProLogger`** | `lib/logger.js` | Multi-category telemetry. Methods: `logger.info()`, `logger.warn()`, `logger.error()`, `logger.fatal()`, `logger.security()`, `logger.audit()`, `logger.performance()`, and `req.log`. |
| **`Security Middlewares`** | `middleware/security.js` | `helmetMiddleware`, `rateLimiter` (100 req/min), `inputSanitizer`, `sqlInjectionGuard`, `corsOptions`, `requestId`. |
| **`Centralized Error Handler`** | `middleware/errorHandler.js` | Automatic Prisma error classification (`P2002`, `P2025`, `P2003`, `P2024`), JWT errors, and standardized JSON error contracts with `requestId` and `timestamp`. |

---

## 📐 5. Layout & Spacing Design Standards

| Element | Standard Class | Purpose |
|---|---|---|
| **Section Spacing** | `my-8` | Generous vertical breathing room between page blocks (KPI grids, cards, tables). |
| **Card Padding** | `p-5` to `p-6` | Comfortable internal content padding. |
| **Grid Spacing** | `gap-6` | Clean spacing between metric cards or dashboard tiles. |
| **Border Radius** | `rounded-lg` (Cards, Tables) / `rounded-md` (Buttons, Inputs) | Modern, sleek design aesthetic. |
| **Typography** | `text-slate-900` (Headings) / `text-slate-500` (Labels/Meta) | High-contrast, legible typography hierarchy. |

---
*Maintained as the Single Source of Truth for Shohnaat Logistics Developers.*
