import type { ChartConfig } from "@/components/ui/chart";

export const app1User = {
  name: "Aditi Rao",
  initials: "AR",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  role: "Head Pastry Chef & Manager",
};

export const app1ChartConfig = {
  opened: {
    label: "Orders Inflow",
    color: "#D97706",
  },
  completed: {
    label: "Fulfilled & Picked Up",
    color: "#4A2818",
  },
} satisfies ChartConfig;

export const app1Chart = [
  { week: "W1", opened: 42, completed: 38 },
  { week: "W2", opened: 56, completed: 51 },
  { week: "W3", opened: 68, completed: 62 },
  { week: "W4", opened: 59, completed: 64 },
  { week: "W5", opened: 74, completed: 71 },
  { week: "W6", opened: 88, completed: 82 },
  { week: "W7", opened: 95, completed: 91 },
  { week: "W8", opened: 104, completed: 98 },
];

export const app1Projects = [
  {
    id: "p1",
    name: "Calibrated Couverture Line Restock",
    description: "Belgian dark & milk buttons import batch for wedding season",
    status: "In progress" as const,
    progress: 78,
    dueDate: "Tomorrow",
    team: [
      {
        name: "Chef Maya",
        initials: "CM",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "Rohan K",
        initials: "RK",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "p2",
    name: "Custom Acrylic Cake Toppers Collection",
    description: "Gold mirror and pastel anniversary monogram topper presets",
    status: "In review" as const,
    progress: 92,
    dueDate: "Fri, Oct 29",
    team: [
      {
        name: "Pooja V",
        initials: "PV",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "p3",
    name: "Diwali Macaron Gift Box Packaging",
    description: "Food-grade gold-foiled rigid sleeves with 12-slot dividers",
    status: "In progress" as const,
    progress: 64,
    dueDate: "Nov 4",
    team: [
      {
        name: "Rohan K",
        initials: "RK",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "Anand S",
        initials: "AS",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "p4",
    name: "Silicone Geo Heart Mould Inventory Count",
    description: "Multi-cavity chocolate and geometric entremet mould audits",
    status: "Planning" as const,
    progress: 35,
    dueDate: "Nov 12",
    team: [
      {
        name: "Chef Maya",
        initials: "CM",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      },
    ],
  },
];

export const app1Activity = [
  {
    id: "a1",
    person: {
      name: "Chef Maya",
      initials: "CM",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    },
    action: "confirmed counter pickup for Order #BK-8924 (Belgian Couverture & Vanilla Bean)",
    time: "8m ago",
  },
  {
    id: "a2",
    person: {
      name: "Rohan K",
      initials: "RK",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    action: "updated inventory for 10-inch White Square Cake Boxes (+150 units)",
    time: "24m ago",
  },
  {
    id: "a3",
    person: {
      name: "Pooja V",
      initials: "PV",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    },
    action: "added 12 new items to 'Festival Cake Sprinkles & Glitters' category",
    time: "1h ago",
  },
  {
    id: "a4",
    person: {
      name: "Anand S",
      initials: "AS",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    },
    action: "dispatched WhatsApp pickup notification to +91 98450 49102",
    time: "2h ago",
  },
];
