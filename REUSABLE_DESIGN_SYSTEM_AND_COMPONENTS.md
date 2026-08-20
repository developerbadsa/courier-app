# 🎨 Shohnaat Logistics — Reusable Design System & UI Component Master Guide

> **Official Developer Reference Guide**  
> **Rule:** *Before creating any new UI component or page section, ALWAYS check this document first to reuse established components and maintain 100% design consistency.*

---

## 📦 1. Component Quick Reference Matrix

| Component Name | Import Location | Primary Use Case | Key Props |
|---|---|---|---|
| **`DashboardLayout`** | `@/components/layout` | Unified page shell with persistent sidebar, header & user profile | `role: 'merchant' \| 'admin'`, `title`, `subtitle`, `action` |
| **`Card`** | `@/components/ui` | Standard container with sleek borders, subtle shadow & padding | `children`, `className` |
| **`StatCard`** | `@/components/ui` | Metric / KPI display with icon, value, change indicator & subtext | `title`, `value`, `icon`, `iconColor`, `iconBg`, `change`, `subtext` |
| **`Button`** | `@/components/ui` | Accessible button with loading spinner, variants & icon slots | `variant`, `size`, `isLoading`, `leftIcon`, `rightIcon`, `disabled` |
| **`DataTable`** | `@/components/ui` | Paginated, searchable, sortable table with header badge & search bar | `data`, `columns`, `searchable`, `searchPlaceholder`, `pageSize` |
| **`Badge`** | `@/components/ui` | Status or numeric tag with curated theme colors | `variant: 'blue' \| 'green' \| 'amber' \| 'red' \| 'default'`, `size`, `dot` |
| **`StatusBadge`** | `@/components/ui` | Auto-formatted badge for courier parcel lifecycles (`PENDING`, `DELIVERED`, etc.) | `status: ShipmentStatus`, `size: 'sm' \| 'md'` |
| **`Modal`** | `@/components/ui` | Dialog overlay with backdrop blur, header, body & footer actions | `isOpen`, `onClose`, `title`, `size: 'sm' \| 'md' \| 'lg'`, `footer` |
| **`Input`** | `@/components/ui` | Form text input with label, prefix icon, helper text & error state | `label`, `error`, `leftIcon`, `helperText`, `...inputProps` |
| **`Select`** | `@/components/ui` | Dropdown select with label, options array & error styling | `label`, `options`, `error`, `value`, `onChange` |
| **`Checkbox`** | `@/components/ui` | Custom accessible checkbox with label & description | `label`, `description`, `checked`, `onChange` |
| **`Tabs`** | `@/components/ui` | Navigation / filter tab switcher with count badges | `tabs: { key, label, count }[]`, `activeTab`, `onChange` |
| **`Avatar`** | `@/components/ui` | User / Merchant avatar with initials and dynamic gradient colors | `name`, `size: 'sm' \| 'md' \| 'lg'`, `imageSrc` |
| **`EmptyState`** | `@/components/ui` | Clean placeholder when tables or lists have zero items | `title`, `description`, `icon`, `action` |
| **`showToast`** | `@/lib/api` | Global toast notification popup (success, error, warning, info) | `type: ToastType`, `message: string`, `duration?: number` |

---

## 🛠️ 2. Detailed Component Examples & Code Snippets

### 1. Page Shell (`DashboardLayout`)
Every protected dashboard page (Merchant or Admin) MUST be wrapped in `DashboardLayout`:
```tsx
import { DashboardLayout } from '@/components/layout';

export default function MyPage() {
  return (
    <DashboardLayout
      role="merchant" // or "admin"
      title="My Deliveries"
      subtitle="Manage all active consignments and track fleet progress"
      action={<Button variant="primary">Create Parcel</Button>}
    >
      <div className="my-8 space-y-6">
        {/* Your Page Content */}
      </div>
    </DashboardLayout>
  );
}
```

---

### 2. KPI / Metrics Grid (`StatCard`)
Use `StatCard` inside a responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`):
```tsx
import { StatCard } from '@/components/ui';
import { DollarSign, Wallet, Clock, TrendingUp } from 'lucide-react';

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
  <StatCard
    title="Available Balance"
    value="$8,420.00"
    icon={Wallet}
    iconColor="text-emerald-600"
    iconBg="bg-emerald-50 border-emerald-100"
    change={{ value: 'Ready for payout', isPositive: true }}
  />
  <StatCard
    title="Pending Due"
    value="$1,240.00"
    icon={Clock}
    iconColor="text-amber-600"
    iconBg="bg-amber-50 border-amber-100"
    subtext="Settling in 2 days"
  />
</div>
```

---

### 3. Action Buttons (`Button`)
```tsx
import { Button } from '@/components/ui';
import { Plus, Download, Trash2 } from 'lucide-react';

// Primary Action
<Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
  Add New Item
</Button>

// Outline / Secondary
<Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
  Export CSV
</Button>

// Loading State
<Button variant="primary" isLoading={isSubmitting}>
  Save Changes
</Button>
```

---

### 4. Interactive Data Table (`DataTable`)
```tsx
import { DataTable, Column, Badge } from '@/components/ui';

const columns: Column<MyItem>[] = [
  { key: 'id', header: 'ID', render: (row) => <span className="font-mono text-xs text-blue-600 font-bold">{row.id}</span> },
  { key: 'name', header: 'Customer Name', sortable: true, accessor: (r) => r.name },
  { key: 'amount', header: 'Amount (USD)', sortable: true, accessor: (r) => r.amount,
    render: (row) => <span className="font-mono font-bold">${row.amount.toFixed(2)}</span>
  },
  { key: 'status', header: 'Status',
    render: (row) => <Badge variant={row.status === 'ACTIVE' ? 'green' : 'default'} size="sm">{row.status}</Badge>
  },
];

<DataTable
  data={items}
  columns={columns}
  searchable
  searchPlaceholder="Search customers..."
  pageSize={10}
  emptyMessage="No customer records found."
  headerRight={<Badge variant="blue" size="sm">{items.length} items</Badge>}
/>
```

---

### 5. Dialogs & Action Windows (`Modal`)
```tsx
import { Modal, Button, Input } from '@/components/ui';

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Create Pickup Request"
  size="md" // 'sm' | 'md' | 'lg' | 'xl'
  footer={
    <>
      <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" size="sm" onClick={handleSave}>
        Confirm & Submit
      </Button>
    </>
  }
>
  <div className="space-y-4">
    <Input label="Recipient Phone" placeholder="+1-555-0100" />
    <Input label="Parcel Weight (KG)" type="number" />
  </div>
</Modal>
```

---

### 6. Toast Alerts & Feedback Notifications (`showToast`)
```tsx
import { showToast } from '@/lib/api';

// Success
showToast('success', 'Parcel created successfully! Tracking ID: SH-8921');

// Error / Failure
showToast('error', 'Failed to update status. Please try again.');

// Warning
showToast('warning', 'Session expiring soon. Please save your work.');
```

---

## 📐 3. Layout Spacing & Vertical Rhythm Standards

To ensure clean breathing room across all pages:
* **Section Margins:** Use `my-8` for separating major page blocks (Cards, KPI grids, DataTables, Action toolbars).
* **Grid Gaps:** Use `gap-6` for stat cards and item lists.
* **Card Inner Padding:** Use `p-6` for large content cards, and `p-4` or `p-5` for compact list items.
* **Border Radii:** Use `rounded-lg` for cards and tables, and `rounded-md` for buttons and form inputs.

---
*Created for Shohnaat Logistics Frontend Engineering Consistency.*
