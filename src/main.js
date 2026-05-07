import data from "./data/mockData.js";
import {
  createContact,
  deleteContact,
  listContactsByOrganization,
  updateContact,
} from "./lib/contacts.js";
import {
  createDeal,
  deleteDeal,
  listDealsByOrganization,
  updateDeal,
} from "./lib/deals.js";
import {
  createLead,
  deleteLead,
  listLeadsByOrganization,
  updateLead,
} from "./lib/leads.js";
import {
  getOrganizationById,
  updateOrganization,
} from "./lib/organizations.js";
import { getCurrentUserProfile } from "./lib/profiles.js";
import {
  hasSupabaseConfig,
  supabase,
  supabaseConfigError,
} from "./lib/supabase.js";
import {
  createTask,
  deleteTask,
  listTasksByOrganization,
  updateTask,
} from "./lib/tasks.js";

const publicRouteIds = ["login", "signup"];
const routeIds = [
  "dashboard",
  "contacts",
  "leads",
  "deals",
  "clients",
  "tasks",
  "settings",
];
const allRouteIds = [...publicRouteIds, ...routeIds];
const normalizeHashRoute = (route) => (route === "pipeline" ? "deals" : route);
const initialHashRoute = normalizeHashRoute(location.hash.slice(1));
const createEmptyContactForm = () => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  source: "",
  status: "New",
  notes: "",
});
const createEmptyLeadForm = () => ({
  leadName: "",
  company: "",
  contactId: "",
  status: "New",
  source: "",
  value: "",
  probability: "",
  expectedCloseDate: "",
  notes: "",
});
const createEmptyDealForm = () => ({
  dealName: "",
  company: "",
  contactId: "",
  leadId: "",
  stage: "Prospecting",
  value: "",
  probability: "",
  expectedCloseDate: "",
  notes: "",
});
const createEmptyTaskForm = () => ({
  title: "",
  description: "",
  taskType: "Call",
  priority: "Medium",
  status: "Pending",
  dueDate: "",
  contactId: "",
  leadId: "",
  dealId: "",
});
const createEmptyOrganizationSettingsForm = () => ({
  name: "",
  logoUrl: "",
  industry: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  brandColor: "",
});
const state = {
  route: allRouteIds.includes(initialHashRoute) ? initialHashRoute : "login",
  sidebarOpen: false,
  loading: false,
  dashboardLoading: false,
  dashboardError: "",
  globalSearch: "",
  selectedLead: null,
  selectedClient: null,
  selectedDealId: null,
  currentProfile: null,
  currentProfilePromise: null,
  organization: null,
  organizationLoaded: false,
  organizationLoading: false,
  organizationError: "",
  organizationSaving: false,
  organizationSaveSuccess: "",
  organizationSaveError: "",
  organizationForm: createEmptyOrganizationSettingsForm(),
  leadQuery: "",
  leadStatus: "All",
  leads: [],
  leadsLoaded: false,
  leadsLoading: false,
  leadsError: "",
  leadFormOpen: false,
  leadFormMode: "create",
  leadFormId: null,
  leadFormBusy: false,
  leadFormError: "",
  leadForm: createEmptyLeadForm(),
  leadDeleteId: null,
  leadDeleteBusy: false,
  leadDeleteError: "",
  dealQuery: "",
  dealStage: "All",
  deals: [],
  dealsLoaded: false,
  dealsLoading: false,
  dealsError: "",
  dealFormOpen: false,
  dealFormMode: "create",
  dealFormId: null,
  dealFormBusy: false,
  dealFormError: "",
  dealForm: createEmptyDealForm(),
  dealDeleteId: null,
  dealDeleteBusy: false,
  dealDeleteError: "",
  dealStageBusyId: null,
  dealStageErrorId: null,
  dealStageError: "",
  taskQuery: "",
  taskStatus: "All",
  taskPriority: "All",
  taskSort: "due-date",
  tasks: [],
  tasksLoaded: false,
  tasksLoading: false,
  tasksError: "",
  taskFormOpen: false,
  taskFormMode: "create",
  taskFormId: null,
  taskFormBusy: false,
  taskFormError: "",
  taskForm: createEmptyTaskForm(),
  taskDeleteId: null,
  taskDeleteBusy: false,
  taskDeleteError: "",
  taskStatusBusyId: null,
  taskStatusErrorId: null,
  taskStatusError: "",
  authReady: !hasSupabaseConfig,
  authBusy: false,
  authError: "",
  authSuccess: "",
  authEmail: "",
  authPassword: "",
  signupFullName: "",
  signupCompanyName: "",
  signupEmail: "",
  signupPassword: "",
  signupConfirmPassword: "",
  flashMessage: "",
  flashTone: "success",
  flashTimeoutId: null,
  session: null,
  organizationId: "",
  contacts: [],
  contactsLoaded: false,
  contactsLoading: false,
  contactsError: "",
  clientQuery: "",
  contactsQuery: "",
  contactsCompany: "All",
  contactsStatus: "All",
  contactsSource: "All",
  contactFormOpen: false,
  contactFormMode: "create",
  contactFormId: null,
  contactFormBusy: false,
  contactFormError: "",
  contactForm: createEmptyContactForm(),
  contactDeleteId: null,
  contactDeleteBusy: false,
  contactDeleteError: "",
};

const routes = [
  { id: "dashboard", label: "Dashboard", icon: "01" },
  { id: "contacts", label: "Contacts", icon: "02" },
  { id: "leads", label: "Leads", icon: "03" },
  { id: "deals", label: "Deals", icon: "04" },
  { id: "clients", label: "Clients", icon: "05" },
  { id: "tasks", label: "Tasks", icon: "06" },
  { id: "settings", label: "Settings", icon: "07" },
];
const dealStagePresets = [
  "Prospecting",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];
const contactStatusPresets = ["New", "Active", "Qualified", "Nurture"];
const leadStatusPresets = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
];
const taskTypePresets = ["Call", "Email", "Meeting", "Follow Up", "Internal"];
const taskPriorityPresets = ["Low", "Medium", "High", "Urgent"];
const taskStatusPresets = ["Pending", "In Progress", "Completed", "Cancelled"];
const dashboardWeekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const app = document.querySelector("#app");

const currency = (value) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
const number = (value) => new Intl.NumberFormat("en-US").format(value);
const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});
const html = (strings, ...values) =>
  strings.reduce(
    (result, string, index) => result + string + (values[index] ?? ""),
    "",
  );
const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
const statusClass = (status) => status.toLowerCase().replace(/\s+/g, "-");
const parseDateValue = (value) => {
  if (!value) return null;

  const source = String(value).trim();
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(source);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(source);
  return Number.isNaN(date.getTime()) ? null : date;
};
const formatDate = (value) => {
  if (!value) return "Recently";

  const date = parseDateValue(value);
  if (!date) return "Recently";

  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};
const formatDateTime = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
const startOfDay = (value) => {
  const date = value instanceof Date ? new Date(value) : parseDateValue(value);
  if (!date) return null;

  date.setHours(0, 0, 0, 0);
  return date;
};
const addDays = (value, days) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
};
const getStartOfWeek = (value = new Date()) => {
  const date = startOfDay(value);
  const weekday = date?.getDay?.() ?? 0;
  const offset = weekday === 0 ? -6 : 1 - weekday;
  return addDays(date, offset);
};
const getRelativeTimeLabel = (value) => {
  const date = parseDateValue(value);
  if (!date) return "Recently";

  const deltaInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, seconds] of units) {
    if (Math.abs(deltaInSeconds) >= seconds || unit === "minute") {
      return relativeTimeFormatter.format(
        Math.round(deltaInSeconds / seconds),
        unit,
      );
    }
  }

  return "Just now";
};
const isValidHexColor = (value) =>
  /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test((value || "").trim());
const getOrganizationAccentColor = (value) => {
  const source = (value || "").trim();
  return isValidHexColor(source) ? source : "#d8aa3b";
};
const normalizeOptionalText = (value) => {
  const source = String(value ?? "").trim();
  return source ? source : null;
};
const createOrganizationSettingsFormFromRecord = (organization = null) => ({
  name: organization?.name || "",
  logoUrl: organization?.logo_url || "",
  industry: organization?.industry || "",
  website: organization?.website || "",
  email: organization?.email || "",
  phone: organization?.phone || "",
  address: organization?.address || "",
  brandColor: organization?.brand_color || "",
});
const logoImage = new URL("../pusha_logo_170.png", import.meta.url).href;
const renderLogo = (className = "", alt = "Pusha logo") =>
  `<img class="brand-logo${className ? ` ${className}` : ""}" src="${logoImage}" alt="${alt}" />`;

function getRequestedRoute() {
  const route = normalizeHashRoute(location.hash.slice(1));
  return routeIds.includes(route) ? route : "dashboard";
}

function getRequestedPublicRoute() {
  const route = normalizeHashRoute(location.hash.slice(1));
  return publicRouteIds.includes(route) ? route : "login";
}

function isAuthenticated() {
  return Boolean(state.session?.user);
}

function isPublicRoute(route) {
  return publicRouteIds.includes(route);
}

function isAppRoute(route) {
  return routeIds.includes(route);
}

function formatDisplayName(value) {
  if (!value) return data.user.name;

  const source = value.includes("@") ? value.split("@")[0] : value;
  if (!/[._-]/.test(source)) return source;

  return source
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getContactName(contact) {
  return (
    [contact.first_name, contact.last_name].filter(Boolean).join(" ").trim() ||
    "Untitled contact"
  );
}

function getClientContactName(contact) {
  return (
    [contact.first_name, contact.last_name].filter(Boolean).join(" ").trim() ||
    "No primary contact"
  );
}

function getClientTitle(contact) {
  return (contact.company || "").trim() || getClientContactName(contact);
}

function getClientTypeValue(contact) {
  return (contact.client_type || "").trim() || "Client";
}

function getClientStatusValue(contact) {
  return (contact.client_status || contact.status || "").trim() || "Inactive";
}

function getClientRelationshipHealthNumber(contact) {
  const numeric = Number(contact.relationship_health);

  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function getClientSubtitle(contact) {
  return `${getClientTypeValue(contact)} - ${getClientContactName(contact)}`;
}

function getClientPlaceholderImage(contact) {
  const placeholders = data.clients
    .map((client) => client.image)
    .filter(Boolean);

  if (!placeholders.length) return "";

  const source = String(
    contact.id ||
      contact.email ||
      contact.company ||
      getClientContactName(contact),
  );
  const hash = [...source].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return placeholders[hash % placeholders.length];
}

function getClientImage(contact) {
  return (contact.image_url || "").trim() || getClientPlaceholderImage(contact);
}

function getClientSortRank(contact) {
  const status = getClientStatusValue(contact);

  if (status === "Active") return 0;
  if (status === "At Risk") return 1;
  if (status === "Onboarding") return 2;
  if (status === "Inactive") return 3;
  return 4;
}

function sortClients(contacts) {
  return [...contacts].sort((left, right) => {
    const rankDifference = getClientSortRank(left) - getClientSortRank(right);
    if (rankDifference !== 0) return rankDifference;

    const healthDifference =
      getClientRelationshipHealthNumber(right) -
      getClientRelationshipHealthNumber(left);
    if (healthDifference !== 0) return healthDifference;

    return getClientTitle(left).localeCompare(getClientTitle(right));
  });
}

function getContactInitials(contact) {
  const initials = [contact.first_name, contact.last_name]
    .map((value) => (value || "").trim().charAt(0))
    .filter(Boolean)
    .join("")
    .slice(0, 2);

  if (initials) return initials.toUpperCase();
  return ((contact.email || "").trim().charAt(0) || "C").toUpperCase();
}

function getContactStatusValue(contact) {
  return (contact.status || "").trim() || "New";
}

function getDashboardContactLabel(contact) {
  return (contact.company || "").trim() || getContactName(contact);
}

function getLeadName(lead) {
  return (lead.lead_name || "").trim() || "Untitled lead";
}

function getLeadInitials(lead) {
  const source = getLeadName(lead) || (lead.company || "").trim() || "L";

  return source
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getLeadStatusValue(lead) {
  return (lead.status || "").trim() || "New";
}

function getLeadValueNumber(lead) {
  const numeric = Number(lead.value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function getLeadProbabilityNumber(lead) {
  const numeric = Number(lead.probability);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatLeadValue(value) {
  if (value == null || value === "") return "No value";
  const numeric = Number(value);
  return Number.isFinite(numeric) ? currency(numeric) : "No value";
}

function formatProbability(value) {
  if (value == null || value === "") return "Unscored";
  const numeric = Number(value);
  return Number.isFinite(numeric) ? `${numeric}% probability` : "Unscored";
}

function getLeadNotePreview(lead) {
  const notes = (lead.notes || "").trim();
  if (!notes) return "No notes yet";
  return notes.length > 76 ? `${notes.slice(0, 76).trim()}...` : notes;
}

function getLeadContact(contactId) {
  if (!contactId) return null;
  return findContactById(contactId);
}

function getLeadContactLabel(lead) {
  const contact = getLeadContact(lead.contact_id);
  if (!contact) return "No linked contact";

  const contactName = getContactName(contact);
  if (contact.email) return `${contactName} - ${contact.email}`;
  return contactName;
}

function getLeadCloseDateLabel(lead) {
  return lead.expected_close_date
    ? formatDate(lead.expected_close_date)
    : "Open ended";
}

function getLeadStatusOptions() {
  return [
    "All",
    ...new Set(
      [
        ...leadStatusPresets,
        ...state.leads.map((lead) => getLeadStatusValue(lead)),
        state.leadStatus,
        state.leadForm.status,
      ].filter(Boolean),
    ),
  ];
}

function getDealName(deal) {
  return (deal.deal_name || "").trim() || "Untitled deal";
}

function getDealInitials(deal) {
  const source = getDealName(deal) || (deal.company || "").trim() || "D";

  return source
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getDealStageValue(deal) {
  return (deal.stage || "").trim() || dealStagePresets[0];
}

function getDealValueNumber(deal) {
  const numeric = Number(deal.value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function getDealProbabilityNumber(deal) {
  const numeric = Number(deal.probability);
  return Number.isFinite(numeric) ? numeric : 0;
}

function getDealNotePreview(deal) {
  const notes = (deal.notes || "").trim();
  if (!notes) return "No notes yet";
  return notes.length > 88 ? `${notes.slice(0, 88).trim()}...` : notes;
}

function getDealContact(deal) {
  if (!deal.contact_id) return null;
  return findContactById(deal.contact_id);
}

function getDealLead(deal) {
  if (!deal.lead_id) return null;
  return findLeadById(deal.lead_id);
}

function getDealContactLabel(deal) {
  const contact = getDealContact(deal);
  return contact ? getContactName(contact) : "No linked contact";
}

function getDealLeadLabel(deal) {
  const lead = getDealLead(deal);
  return lead ? getLeadName(lead) : "No linked lead";
}

function getDealCloseDateLabel(deal) {
  return deal.expected_close_date
    ? formatDate(deal.expected_close_date)
    : "Open ended";
}

function getDealStageOptions() {
  return [
    "All",
    ...new Set(
      [
        ...dealStagePresets,
        ...state.deals.map((deal) => getDealStageValue(deal)),
        state.dealStage,
        state.dealForm.stage,
      ].filter(Boolean),
    ),
  ];
}

function getTaskTitle(task) {
  return (task.title || "").trim() || "Untitled task";
}

function getTaskInitials(task) {
  return getTaskTitle(task)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getTaskTypeValue(task) {
  return (task.task_type || "").trim() || taskTypePresets[0];
}

function getTaskPriorityValue(task) {
  return (task.priority || "").trim() || "Medium";
}

function getTaskStatusValue(task) {
  return (task.status || "").trim() || "Pending";
}

function isTaskCompleted(task) {
  return getTaskStatusValue(task) === "Completed" || Boolean(task.completed_at);
}

function getTaskDescriptionPreview(task) {
  const description = (task.description || "").trim();
  if (!description) return "No description yet";
  return description.length > 96
    ? `${description.slice(0, 96).trim()}...`
    : description;
}

function getTaskDueDateValue(task) {
  if (!task?.due_date) return null;
  return parseDateValue(task.due_date);
}

function getTaskDueTone(task) {
  if (isTaskCompleted(task)) return "complete";

  const dueDate = getTaskDueDateValue(task);
  if (!dueDate) return "muted";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(dueDate);
  dueDay.setHours(0, 0, 0, 0);
  const difference = Math.round(
    (dueDay.getTime() - today.getTime()) / 86400000,
  );

  if (difference < 0) return "overdue";
  if (difference === 0) return "today";
  return "upcoming";
}

function getTaskDueDateLabel(task) {
  const dueDate = getTaskDueDateValue(task);
  if (!dueDate) return "No due date";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(dueDate);
  dueDay.setHours(0, 0, 0, 0);
  const difference = Math.round(
    (dueDay.getTime() - today.getTime()) / 86400000,
  );

  if (difference < 0) return `Overdue since ${formatDate(task.due_date)}`;
  if (difference === 0) return "Due today";
  if (difference === 1) return "Due tomorrow";
  return `Due ${formatDate(task.due_date)}`;
}

function getTaskContact(task) {
  if (!task.contact_id) return null;
  return findContactById(task.contact_id);
}

function getTaskLead(task) {
  if (!task.lead_id) return null;
  return findLeadById(task.lead_id);
}

function getTaskDeal(task) {
  if (!task.deal_id) return null;
  return findDealById(task.deal_id);
}

function getTaskLinks(task) {
  const links = [];
  const contact = getTaskContact(task);
  const lead = getTaskLead(task);
  const deal = getTaskDeal(task);

  if (contact) {
    links.push({
      kind: "Contact",
      label: getContactName(contact),
    });
  } else if (task.contact_id) {
    links.push({
      kind: "Contact",
      label: "Linked contact",
    });
  }

  if (lead) {
    links.push({
      kind: "Lead",
      label: getLeadName(lead),
    });
  } else if (task.lead_id) {
    links.push({
      kind: "Lead",
      label: "Linked lead",
    });
  }

  if (deal) {
    links.push({
      kind: "Deal",
      label: getDealName(deal),
    });
  } else if (task.deal_id) {
    links.push({
      kind: "Deal",
      label: "Linked deal",
    });
  }

  return links;
}

function getTaskStatusOptions() {
  return [
    "All",
    ...new Set(
      [
        ...taskStatusPresets,
        ...state.tasks.map((task) => getTaskStatusValue(task)),
        state.taskStatus,
        state.taskForm.status,
      ].filter(Boolean),
    ),
  ];
}

function getTaskPriorityOptions() {
  return [
    "All",
    ...new Set(
      [
        ...taskPriorityPresets,
        ...state.tasks.map((task) => getTaskPriorityValue(task)),
        state.taskPriority,
        state.taskForm.priority,
      ].filter(Boolean),
    ),
  ];
}

function getTaskCreatedAtTime(task) {
  const date = new Date(task.updated_at || task.created_at || 0);
  const timestamp = date.getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sortTasks(tasks, sortBy = state.taskSort) {
  return [...tasks].sort((left, right) => {
    if (sortBy === "newest") {
      return getTaskCreatedAtTime(right) - getTaskCreatedAtTime(left);
    }

    const leftDue = getTaskDueDateValue(left);
    const rightDue = getTaskDueDateValue(right);

    if (!leftDue && !rightDue) {
      return getTaskCreatedAtTime(right) - getTaskCreatedAtTime(left);
    }

    if (!leftDue) return 1;
    if (!rightDue) return -1;

    const difference = leftDue.getTime() - rightDue.getTime();
    if (difference !== 0) return difference;

    return getTaskCreatedAtTime(right) - getTaskCreatedAtTime(left);
  });
}

function areDashboardSourcesLoaded() {
  return (
    state.contactsLoaded &&
    state.leadsLoaded &&
    state.dealsLoaded &&
    state.tasksLoaded
  );
}

function isDashboardTaskOpen(task) {
  return getTaskStatusValue(task) !== "Completed";
}

function getDashboardMetrics() {
  const today = startOfDay(new Date());
  const totalLeads = state.leads.length;
  const activeDeals = state.deals.filter((deal) => {
    const stage = getDealStageValue(deal);
    return stage !== "Won" && stage !== "Lost";
  }).length;
  const followUpsDue = state.tasks.filter((task) => {
    if (!isDashboardTaskOpen(task)) return false;

    const dueDate = startOfDay(task.due_date);
    return dueDate ? dueDate.getTime() <= today.getTime() : false;
  }).length;
  const revenuePipeline = state.deals
    .filter((deal) => getDealStageValue(deal) !== "Lost")
    .reduce((total, deal) => total + getDealValueNumber(deal), 0);

  return [
    {
      label: "Total Leads",
      value: totalLeads,
      change: "Workspace total",
      tone: "",
    },
    {
      label: "Active Deals",
      value: activeDeals,
      change: "Excludes won and lost",
      tone: "",
    },
    {
      label: "Follow-ups Due",
      value: followUpsDue,
      change: "Due today or overdue",
      tone: followUpsDue ? "warn" : "",
    },
    {
      label: "Revenue Pipeline",
      value: revenuePipeline,
      prefix: "currency",
      change: "Active and won, excluding lost",
      tone: "",
    },
  ];
}

function getDashboardChartData() {
  const weekStart = getStartOfWeek();
  const weekEnd = addDays(weekStart, 7);
  const chart = dashboardWeekLabels.map((label, index) => ({
    label,
    leads: 0,
    deals: 0,
    date: addDays(weekStart, index),
  }));

  const countRecordForWeek = (record, key) => {
    const createdAt = parseDateValue(record.created_at);
    if (!createdAt || createdAt < weekStart || createdAt >= weekEnd) return;

    const dayIndex = Math.round(
      (startOfDay(createdAt).getTime() - weekStart.getTime()) / 86400000,
    );

    if (dayIndex >= 0 && dayIndex < chart.length) {
      chart[dayIndex][key] += 1;
    }
  };

  state.leads.forEach((lead) => countRecordForWeek(lead, "leads"));
  state.deals.forEach((deal) => countRecordForWeek(deal, "deals"));

  return chart;
}

function getDashboardActivityItems() {
  const contacts = state.contacts.map((contact) => ({
    id: `contact-${contact.id}`,
    text: `Added ${getDashboardContactLabel(contact)} as a contact`,
    timeValue: contact.created_at,
  }));
  const leads = state.leads.map((lead) => ({
    id: `lead-${lead.id}`,
    text: `Added ${getLeadName(lead)} as a lead`,
    timeValue: lead.created_at,
  }));
  const deals = state.deals.map((deal) => ({
    id: `deal-${deal.id}`,
    text: `Created deal ${getDealName(deal)}`,
    timeValue: deal.created_at,
  }));
  const createdTasks = state.tasks.map((task) => ({
    id: `task-created-${task.id}`,
    text: `Created task ${getTaskTitle(task)}`,
    timeValue: task.created_at,
  }));
  const completedTasks = state.tasks
    .filter((task) => isTaskCompleted(task))
    .map((task) => ({
      id: `task-completed-${task.id}`,
      text: `Completed task ${getTaskTitle(task)}`,
      timeValue: task.completed_at || task.updated_at || task.created_at,
    }));

  return [...contacts, ...leads, ...deals, ...createdTasks, ...completedTasks]
    .filter((item) => parseDateValue(item.timeValue))
    .sort(
      (left, right) =>
        parseDateValue(right.timeValue).getTime() -
        parseDateValue(left.timeValue).getTime(),
    )
    .slice(0, 5)
    .map((item) => ({
      ...item,
      time: getRelativeTimeLabel(item.timeValue),
    }));
}

function getDashboardUpcomingTasks() {
  return sortTasks(
    state.tasks.filter((task) => isDashboardTaskOpen(task)),
    "due-date",
  ).slice(0, 5);
}

function resetDashboardState() {
  state.dashboardLoading = false;
  state.dashboardError = "";
}

function resetProfileState() {
  state.globalSearch = "";
  state.organizationId = "";
  state.currentProfile = null;
  state.currentProfilePromise = null;
  resetDashboardState();
  resetOrganizationState();
}

function resetOrganizationState() {
  state.organization = null;
  state.organizationLoaded = false;
  state.organizationLoading = false;
  state.organizationError = "";
  state.organizationSaving = false;
  state.organizationSaveSuccess = "";
  state.organizationSaveError = "";
  state.organizationForm = createEmptyOrganizationSettingsForm();
}

function resetContactFormState() {
  state.contactFormOpen = false;
  state.contactFormMode = "create";
  state.contactFormId = null;
  state.contactFormBusy = false;
  state.contactFormError = "";
  state.contactForm = createEmptyContactForm();
}

function resetContactsState() {
  state.contacts = [];
  state.contactsLoaded = false;
  state.contactsLoading = false;
  state.contactsError = "";
  state.clientQuery = "";
  state.contactsQuery = "";
  state.contactsCompany = "All";
  state.contactsStatus = "All";
  state.contactsSource = "All";
  resetContactFormState();
  state.contactDeleteId = null;
  state.contactDeleteBusy = false;
  state.contactDeleteError = "";
  state.selectedClient = null;
}

function findContactById(contactId) {
  return (
    state.contacts.find(
      (contact) => String(contact.id) === String(contactId),
    ) || null
  );
}

function resetLeadFormState() {
  state.leadFormOpen = false;
  state.leadFormMode = "create";
  state.leadFormId = null;
  state.leadFormBusy = false;
  state.leadFormError = "";
  state.leadForm = createEmptyLeadForm();
}

function resetLeadsState() {
  state.leads = [];
  state.leadsLoaded = false;
  state.leadsLoading = false;
  state.leadsError = "";
  state.leadQuery = "";
  state.leadStatus = "All";
  resetLeadFormState();
  state.leadDeleteId = null;
  state.leadDeleteBusy = false;
  state.leadDeleteError = "";
}

function findLeadById(leadId) {
  return state.leads.find((lead) => String(lead.id) === String(leadId)) || null;
}

function resetDealFormState() {
  state.dealFormOpen = false;
  state.dealFormMode = "create";
  state.dealFormId = null;
  state.dealFormBusy = false;
  state.dealFormError = "";
  state.dealForm = createEmptyDealForm();
}

function resetDealsState() {
  state.deals = [];
  state.dealsLoaded = false;
  state.dealsLoading = false;
  state.dealsError = "";
  state.selectedDealId = null;
  state.dealQuery = "";
  state.dealStage = "All";
  resetDealFormState();
  state.dealDeleteId = null;
  state.dealDeleteBusy = false;
  state.dealDeleteError = "";
  state.dealStageBusyId = null;
  state.dealStageErrorId = null;
  state.dealStageError = "";
}

function findDealById(dealId) {
  return state.deals.find((deal) => String(deal.id) === String(dealId)) || null;
}

function resetTaskFormState() {
  state.taskFormOpen = false;
  state.taskFormMode = "create";
  state.taskFormId = null;
  state.taskFormBusy = false;
  state.taskFormError = "";
  state.taskForm = createEmptyTaskForm();
}

function resetTasksState() {
  state.tasks = [];
  state.tasksLoaded = false;
  state.tasksLoading = false;
  state.tasksError = "";
  state.taskQuery = "";
  state.taskStatus = "All";
  state.taskPriority = "All";
  state.taskSort = "due-date";
  resetTaskFormState();
  state.taskDeleteId = null;
  state.taskDeleteBusy = false;
  state.taskDeleteError = "";
  state.taskStatusBusyId = null;
  state.taskStatusErrorId = null;
  state.taskStatusError = "";
}

function findTaskById(taskId) {
  return state.tasks.find((task) => String(task.id) === String(taskId)) || null;
}

function getOrganizationNameValue() {
  return (
    (state.organizationForm.name || state.organization?.name || "").trim() ||
    "Organisation"
  );
}

function getOrganizationIndustryValue() {
  return (
    (
      state.organizationForm.industry ||
      state.organization?.industry ||
      ""
    ).trim() || "Premium CRM workspace"
  );
}

function getOrganizationLogoValue() {
  return (
    state.organizationForm.logoUrl ||
    state.organization?.logo_url ||
    ""
  ).trim();
}

function getOrganizationBrandColorValue() {
  return getOrganizationAccentColor(
    state.organizationForm.brandColor || state.organization?.brand_color || "",
  );
}

function getOrganizationInitials() {
  const initials = getOrganizationNameValue()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "OG";
}

function getProfile() {
  const user = state.session?.user;
  const metadata = user?.user_metadata ?? {};
  const email = user?.email || "";
  const name = formatDisplayName(
    metadata.full_name || metadata.name || email || data.user.name,
  );

  return {
    name,
    role: email || data.user.role,
    avatar: metadata.avatar_url || data.user.avatar,
  };
}

function getGlobalSearchValue() {
  if (state.route === "contacts") return state.contactsQuery;
  if (state.route === "leads") return state.leadQuery;
  if (state.route === "deals") return state.dealQuery;
  if (state.route === "tasks") return state.taskQuery;
  if (state.route === "clients") return state.clientQuery;
  return state.globalSearch;
}

function getGlobalSearchPlaceholder() {
  if (state.route === "contacts")
    return "Search first name, last name, email, company";
  if (state.route === "leads")
    return "Search lead name, company, source, status";
  if (state.route === "deals") return "Search deal name, company, stage";
  if (state.route === "tasks")
    return "Search title, description, task type, status, priority";
  if (state.route === "clients")
    return "Search company, contact, email, client type, status";
  if (state.route === "settings") return "Search organisation settings";
  return "Search contacts, leads, deals, clients";
}

function updateGlobalSearchQuery(value) {
  if (state.route === "contacts") {
    state.contactsQuery = value;
    return;
  }

  if (state.route === "leads") {
    state.leadQuery = value;
    return;
  }

  if (state.route === "deals") {
    state.dealQuery = value;
    return;
  }

  if (state.route === "tasks") {
    state.taskQuery = value;
    return;
  }

  if (state.route === "clients") {
    state.clientQuery = value;
    return;
  }

  state.globalSearch = value;
}

async function ensureCurrentProfile() {
  if (!state.session?.user) {
    throw new Error(
      "You need an active session before loading workspace data.",
    );
  }

  if (
    state.currentProfile?.id === state.session.user.id &&
    state.currentProfile.organization_id &&
    state.organizationId === state.currentProfile.organization_id
  ) {
    return state.currentProfile;
  }

  if (!state.currentProfilePromise) {
    state.currentProfilePromise = getCurrentUserProfile(state.session.user.id)
      .then((profile) => {
        state.currentProfile = profile;
        state.organizationId = profile.organization_id;
        return profile;
      })
      .finally(() => {
        state.currentProfilePromise = null;
      });
  }

  return state.currentProfilePromise;
}

function syncAuthRoute() {
  if (isAuthenticated()) {
    state.route = isAppRoute(state.route) ? state.route : getRequestedRoute();

    if (location.hash.slice(1) !== state.route) {
      history.replaceState(null, "", `#${state.route}`);
    }
    return;
  }

  state.route = isPublicRoute(state.route)
    ? state.route
    : getRequestedPublicRoute();
  state.sidebarOpen = false;
  state.selectedLead = null;
  state.selectedClient = null;
  state.selectedDealId = null;

  if (location.hash.slice(1) !== state.route) {
    history.replaceState(null, "", `#${state.route}`);
  }
}

function applySession(session) {
  const previousUserId = state.session?.user?.id || null;
  const nextUserId = session?.user?.id || null;

  if (previousUserId !== nextUserId) {
    resetProfileState();
    resetContactsState();
    resetLeadsState();
    resetDealsState();
    resetTasksState();
  }

  state.session = session;
  state.authReady = true;
  state.authBusy = false;

  if (session?.user) {
    state.authError = "";
    state.authSuccess = "";
    state.authPassword = "";
    state.signupPassword = "";
    state.signupConfirmPassword = "";
  }

  syncAuthRoute();
  render();

  if (isAuthenticated() && !state.loading) {
    hydrateRouteData(state.route);
    requestAnimationFrame(animateCounters);
  }
}

function showFlash(message, tone = "success", duration = 4200) {
  if (state.flashTimeoutId) {
    window.clearTimeout(state.flashTimeoutId);
  }

  state.flashMessage = message;
  state.flashTone = tone;
  state.flashTimeoutId = window.setTimeout(() => {
    state.flashMessage = "";
    state.flashTimeoutId = null;
    render();
  }, duration);
}

function setRoute(route, options = {}) {
  const { preserveAuthFeedback = false } = options;
  const normalizedRoute = normalizeHashRoute(route);
  const nextRoute = isAuthenticated()
    ? isAppRoute(normalizedRoute)
      ? normalizedRoute
      : "dashboard"
    : isPublicRoute(normalizedRoute)
      ? normalizedRoute
      : "login";
  state.route = nextRoute;

  if (location.hash.slice(1) !== nextRoute) {
    history.pushState(null, "", `#${nextRoute}`);
  }

  state.sidebarOpen = false;

  if (nextRoute !== "contacts") {
    resetContactFormState();
    state.contactDeleteId = null;
    state.contactDeleteBusy = false;
    state.contactDeleteError = "";
  }

  if (nextRoute !== "leads") {
    resetLeadFormState();
    state.leadDeleteId = null;
    state.leadDeleteBusy = false;
    state.leadDeleteError = "";
  }

  if (nextRoute !== "deals") {
    state.selectedDealId = null;
    resetDealFormState();
    state.dealDeleteId = null;
    state.dealDeleteBusy = false;
    state.dealDeleteError = "";
    state.dealStageBusyId = null;
    state.dealStageErrorId = null;
    state.dealStageError = "";
  }

  if (nextRoute !== "tasks") {
    resetTaskFormState();
    state.taskDeleteId = null;
    state.taskDeleteBusy = false;
    state.taskDeleteError = "";
    state.taskStatusBusyId = null;
    state.taskStatusErrorId = null;
    state.taskStatusError = "";
  }

  if (nextRoute !== "clients") {
    state.selectedClient = null;
  }

  if (nextRoute !== "settings") {
    state.organizationSaveSuccess = "";
    state.organizationSaveError = "";
  }

  if (!preserveAuthFeedback && isPublicRoute(nextRoute)) {
    state.authError = "";
    state.authSuccess = "";
  }

  if (isPublicRoute(nextRoute)) {
    state.selectedLead = null;
    state.selectedClient = null;
  }

  state.loading = isAuthenticated() && isAppRoute(nextRoute);
  render();
  hydrateRouteData(nextRoute);

  if (state.loading) {
    window.setTimeout(() => {
      state.loading = false;
      render();
      requestAnimationFrame(animateCounters);
    }, 380);
  }
}

function render() {
  if (!state.authReady) {
    app.innerHTML = renderAuthLoading();
    bindEvents();
    return;
  }

  if (!isAuthenticated()) {
    app.innerHTML = state.route === "signup" ? renderSignup() : renderLogin();
    bindEvents();
    return;
  }

  app.innerHTML = html`
    <div class="shell ${state.sidebarOpen ? "nav-open" : ""}">
      ${renderSidebar()}
      <main class="workspace">
        ${renderTopbar()}
        <section class="page-frame">
          ${state.flashMessage ? renderFlashBanner() : ""}
          ${state.loading ? renderSkeleton() : renderPage()}
        </section>
      </main>
    </div>
    ${state.selectedLead ? renderLeadDrawer(state.selectedLead) : ""}
    ${state.selectedClient ? renderClientModal(state.selectedClient) : ""}
    ${state.selectedDealId ? renderDealDetailModal() : ""}
    ${state.contactFormOpen ? renderContactFormModal() : ""}
    ${state.contactDeleteId ? renderContactDeleteModal() : ""}
    ${state.leadFormOpen ? renderLeadFormModal() : ""}
    ${state.leadDeleteId ? renderLeadDeleteModal() : ""}
    ${state.dealFormOpen ? renderDealFormModal() : ""}
    ${state.dealDeleteId ? renderDealDeleteModal() : ""}
    ${state.taskFormOpen ? renderTaskFormModal() : ""}
    ${state.taskDeleteId ? renderTaskDeleteModal() : ""}
  `;
  bindEvents();
}

function renderAuthLoading() {
  return html`
    <main class="login-page">
      <section class="login-brand">
        <div class="brand-logo-panel hero-logo-panel">
          ${renderLogo("hero-logo")}
        </div>
        <p class="eyebrow">Supabase authentication</p>
        <h1>Restoring your Pusha CRM session.</h1>
        <p>
          We are connecting to Supabase and checking whether there is already an
          active session on this browser.
        </p>
      </section>
      <section class="login-card" aria-label="Authentication status">
        <div>
          <p class="eyebrow">Authentication</p>
          <h2>Checking your session</h2>
        </div>
        <p class="helper-text loading-copy">
          If you have signed in before, the dashboard should open automatically.
        </p>
      </section>
    </main>
  `;
}

function renderLogin() {
  const authDisabled = state.authBusy || !hasSupabaseConfig;

  return html`
    <main class="login-page">
      <section class="login-brand">
        <div class="brand-logo-panel hero-logo-panel">
          ${renderLogo("hero-logo")}
        </div>
        <p class="eyebrow">Premium pipeline control</p>
        <h1>Move every relationship forward with Pusha CRM.</h1>
        <p>
          A focused workspace for leads, deals, clients, and follow-ups. Built
          for teams that want momentum without the noise.
        </p>
        <div class="login-proof">
          <span>1248 leads tracked</span>
          <span>R1.84M pipeline</span>
          <span>19 follow-ups due</span>
        </div>
      </section>
      <section class="login-card" aria-label="Login form">
        <form class="auth-form" data-login-form>
          <div>
            <p class="eyebrow">Welcome back</p>
            <h2>Sign in to Pusha CRM</h2>
          </div>
          ${state.authSuccess
            ? `<p class="auth-message success">${escapeHtml(state.authSuccess)}</p>`
            : ""}
          ${!hasSupabaseConfig
            ? `<p class="auth-message warning">${escapeHtml(supabaseConfigError)}</p>`
            : ""}
          ${state.authError
            ? `<p class="auth-message error">${escapeHtml(state.authError)}</p>`
            : ""}
          <label>
            Email
            <input
              data-auth-email
              type="email"
              value="${escapeHtml(state.authEmail)}"
              placeholder="you@company.com"
              aria-label="Email"
              autocomplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              data-auth-password
              type="password"
              value="${escapeHtml(state.authPassword)}"
              placeholder="Enter your password"
              aria-label="Password"
              autocomplete="current-password"
              required
            />
          </label>
          <button
            class="button primary"
            type="submit"
            ${authDisabled ? "disabled" : ""}
          >
            ${state.authBusy ? "Signing in..." : "Enter dashboard"}
          </button>
          <p class="helper-text">
            Sign in with the email and password for the user you created in
            Supabase Auth.
          </p>
          <p class="auth-switch">
            New to Pusha CRM?
            <button class="auth-link" type="button" data-route="signup">
              Create your workspace
            </button>
          </p>
        </form>
      </section>
    </main>
  `;
}

function renderSignup() {
  const authDisabled = state.authBusy || !hasSupabaseConfig;

  return html`
    <main class="login-page">
      <section class="login-brand">
        <div class="brand-logo-panel hero-logo-panel">
          ${renderLogo("hero-logo")}
        </div>
        <p class="eyebrow">Launch your workspace</p>
        <h1>Start a clean sales workspace for your team.</h1>
        <p>
          Create your Pusha CRM account and we will provision your organization
          profile in the background as part of the Supabase auth flow.
        </p>
        <div class="login-proof">
          <span>Instant workspace setup</span>
          <span>Team-ready structure</span>
          <span>Secure Supabase auth</span>
        </div>
      </section>
      <section class="login-card signup-card" aria-label="Signup form">
        <form class="auth-form" data-signup-form>
          <div>
            <p class="eyebrow">Create account</p>
            <h2>Set up your Pusha CRM access</h2>
          </div>
          ${state.authSuccess
            ? `<p class="auth-message success">${escapeHtml(state.authSuccess)}</p>`
            : ""}
          ${!hasSupabaseConfig
            ? `<p class="auth-message warning">${escapeHtml(supabaseConfigError)}</p>`
            : ""}
          ${state.authError
            ? `<p class="auth-message error">${escapeHtml(state.authError)}</p>`
            : ""}
          <label>
            Full Name
            <input
              data-signup-full-name
              type="text"
              value="${escapeHtml(state.signupFullName)}"
              placeholder="Nandi Mokoena"
              autocomplete="name"
              required
            />
          </label>
          <label>
            Company Name
            <input
              data-signup-company-name
              type="text"
              value="${escapeHtml(state.signupCompanyName)}"
              placeholder="Pusha CRM"
              autocomplete="organization"
              required
            />
          </label>
          <label>
            Email
            <input
              data-signup-email
              type="email"
              value="${escapeHtml(state.signupEmail)}"
              placeholder="you@company.com"
              autocomplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              data-signup-password
              type="password"
              value="${escapeHtml(state.signupPassword)}"
              placeholder="At least 6 characters"
              autocomplete="new-password"
              minlength="6"
              required
            />
          </label>
          <label>
            Confirm Password
            <input
              data-signup-confirm-password
              type="password"
              value="${escapeHtml(state.signupConfirmPassword)}"
              placeholder="Re-enter your password"
              autocomplete="new-password"
              minlength="6"
              required
            />
          </label>
          <button
            class="button primary"
            type="submit"
            ${authDisabled ? "disabled" : ""}
          >
            ${state.authBusy ? "Creating account..." : "Create account"}
          </button>
          <p class="helper-text">
            Your Supabase trigger will create the organization and profile
            automatically.
          </p>
          <p class="auth-switch">
            Already have an account?
            <button class="auth-link" type="button" data-route="login">
              Back to sign in
            </button>
          </p>
        </form>
      </section>
    </main>
  `;
}

function renderSidebar() {
  const weightedRevenue = state.deals.reduce(
    (sum, deal) =>
      sum + getDealValueNumber(deal) * (getDealProbabilityNumber(deal) / 100),
    0,
  );

  return html`
    <aside class="sidebar">
      <div class="sidebar-head">
        <div class="brand-logo-badge">${renderLogo("badge-logo")}</div>
        <div><strong>Pusha CRM</strong><span>Sales command</span></div>
      </div>
      <nav class="nav-list" aria-label="Main navigation">
        ${routes
          .map(
            (route) => html`
              <button
                class="nav-item ${state.route === route.id ? "active" : ""}"
                data-route="${route.id}"
              >
                <span>${route.icon}</span>${route.label}
              </button>
            `,
          )
          .join("")}
      </nav>
      <div class="sidebar-card">
        <p>Pipeline focus</p>
        <strong
          >${state.dealsLoaded
            ? escapeHtml(currency(Math.round(weightedRevenue)))
            : "Live sync"}</strong
        >
        <span>
          ${state.dealsLoaded
            ? `${number(state.deals.length)} ${state.deals.length === 1 ? "deal" : "deals"} across the pipeline`
            : "Open Deals to sync weighted revenue"}
        </span>
      </div>
    </aside>
    <button class="scrim" data-close-nav aria-label="Close navigation"></button>
  `;
}

function renderTopbar() {
  const title =
    routes.find((route) => route.id === state.route)?.label || "Dashboard";
  const profile = getProfile();
  const searchValue = getGlobalSearchValue();
  const searchPlaceholder = getGlobalSearchPlaceholder();

  return html`
    <header class="topbar">
      <button
        class="icon-button mobile-menu"
        data-toggle-nav
        aria-label="Open navigation"
      >
        Menu
      </button>
      <div class="topbar-brand">
        <div class="brand-logo-badge topbar-logo-badge">
          ${renderLogo("badge-logo")}
        </div>
        <div>
          <p class="eyebrow">Pusha CRM</p>
          <h1>${title}</h1>
        </div>
      </div>
      <label class="global-search">
        <span>Search</span>
        <input
          data-global-search
          type="search"
          value="${escapeHtml(searchValue)}"
          placeholder="${escapeHtml(searchPlaceholder)}"
        />
      </label>
      <div class="topbar-actions">
        <div class="profile">
          <img src="${profile.avatar}" alt="${profile.name}" />
          <div>
            <strong>${profile.name}</strong><span>${profile.role}</span>
          </div>
        </div>
        <button
          class="button secondary topbar-signout"
          data-logout
          ${state.authBusy ? "disabled" : ""}
        >
          Sign out
        </button>
      </div>
    </header>
  `;
}

function renderFlashBanner() {
  return html`<div class="flash-banner ${state.flashTone}">
    ${escapeHtml(state.flashMessage)}
  </div>`;
}

function renderSkeleton() {
  return html`<div class="skeleton-grid">
    ${Array.from({ length: 8 })
      .map(() => '<div class="skeleton-card"></div>')
      .join("")}
  </div>`;
}

function renderPage() {
  return {
    dashboard: renderDashboard,
    contacts: renderContacts,
    leads: renderLeads,
    deals: renderDeals,
    clients: renderClients,
    tasks: renderTasks,
    settings: renderSettings,
  }[state.route]();
}

function renderDashboard() {
  const isBlockingError = Boolean(
    state.dashboardError && !areDashboardSourcesLoaded(),
  );

  if (isBlockingError) {
    return renderDashboardStateCard({
      eyebrow: "Dashboard sync",
      title: "We could not load your dashboard.",
      body: state.dashboardError,
      actionLabel: "Try again",
    });
  }

  if (!areDashboardSourcesLoaded()) {
    return renderDashboardLoadingView();
  }

  const metrics = getDashboardMetrics();
  const chart = getDashboardChartData();
  const recentActivity = getDashboardActivityItems();
  const dashboardTasks = getDashboardUpcomingTasks();
  const maxLead = Math.max(0, ...chart.map((item) => item.leads));
  const maxDeal = Math.max(0, ...chart.map((item) => item.deals));
  const hasChartData = chart.some((item) => item.leads || item.deals);

  return html`
    <div class="page-grid dashboard-grid">
      <section class="kpi-row">
        ${metrics
          .map(
            (metric) => html`
              <article class="card kpi-card">
                <span>${metric.label}</span>
                <strong
                  data-counter="${metric.value}"
                  data-prefix="${metric.prefix || ""}"
                  >${metric.prefix
                    ? escapeHtml(currency(metric.value))
                    : escapeHtml(number(metric.value))}</strong
                >
                <small class="${metric.tone}">${metric.change}</small>
              </article>
            `,
          )
          .join("")}
      </section>
      <section class="card chart-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Momentum</p>
            <h2>Weekly performance</h2>
          </div>
          <span class="pill">Supabase live</span>
        </div>
        ${hasChartData
          ? html`
              <div class="bar-chart" aria-label="Weekly leads and deals chart">
                ${chart
                  .map(
                    (item) => html`
                      <div class="bar-group">
                        <div class="bars">
                          <span
                            style="height:${maxLead ? (item.leads / maxLead) * 100 : 0}%; opacity:${item.leads ? 1 : 0.16}"
                          ></span>
                          <span
                            style="height:${maxDeal ? (item.deals / maxDeal) * 100 : 0}%; opacity:${item.deals ? 1 : 0.16}"
                          ></span>
                        </div>
                        <small>${item.label}</small>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
              <p class="helper-text chart-helper">
                Black bars show leads created this week. Gold bars show deals
                created this week.
              </p>
            `
          : `<p class="helper-text">No leads or deals have been created yet this week.</p>`}
      </section>
      <section class="card activity-card">
        <div class="section-head"><h2>Recent activity</h2></div>
        ${recentActivity.length
          ? recentActivity
              .map(
                (item) => html`
                  <div class="activity-row">
                    <span></span>
                    <p>${escapeHtml(item.text)}</p>
                    <small>${escapeHtml(item.time)}</small>
                  </div>
                `,
              )
              .join("")
          : '<p class="helper-text">No recent activity yet. New contacts, leads, deals, and tasks will appear here.</p>'}
      </section>
      <section class="card tasks-card">
        <div class="section-head">
          <h2>Upcoming tasks</h2>
          <button class="text-button" data-route="tasks">View all</button>
        </div>
        ${dashboardTasks.length
          ? dashboardTasks
              .map((task) => {
                const isBusy = String(state.taskStatusBusyId) === String(task.id);

                return html`
                  <label
                    class="dashboard-task-row"
                    for="dashboard-task-${escapeHtml(task.id)}"
                  >
                    <input
                      id="dashboard-task-${escapeHtml(task.id)}"
                      data-dashboard-task-toggle-id="${escapeHtml(task.id)}"
                      type="checkbox"
                      ${isBusy ? "disabled" : ""}
                      aria-label="${escapeHtml(getTaskTitle(task))}"
                    />
                    <div>
                      <strong>${escapeHtml(getTaskTitle(task))}</strong>
                      <span
                        >${escapeHtml(getTaskTypeValue(task))} -
                        ${escapeHtml(getTaskDueDateLabel(task))}</span
                      >
                    </div>
                    <span class="badge ${statusClass(getTaskPriorityValue(task))}"
                      >${escapeHtml(getTaskPriorityValue(task))}</span
                    >
                  </label>
                `;
              })
              .join("")
          : '<p class="helper-text">No open tasks are waiting right now. New follow-ups will show here as soon as they are created.</p>'}
      </section>
    </div>
  `;
}

function renderDashboardStateCard({
  eyebrow,
  title,
  body,
  actionLabel = "",
}) {
  return html`
    <section class="card dashboard-state-card">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(body)}</p>
      ${actionLabel
        ? `<button class="button secondary" type="button" data-dashboard-reload>${escapeHtml(actionLabel)}</button>`
        : ""}
    </section>
  `;
}

function renderDashboardLoadingView() {
  return html`
    <div class="page-grid dashboard-grid dashboard-loading-view" aria-busy="true">
      <section class="kpi-row">
        ${Array.from({ length: 4 })
          .map(
            () => html`
              <article class="card kpi-card dashboard-loading-card">
                <div class="dashboard-loading-copy short"></div>
                <div class="dashboard-loading-copy tall"></div>
                <div class="dashboard-loading-copy medium"></div>
              </article>
            `,
          )
          .join("")}
      </section>
      <section class="card chart-card dashboard-loading-card">
        <div class="section-head">
          <div>
            <div class="dashboard-loading-copy short"></div>
            <div class="dashboard-loading-copy medium"></div>
          </div>
        </div>
        <div class="dashboard-loading-chart"></div>
      </section>
      <section class="card activity-card dashboard-loading-card">
        <div class="dashboard-loading-copy medium"></div>
        ${Array.from({ length: 5 })
          .map(() => '<div class="task-loading-row"></div>')
          .join("")}
      </section>
      <section class="card tasks-card dashboard-loading-card">
        <div class="dashboard-loading-copy medium"></div>
        ${Array.from({ length: 5 })
          .map(() => '<div class="task-loading-row"></div>')
          .join("")}
      </section>
    </div>
  `;
}

function renderContacts() {
  const companyOptions = [
    "All",
    ...new Set(
      state.contacts
        .map((contact) => (contact.company || "").trim())
        .filter(Boolean),
    ),
  ].sort((left, right) => left.localeCompare(right));
  const statusOptions = [
    "All",
    ...new Set(
      state.contacts
        .map((contact) => getContactStatusValue(contact))
        .filter(Boolean),
    ),
  ];
  const sourceOptions = [
    "All",
    ...new Set(
      state.contacts
        .map((contact) => (contact.source || "").trim())
        .filter(Boolean),
    ),
  ].sort((left, right) => left.localeCompare(right));
  const query = state.contactsQuery.trim().toLowerCase();
  const activeFilters =
    Boolean(query) ||
    state.contactsCompany !== "All" ||
    state.contactsStatus !== "All" ||
    state.contactsSource !== "All";
  const contacts = state.contacts.filter((contact) => {
    const matchesQuery = [
      contact.first_name,
      contact.last_name,
      contact.email,
      contact.company,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
    const matchesCompany =
      state.contactsCompany === "All" ||
      (contact.company || "").trim() === state.contactsCompany;
    const matchesStatus =
      state.contactsStatus === "All" ||
      getContactStatusValue(contact) === state.contactsStatus;
    const matchesSource =
      state.contactsSource === "All" ||
      (contact.source || "").trim() === state.contactsSource;

    return matchesQuery && matchesCompany && matchesStatus && matchesSource;
  });
  const companyCount = new Set(
    state.contacts
      .map((contact) => (contact.company || "").trim())
      .filter(Boolean),
  ).size;
  const newestContact = state.contacts[0];

  return html`
    <div class="page-stack">
      <section class="card contacts-summary">
        <div class="contacts-summary-copy">
          <p class="eyebrow">Relationship hub</p>
          <h2>Organization contacts</h2>
          <p>
            Keep every buyer, champion, and customer contact inside your
            workspace with fast search, segmentation, and clean handoff
            visibility.
          </p>
        </div>
        <div class="contacts-summary-stats">
          <article>
            <span>Total contacts</span>
            <strong>${number(state.contacts.length)}</strong>
          </article>
          <article>
            <span>Companies</span>
            <strong>${number(companyCount)}</strong>
          </article>
          <article>
            <span>Newest added</span>
            <strong
              >${newestContact
                ? escapeHtml(formatDate(newestContact.created_at))
                : "No contacts yet"}</strong
            >
          </article>
        </div>
      </section>

      <section class="toolbar contacts-toolbar">
        <label class="search-field">
          Search contacts
          <input
            data-contact-search
            type="search"
            value="${escapeHtml(state.contactsQuery)}"
            placeholder="First name, last name, email, company"
          />
        </label>
        <label class="select-field"
          >Company<select data-contact-company>
            ${companyOptions
              .map(
                (company) =>
                  `<option ${company === state.contactsCompany ? "selected" : ""}>${escapeHtml(company)}</option>`,
              )
              .join("")}
          </select></label
        >
        <label class="select-field"
          >Status<select data-contact-status>
            ${statusOptions
              .map(
                (status) =>
                  `<option ${status === state.contactsStatus ? "selected" : ""}>${escapeHtml(status)}</option>`,
              )
              .join("")}
          </select></label
        >
        <label class="select-field"
          >Source<select data-contact-source>
            ${sourceOptions
              .map(
                (source) =>
                  `<option ${source === state.contactsSource ? "selected" : ""}>${escapeHtml(source)}</option>`,
              )
              .join("")}
          </select></label
        >
        <div class="contacts-toolbar-actions">
          <button
            class="button secondary"
            type="button"
            data-contacts-reload
            ${state.contactsLoading ? "disabled" : ""}
          >
            ${state.contactsLoading ? "Refreshing..." : "Refresh"}
          </button>
          <button class="button primary" type="button" data-open-contact-create>
            Add contact
          </button>
        </div>
      </section>

      ${state.contactsError && state.contactsLoaded
        ? `<div class="flash-banner error">${escapeHtml(state.contactsError)}</div>`
        : ""}
      ${!state.contactsLoaded && state.contactsLoading
        ? renderContactsLoading()
        : !state.contactsLoaded && state.contactsError
          ? renderContactsError()
          : contacts.length
            ? renderContactsTable(contacts, activeFilters)
            : renderContactsEmpty(activeFilters)}
    </div>
  `;
}

function renderContactsLoading() {
  return html`
    <section class="card contacts-state-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">Sync in progress</p>
          <h2>Loading contacts</h2>
        </div>
        <span class="pill">Supabase</span>
      </div>
      <div class="contacts-loading-list">
        ${Array.from({ length: 5 })
          .map(() => '<div class="contact-loading-row"></div>')
          .join("")}
      </div>
    </section>
  `;
}

function renderContactsError() {
  return html`
    <section class="card contacts-state-card">
      <p class="eyebrow">Contacts unavailable</p>
      <h2>We could not load your organization contacts.</h2>
      <p>${escapeHtml(state.contactsError || "Try again in a moment.")}</p>
      <div class="contacts-state-actions">
        <button class="button secondary" type="button" data-contacts-reload>
          Try again
        </button>
      </div>
    </section>
  `;
}

function renderContactsEmpty(activeFilters) {
  return html`
    <section class="card contacts-state-card">
      <p class="eyebrow">${activeFilters ? "No matches" : "No contacts yet"}</p>
      <h2>
        ${activeFilters
          ? "No contacts match this view."
          : "Start your contact book here."}
      </h2>
      <p>
        ${activeFilters
          ? "Change the search or filters to widen the results."
          : "Add the first contact for your organization and keep the rest of your pipeline linked to real people."}
      </p>
      <div class="contacts-state-actions">
        ${activeFilters
          ? '<button class="button secondary" type="button" data-clear-contact-filters>Clear filters</button>'
          : '<button class="button primary" type="button" data-open-contact-create>Add first contact</button>'}
      </div>
    </section>
  `;
}

function renderContactsTable(contacts, activeFilters) {
  return html`
    <section class="card contacts-table-card">
      <div class="section-head contacts-section-head">
        <div>
          <p class="eyebrow">Workspace directory</p>
          <h2>
            ${number(contacts.length)}
            ${contacts.length === 1 ? "contact" : "contacts"}
          </h2>
        </div>
        ${activeFilters
          ? '<button class="text-button" type="button" data-clear-contact-filters>Clear filters</button>'
          : `<span class="pill">${state.contactsLoading ? "Refreshing..." : "Newest first"}</span>`}
      </div>

      <div class="contacts-table" aria-label="Contacts table">
        <div class="contacts-table-head">
          <span>Contact</span>
          <span>Company</span>
          <span>Source</span>
          <span>Status</span>
          <span>Created</span>
          <span>Actions</span>
        </div>
        ${contacts
          .map((contact) => {
            const name = getContactName(contact);
            const notePreview =
              contact.notes && contact.notes.length > 72
                ? `${contact.notes.slice(0, 72).trim()}...`
                : contact.notes || "No notes yet";

            return html`
              <article class="contact-row">
                <div class="contact-primary-cell">
                  <div class="contact-avatar" aria-hidden="true">
                    ${escapeHtml(getContactInitials(contact))}
                  </div>
                  <div class="contact-primary-copy">
                    <strong>${escapeHtml(name)}</strong>
                    ${contact.email
                      ? `<a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>`
                      : "<small>No email added</small>"}
                    <small
                      >${escapeHtml(contact.phone || "No phone added")}</small
                    >
                  </div>
                </div>

                <div class="contact-meta-cell">
                  <span class="contact-cell-label">Company</span>
                  <strong
                    >${escapeHtml(contact.company || "Independent")}</strong
                  >
                  <small
                    >${escapeHtml(contact.job_title || "No job title")}</small
                  >
                </div>

                <div class="contact-meta-cell">
                  <span class="contact-cell-label">Source</span>
                  <strong>${escapeHtml(contact.source || "Manual")}</strong>
                  <small>${escapeHtml(notePreview)}</small>
                </div>

                <div class="contact-status-cell">
                  <span class="contact-cell-label">Status</span>
                  <span
                    class="status ${statusClass(
                      getContactStatusValue(contact),
                    )}"
                  >
                    ${escapeHtml(getContactStatusValue(contact))}
                  </span>
                </div>

                <div class="contact-meta-cell">
                  <span class="contact-cell-label">Created</span>
                  <strong>${escapeHtml(formatDate(contact.created_at))}</strong>
                  <small
                    >${escapeHtml(
                      contact.created_by ? "Workspace member" : "Imported",
                    )}</small
                  >
                </div>

                <div class="contact-actions-cell">
                  <span class="contact-cell-label">Actions</span>
                  <button
                    class="text-button"
                    type="button"
                    data-edit-contact-id="${escapeHtml(contact.id)}"
                  >
                    Edit
                  </button>
                  <button
                    class="text-button danger-text"
                    type="button"
                    data-delete-contact-id="${escapeHtml(contact.id)}"
                  >
                    Delete
                  </button>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderContactFormModal() {
  const statusOptions = [
    ...new Set(
      [
        ...contactStatusPresets,
        ...state.contacts.map((contact) => getContactStatusValue(contact)),
        state.contactForm.status,
      ].filter(Boolean),
    ),
  ];
  const isEdit = state.contactFormMode === "edit";

  return html`
    <div class="overlay centered" data-close-contact-form>
      <section
        class="modal contact-modal"
        role="dialog"
        aria-label="${isEdit ? "Edit contact" : "Add contact"}"
      >
        <button class="icon-button close" data-close-contact-form>Close</button>
        <p class="eyebrow">${isEdit ? "Edit contact" : "New contact"}</p>
        <h2>
          ${isEdit ? "Update contact details" : "Add a workspace contact"}
        </h2>
        <p class="helper-text">
          Contacts stay scoped to your organization automatically and use the
          existing Supabase access rules already configured for Pusha CRM.
        </p>
        ${state.contactFormError
          ? `<p class="auth-message error">${escapeHtml(state.contactFormError)}</p>`
          : ""}
        <form class="contact-form" data-contact-form>
          <div class="contact-form-grid">
            <label
              >First name
              <input
                data-contact-field="firstName"
                type="text"
                value="${escapeHtml(state.contactForm.firstName)}"
                required
              />
            </label>
            <label
              >Last name
              <input
                data-contact-field="lastName"
                type="text"
                value="${escapeHtml(state.contactForm.lastName)}"
              />
            </label>
            <label
              >Email
              <input
                data-contact-field="email"
                type="email"
                value="${escapeHtml(state.contactForm.email)}"
                placeholder="name@company.com"
              />
            </label>
            <label
              >Phone
              <input
                data-contact-field="phone"
                type="tel"
                value="${escapeHtml(state.contactForm.phone)}"
                placeholder="+27 82 123 4567"
              />
            </label>
            <label
              >Company
              <input
                data-contact-field="company"
                type="text"
                value="${escapeHtml(state.contactForm.company)}"
              />
            </label>
            <label
              >Job title
              <input
                data-contact-field="jobTitle"
                type="text"
                value="${escapeHtml(state.contactForm.jobTitle)}"
              />
            </label>
            <label
              >Source
              <input
                data-contact-field="source"
                type="text"
                value="${escapeHtml(state.contactForm.source)}"
                placeholder="Referral, Website, Event"
              />
            </label>
            <label
              >Status
              <select data-contact-field="status">
                ${statusOptions
                  .map(
                    (status) =>
                      `<option ${status === state.contactForm.status ? "selected" : ""}>${escapeHtml(status)}</option>`,
                  )
                  .join("")}
              </select>
            </label>
          </div>
          <label
            >Notes
            <textarea
              data-contact-field="notes"
              rows="5"
              placeholder="Add context, buying signals, or next-step notes"
            >
${escapeHtml(state.contactForm.notes)}</textarea
            >
          </label>
          <div class="contact-form-actions">
            <button
              class="button secondary"
              type="button"
              data-close-contact-form
            >
              Cancel
            </button>
            <button
              class="button primary"
              type="submit"
              ${state.contactFormBusy ? "disabled" : ""}
            >
              ${state.contactFormBusy
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save changes"
                  : "Create contact"}
            </button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderContactDeleteModal() {
  const contact = findContactById(state.contactDeleteId);

  if (!contact) return "";

  return html`
    <div class="overlay centered" data-close-contact-delete>
      <section
        class="modal confirm-modal"
        role="dialog"
        aria-label="Delete contact"
      >
        <button class="icon-button close" data-close-contact-delete>
          Close
        </button>
        <p class="eyebrow">Delete contact</p>
        <h2>Remove ${escapeHtml(getContactName(contact))}?</h2>
        <p>
          This will permanently delete the contact from your organization
          workspace. Make sure the team no longer needs this record before you
          continue.
        </p>
        ${state.contactDeleteError
          ? `<p class="auth-message error">${escapeHtml(state.contactDeleteError)}</p>`
          : ""}
        <div class="contact-form-actions">
          <button
            class="button secondary"
            type="button"
            data-close-contact-delete
          >
            Cancel
          </button>
          <button
            class="button danger-button"
            type="button"
            data-confirm-contact-delete
            ${state.contactDeleteBusy ? "disabled" : ""}
          >
            ${state.contactDeleteBusy ? "Deleting..." : "Delete contact"}
          </button>
        </div>
      </section>
    </div>
  `;
}

function renderLeads() {
  const statuses = getLeadStatusOptions();
  const query = state.leadQuery.trim().toLowerCase();
  const activeFilters = Boolean(query) || state.leadStatus !== "All";
  const leads = state.leads.filter((lead) => {
    const matchesQuery = [
      lead.lead_name,
      lead.company,
      lead.source,
      getLeadStatusValue(lead),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
    const matchesStatus =
      state.leadStatus === "All" ||
      getLeadStatusValue(lead) === state.leadStatus;

    return matchesQuery && matchesStatus;
  });
  const openLeadCount = state.leads.filter(
    (lead) => !["Won", "Lost"].includes(getLeadStatusValue(lead)),
  ).length;
  const totalValue = state.leads.reduce(
    (sum, lead) => sum + getLeadValueNumber(lead),
    0,
  );
  const weightedValue = state.leads.reduce(
    (sum, lead) =>
      sum + getLeadValueNumber(lead) * (getLeadProbabilityNumber(lead) / 100),
    0,
  );
  const newestLead = state.leads[0];

  return html`
    <div class="page-stack">
      <section class="card leads-summary">
        <div class="leads-summary-copy">
          <p class="eyebrow">Pipeline capture</p>
          <h2>Organization leads</h2>
          <p>
            Track every fresh opportunity for your workspace with clean
            qualification, weighted forecasting, and fast handoff into the next
            revenue step.
          </p>
        </div>
        <div class="leads-summary-stats">
          <article>
            <span>Total leads</span>
            <strong>${number(state.leads.length)}</strong>
          </article>
          <article>
            <span>Open pipeline</span>
            <strong>${number(openLeadCount)}</strong>
          </article>
          <article>
            <span>Lead value</span>
            <strong>${currency(totalValue)}</strong>
          </article>
          <article>
            <span>Weighted forecast</span>
            <strong>${currency(Math.round(weightedValue))}</strong>
          </article>
        </div>
      </section>

      <section class="toolbar leads-toolbar">
        <label class="search-field">
          Search leads
          <input
            data-lead-search
            type="search"
            value="${escapeHtml(state.leadQuery)}"
            placeholder="Lead name, company, source, status"
          />
        </label>
        <label class="select-field"
          >Status<select data-lead-status>
            ${statuses
              .map(
                (status) =>
                  `<option ${status === state.leadStatus ? "selected" : ""}>${escapeHtml(status)}</option>`,
              )
              .join("")}
          </select></label
        >
        <div class="leads-toolbar-actions">
          <button
            class="button secondary"
            type="button"
            data-leads-reload
            ${state.leadsLoading ? "disabled" : ""}
          >
            ${state.leadsLoading ? "Refreshing..." : "Refresh"}
          </button>
          <button class="button primary" type="button" data-open-lead-create>
            Add lead
          </button>
        </div>
      </section>

      ${state.leadsError && state.leadsLoaded
        ? `<div class="flash-banner error">${escapeHtml(state.leadsError)}</div>`
        : ""}
      ${!state.leadsLoaded && state.leadsLoading
        ? renderLeadsLoading()
        : !state.leadsLoaded && state.leadsError
          ? renderLeadsError()
          : leads.length
            ? renderLeadsTable(leads, activeFilters, newestLead)
            : renderLeadsEmpty(activeFilters)}
    </div>
  `;
}

function renderLeadsLoading() {
  return html`
    <section class="card leads-state-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">Sync in progress</p>
          <h2>Loading leads</h2>
        </div>
        <span class="pill">Supabase</span>
      </div>
      <div class="leads-loading-list">
        ${Array.from({ length: 5 })
          .map(() => '<div class="lead-loading-row"></div>')
          .join("")}
      </div>
    </section>
  `;
}

function renderLeadsError() {
  return html`
    <section class="card leads-state-card">
      <p class="eyebrow">Leads unavailable</p>
      <h2>We could not load your organization leads.</h2>
      <p>${escapeHtml(state.leadsError || "Try again in a moment.")}</p>
      <div class="leads-state-actions">
        <button class="button secondary" type="button" data-leads-reload>
          Try again
        </button>
      </div>
    </section>
  `;
}

function renderLeadsEmpty(activeFilters) {
  return html`
    <section class="card leads-state-card">
      <p class="eyebrow">${activeFilters ? "No matches" : "No leads yet"}</p>
      <h2>
        ${activeFilters
          ? "No leads match this view."
          : "Build your lead pipeline here."}
      </h2>
      <p>
        ${activeFilters
          ? "Adjust the search or status filter to widen the results."
          : "Add the first lead for your organization and keep opportunity momentum visible from day one."}
      </p>
      <div class="leads-state-actions">
        ${activeFilters
          ? '<button class="button secondary" type="button" data-clear-lead-filters>Clear filters</button>'
          : '<button class="button primary" type="button" data-open-lead-create>Add first lead</button>'}
      </div>
    </section>
  `;
}

function renderLeadsTable(leads, activeFilters, newestLead) {
  return html`
    <section class="card leads-table-card">
      <div class="section-head leads-section-head">
        <div>
          <p class="eyebrow">Revenue queue</p>
          <h2>
            ${number(leads.length)} ${leads.length === 1 ? "lead" : "leads"}
          </h2>
        </div>
        ${activeFilters
          ? '<button class="text-button" type="button" data-clear-lead-filters>Clear filters</button>'
          : `<span class="pill">${newestLead ? `Newest: ${escapeHtml(formatDate(newestLead.created_at))}` : "Newest first"}</span>`}
      </div>

      <div class="leads-table" aria-label="Leads table">
        <div class="leads-table-head">
          <span>Lead</span>
          <span>Company</span>
          <span>Source</span>
          <span>Status</span>
          <span>Forecast</span>
          <span>Actions</span>
        </div>
        ${leads
          .map((lead) => {
            const contact = getLeadContact(lead.contact_id);

            return html`
              <article class="lead-row">
                <div class="lead-primary-cell">
                  <div class="lead-avatar" aria-hidden="true">
                    ${escapeHtml(getLeadInitials(lead))}
                  </div>
                  <div class="lead-primary-copy">
                    <strong>${escapeHtml(getLeadName(lead))}</strong>
                    <small>${escapeHtml(getLeadContactLabel(lead))}</small>
                    <small>${escapeHtml(getLeadNotePreview(lead))}</small>
                  </div>
                </div>

                <div class="lead-meta-cell">
                  <span class="lead-cell-label">Company</span>
                  <strong>${escapeHtml(lead.company || "Independent")}</strong>
                  <small
                    >${escapeHtml(
                      contact?.job_title || "No linked title",
                    )}</small
                  >
                </div>

                <div class="lead-meta-cell">
                  <span class="lead-cell-label">Source</span>
                  <strong>${escapeHtml(lead.source || "Manual")}</strong>
                  <small>${escapeHtml(formatDate(lead.created_at))}</small>
                </div>

                <div class="lead-status-cell">
                  <span class="lead-cell-label">Status</span>
                  <span class="status ${statusClass(getLeadStatusValue(lead))}">
                    ${escapeHtml(getLeadStatusValue(lead))}
                  </span>
                  <small
                    >${escapeHtml(formatProbability(lead.probability))}</small
                  >
                </div>

                <div class="lead-value-cell">
                  <span class="lead-cell-label">Forecast</span>
                  <strong>${escapeHtml(formatLeadValue(lead.value))}</strong>
                  <small>${escapeHtml(getLeadCloseDateLabel(lead))}</small>
                </div>

                <div class="lead-actions-cell">
                  <span class="lead-cell-label">Actions</span>
                  <button
                    class="text-button"
                    type="button"
                    data-edit-lead-id="${escapeHtml(lead.id)}"
                  >
                    Edit
                  </button>
                  <button
                    class="text-button danger-text"
                    type="button"
                    data-delete-lead-id="${escapeHtml(lead.id)}"
                  >
                    Delete
                  </button>
                  <button
                    class="text-button"
                    type="button"
                    data-create-deal-from-lead-id="${escapeHtml(lead.id)}"
                  >
                    Create deal
                  </button>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderLeadFormModal() {
  const contactOptions = [...state.contacts].sort((left, right) =>
    getContactName(left).localeCompare(getContactName(right)),
  );
  const statusOptions = [
    ...new Set(
      [
        ...leadStatusPresets,
        ...state.leads.map((lead) => getLeadStatusValue(lead)),
        state.leadForm.status,
      ].filter(Boolean),
    ),
  ];
  const isEdit = state.leadFormMode === "edit";
  const contactsHelper = state.contactsLoading
    ? "Loading contacts for linking..."
    : state.contactsError
      ? "Contacts could not be loaded right now. You can still save the lead without linking a contact."
      : "Optionally link this lead to an existing contact in your workspace.";

  return html`
    <div class="overlay centered" data-close-lead-form>
      <section
        class="modal contact-modal lead-modal"
        role="dialog"
        aria-label="${isEdit ? "Edit lead" : "Add lead"}"
      >
        <button class="icon-button close" data-close-lead-form>Close</button>
        <p class="eyebrow">${isEdit ? "Edit lead" : "New lead"}</p>
        <h2>${isEdit ? "Update lead details" : "Capture a new opportunity"}</h2>
        <p class="helper-text">
          Leads stay scoped to your organization automatically and inherit the
          active workspace member as the default owner.
        </p>
        ${state.leadFormError
          ? `<p class="auth-message error">${escapeHtml(state.leadFormError)}</p>`
          : ""}
        <form class="contact-form lead-form" data-lead-form>
          <div class="contact-form-grid lead-form-grid">
            <label
              >Lead name
              <input
                data-lead-field="leadName"
                type="text"
                value="${escapeHtml(state.leadForm.leadName)}"
                placeholder="Halo Retail expansion"
                required
              />
            </label>
            <label
              >Company
              <input
                data-lead-field="company"
                type="text"
                value="${escapeHtml(state.leadForm.company)}"
                placeholder="Halo Retail Group"
              />
            </label>
            <label
              >Contact
              <select data-lead-field="contactId">
                <option value="">No contact selected</option>
                ${contactOptions
                  .map((contact) => {
                    const selected =
                      String(contact.id) === String(state.leadForm.contactId)
                        ? "selected"
                        : "";
                    return `<option value="${escapeHtml(contact.id)}" ${selected}>${escapeHtml(getContactName(contact))}</option>`;
                  })
                  .join("")}
              </select>
              <span class="helper-text">${escapeHtml(contactsHelper)}</span>
            </label>
            <label
              >Status
              <select data-lead-field="status">
                ${statusOptions
                  .map(
                    (status) =>
                      `<option ${status === state.leadForm.status ? "selected" : ""}>${escapeHtml(status)}</option>`,
                  )
                  .join("")}
              </select>
            </label>
            <label
              >Source
              <input
                data-lead-field="source"
                type="text"
                value="${escapeHtml(state.leadForm.source)}"
                placeholder="Referral, Website, Event"
              />
            </label>
            <label
              >Value
              <input
                data-lead-field="value"
                type="number"
                min="0"
                step="1"
                value="${escapeHtml(state.leadForm.value)}"
                placeholder="85000"
              />
            </label>
            <label
              >Probability
              <input
                data-lead-field="probability"
                type="number"
                min="0"
                max="100"
                step="1"
                value="${escapeHtml(state.leadForm.probability)}"
                placeholder="60"
              />
            </label>
            <label
              >Expected close date
              <input
                data-lead-field="expectedCloseDate"
                type="date"
                value="${escapeHtml(state.leadForm.expectedCloseDate)}"
              />
            </label>
          </div>
          <label
            >Notes
            <textarea
              data-lead-field="notes"
              rows="5"
              placeholder="Add qualification notes, blockers, or next steps"
            >
${escapeHtml(state.leadForm.notes)}</textarea
            >
          </label>
          <div class="contact-form-actions">
            <button class="button secondary" type="button" data-close-lead-form>
              Cancel
            </button>
            <button
              class="button primary"
              type="submit"
              ${state.leadFormBusy ? "disabled" : ""}
            >
              ${state.leadFormBusy
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save changes"
                  : "Create lead"}
            </button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderLeadDeleteModal() {
  const lead = findLeadById(state.leadDeleteId);

  if (!lead) return "";

  return html`
    <div class="overlay centered" data-close-lead-delete>
      <section
        class="modal confirm-modal"
        role="dialog"
        aria-label="Delete lead"
      >
        <button class="icon-button close" data-close-lead-delete>Close</button>
        <p class="eyebrow">Delete lead</p>
        <h2>Remove ${escapeHtml(getLeadName(lead))}?</h2>
        <p>
          This will permanently delete the lead from your organization
          workspace. Make sure the team no longer needs this opportunity before
          you continue.
        </p>
        ${state.leadDeleteError
          ? `<p class="auth-message error">${escapeHtml(state.leadDeleteError)}</p>`
          : ""}
        <div class="contact-form-actions">
          <button class="button secondary" type="button" data-close-lead-delete>
            Cancel
          </button>
          <button
            class="button danger-button"
            type="button"
            data-confirm-lead-delete
            ${state.leadDeleteBusy ? "disabled" : ""}
          >
            ${state.leadDeleteBusy ? "Deleting..." : "Delete lead"}
          </button>
        </div>
      </section>
    </div>
  `;
}

function renderDeals() {
  const statuses = getDealStageOptions();
  const query = state.dealQuery.trim().toLowerCase();
  const activeFilters = Boolean(query) || state.dealStage !== "All";
  const deals = state.deals.filter((deal) => {
    const matchesQuery = [deal.deal_name, deal.company, getDealStageValue(deal)]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
    const matchesStage =
      state.dealStage === "All" || getDealStageValue(deal) === state.dealStage;

    return matchesQuery && matchesStage;
  });
  const openDealCount = state.deals.filter(
    (deal) => !["Won", "Lost"].includes(getDealStageValue(deal)),
  ).length;
  const totalValue = state.deals.reduce(
    (sum, deal) => sum + getDealValueNumber(deal),
    0,
  );
  const weightedValue = state.deals.reduce(
    (sum, deal) =>
      sum + getDealValueNumber(deal) * (getDealProbabilityNumber(deal) / 100),
    0,
  );
  const wonValue = state.deals
    .filter((deal) => getDealStageValue(deal) === "Won")
    .reduce((sum, deal) => sum + getDealValueNumber(deal), 0);
  const newestDeal = state.deals[0];

  return html`
    <div class="page-stack">
      <section class="card deals-summary">
        <div class="deals-summary-copy">
          <div class="summary-tooltip">
            <button
              class="summary-tooltip-trigger eyebrow"
              type="button"
              aria-describedby="revenue-command-tooltip"
            >
              Revenue command
            </button>
            <div
              class="summary-tooltip-box"
              id="revenue-command-tooltip"
              role="tooltip"
            >
              Keep every active deal inside a stage-based workflow with fast
              movement, linked contacts and leads, and live pipeline totals for
              your organization.
            </div>
          </div>
        </div>
        <div class="deals-summary-stats">
          <article>
            <span>Total deals</span>
            <strong>${number(state.deals.length)}</strong>
          </article>
          <article>
            <span>Open pipeline</span>
            <strong>${number(openDealCount)}</strong>
          </article>
          <article>
            <span>Pipeline value</span>
            <strong>${currency(totalValue)}</strong>
          </article>
          <article>
            <span>Weighted forecast</span>
            <strong>${currency(Math.round(weightedValue))}</strong>
          </article>
          <article>
            <span>Won value</span>
            <strong>${currency(wonValue)}</strong>
          </article>
        </div>
      </section>

      <section class="toolbar deals-toolbar">
        <label class="search-field">
          Search deals
          <input
            data-deal-search
            type="search"
            value="${escapeHtml(state.dealQuery)}"
            placeholder="Deal name, company, stage"
          />
        </label>
        <label class="select-field"
          >Stage<select data-deal-stage>
            ${statuses
              .map(
                (status) =>
                  `<option ${status === state.dealStage ? "selected" : ""}>${escapeHtml(status)}</option>`,
              )
              .join("")}
          </select></label
        >
        <div class="deals-toolbar-actions">
          <button
            class="button secondary"
            type="button"
            data-deals-reload
            ${state.dealsLoading ? "disabled" : ""}
          >
            ${state.dealsLoading ? "Refreshing..." : "Refresh"}
          </button>
          <button class="button primary" type="button" data-open-deal-create>
            Add deal
          </button>
        </div>
      </section>

      ${state.dealsError && state.dealsLoaded
        ? `<div class="flash-banner error">${escapeHtml(state.dealsError)}</div>`
        : ""}
      ${!state.dealsLoaded && state.dealsLoading
        ? renderDealsLoading()
        : !state.dealsLoaded && state.dealsError
          ? renderDealsError()
          : deals.length
            ? renderDealsBoard(deals, activeFilters, newestDeal)
            : renderDealsEmpty(activeFilters)}
    </div>
  `;
}

function renderDealsLoading() {
  return html`
    <section class="card deals-state-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">Sync in progress</p>
          <h2>Loading deals</h2>
        </div>
        <span class="pill">Supabase</span>
      </div>
      <div class="deals-loading-board">
        ${Array.from({ length: dealStagePresets.length })
          .map(
            () => html`
              <div class="kanban-column deals-column">
                <div class="deal-loading-card"></div>
                <div class="deal-loading-card"></div>
                <div class="deal-loading-card"></div>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderDealsError() {
  return html`
    <section class="card deals-state-card">
      <p class="eyebrow">Deals unavailable</p>
      <h2>We could not load your organization deals.</h2>
      <p>${escapeHtml(state.dealsError || "Try again in a moment.")}</p>
      <div class="deals-state-actions">
        <button class="button secondary" type="button" data-deals-reload>
          Try again
        </button>
      </div>
    </section>
  `;
}

function renderDealsEmpty(activeFilters) {
  return html`
    <section class="card deals-state-card">
      <p class="eyebrow">${activeFilters ? "No matches" : "No deals yet"}</p>
      <h2>
        ${activeFilters
          ? "No deals match this view."
          : "Start your sales pipeline here."}
      </h2>
      <p>
        ${activeFilters
          ? "Adjust the search or stage filter to widen the current board."
          : "Add the first deal for your organization and track it from prospecting all the way to closed revenue."}
      </p>
      <div class="deals-state-actions">
        ${activeFilters
          ? '<button class="button secondary" type="button" data-clear-deal-filters>Clear filters</button>'
          : '<button class="button primary" type="button" data-open-deal-create>Add first deal</button>'}
      </div>
    </section>
  `;
}

function renderDealsBoard(deals, activeFilters, newestDeal) {
  const visibleStages =
    state.dealStage === "All" ? dealStagePresets : [state.dealStage];

  return html`
    <section class="card deals-board-card">
      <div class="section-head deals-section-head">
        <div>
          <p class="eyebrow">Revenue pipeline</p>
          <h2>
            ${number(deals.length)} ${deals.length === 1 ? "deal" : "deals"}
          </h2>
        </div>
        ${activeFilters
          ? '<button class="text-button" type="button" data-clear-deal-filters>Clear filters</button>'
          : `<span class="pill">${newestDeal ? `Newest: ${escapeHtml(formatDate(newestDeal.created_at))}` : "Newest first"}</span>`}
      </div>

      <div class="kanban deals-kanban" aria-label="Deals pipeline">
        ${visibleStages
          .map((stage) => {
            const stageDeals = deals.filter(
              (deal) => getDealStageValue(deal) === stage,
            );
            const stageValue = stageDeals.reduce(
              (sum, deal) => sum + getDealValueNumber(deal),
              0,
            );

            return html`
              <section
                class="kanban-column deals-column"
                data-stage="${escapeHtml(stage)}"
              >
                <div class="kanban-head deals-kanban-head">
                  <div class="deals-column-copy">
                    <div class="deals-stage-row">
                      <h2>${escapeHtml(stage)}</h2>
                      <span>${number(stageDeals.length)}</span>
                    </div>
                    <small
                      >Total value ${escapeHtml(currency(stageValue))}</small
                    >
                  </div>
                </div>

                <div class="deals-column-stack">
                  ${stageDeals.length
                    ? stageDeals
                        .map((deal) => {
                          const isStageSaving =
                            String(state.dealStageBusyId) === String(deal.id);
                          const hasStageError =
                            String(state.dealStageErrorId) ===
                              String(deal.id) && state.dealStageError;

                          return html`
                            <article
                              class="deal-card deal-board-card"
                              draggable="true"
                              data-deal-id="${escapeHtml(deal.id)}"
                              data-open-deal-detail-id="${escapeHtml(deal.id)}"
                              tabindex="0"
                              role="button"
                              aria-label="Open deal ${escapeHtml(
                                getDealName(deal),
                              )}"
                            >
                              <div class="deal-card-top">
                                <div class="deal-avatar" aria-hidden="true">
                                  ${escapeHtml(getDealInitials(deal))}
                                </div>
                                <span
                                  class="status ${statusClass(
                                    getDealStageValue(deal),
                                  )}"
                                >
                                  ${escapeHtml(getDealStageValue(deal))}
                                </span>
                              </div>

                              <div class="deal-card-copy">
                                <strong
                                  >${escapeHtml(getDealName(deal))}</strong
                                >
                                <span
                                  >${escapeHtml(
                                    deal.company || "No company added",
                                  )}</span
                                >
                              </div>

                              <div class="deal-card-summary">
                                <b
                                  >${escapeHtml(formatLeadValue(deal.value))}</b
                                >
                                <small
                                  >${escapeHtml(
                                    formatProbability(deal.probability),
                                  )}</small
                                >
                              </div>

                              <div class="deal-card-footer">
                                <small
                                  >${escapeHtml(
                                    getDealContactLabel(deal),
                                  )}</small
                                >
                                <small
                                  >Close
                                  ${escapeHtml(
                                    getDealCloseDateLabel(deal),
                                  )}</small
                                >
                              </div>

                              ${isStageSaving
                                ? '<p class="helper-text">Saving move...</p>'
                                : ""}
                              ${hasStageError
                                ? `<p class="helper-text danger-text">${escapeHtml(state.dealStageError)}</p>`
                                : ""}
                            </article>
                          `;
                        })
                        .join("")
                    : '<div class="deals-column-empty">Drop a deal here or open a deal to update its stage.</div>'}
                </div>
              </section>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderDealDetailModal() {
  const deal = findDealById(state.selectedDealId);

  if (!deal) return "";

  const isStageSaving = String(state.dealStageBusyId) === String(deal.id);
  const hasStageError =
    String(state.dealStageErrorId) === String(deal.id) && state.dealStageError;

  return html`
    <div class="overlay centered" data-close-deal-detail>
      <section
        class="modal contact-modal deal-modal deal-detail-modal"
        role="dialog"
        aria-label="Deal detail"
      >
        <button class="icon-button close" data-close-deal-detail>Close</button>
        <p class="eyebrow">Deal detail</p>
        <div class="deal-detail-header">
          <div>
            <h2>${escapeHtml(getDealName(deal))}</h2>
            <p class="helper-text">
              ${escapeHtml(deal.company || "No company added")}
            </p>
          </div>
          <div class="deal-detail-summary">
            <span class="status ${statusClass(getDealStageValue(deal))}">
              ${escapeHtml(getDealStageValue(deal))}
            </span>
            <strong>${escapeHtml(formatLeadValue(deal.value))}</strong>
          </div>
        </div>

        <div class="deal-detail-grid">
          <article>
            <span>Probability</span>
            <strong>${escapeHtml(formatProbability(deal.probability))}</strong>
          </article>
          <article>
            <span>Expected close</span>
            <strong>${escapeHtml(getDealCloseDateLabel(deal))}</strong>
          </article>
          <article>
            <span>Contact</span>
            <strong>${escapeHtml(getDealContactLabel(deal))}</strong>
          </article>
          <article>
            <span>Lead</span>
            <strong>${escapeHtml(getDealLeadLabel(deal))}</strong>
          </article>
        </div>

        <div class="deal-detail-section">
          <label class="deal-stage-field">
            <span>Move stage</span>
            <select
              data-deal-stage-id="${escapeHtml(deal.id)}"
              ${isStageSaving ? "disabled" : ""}
            >
              ${dealStagePresets
                .map(
                  (stageOption) =>
                    `<option value="${escapeHtml(stageOption)}" ${stageOption === getDealStageValue(deal) ? "selected" : ""}>${escapeHtml(stageOption)}</option>`,
                )
                .join("")}
            </select>
          </label>
          ${isStageSaving
            ? '<p class="helper-text">Saving stage update...</p>'
            : ""}
          ${hasStageError
            ? `<p class="helper-text danger-text">${escapeHtml(state.dealStageError)}</p>`
            : ""}
        </div>

        <div class="deal-detail-section">
          <p class="eyebrow">Notes</p>
          <p class="deal-detail-notes">
            ${escapeHtml((deal.notes || "").trim() || "No notes yet")}
          </p>
        </div>

        <div class="deal-detail-section deal-detail-meta">
          <small>Created ${escapeHtml(formatDate(deal.created_at))}</small>
          <small
            >Updated
            ${escapeHtml(formatDate(deal.updated_at || deal.created_at))}</small
          >
        </div>

        <div class="contact-form-actions">
          <button class="button secondary" type="button" data-close-deal-detail>
            Close
          </button>
          <button
            class="button secondary"
            type="button"
            data-edit-deal-id="${escapeHtml(deal.id)}"
          >
            Edit deal
          </button>
          <button
            class="button danger-button"
            type="button"
            data-delete-deal-id="${escapeHtml(deal.id)}"
          >
            Delete deal
          </button>
        </div>
      </section>
    </div>
  `;
}

function renderDealFormModal() {
  const contactOptions = [...state.contacts].sort((left, right) =>
    getContactName(left).localeCompare(getContactName(right)),
  );
  const leadOptions = [...state.leads].sort((left, right) =>
    getLeadName(left).localeCompare(getLeadName(right)),
  );
  const stageOptions = [
    ...new Set(
      [
        ...dealStagePresets,
        ...state.deals.map((deal) => getDealStageValue(deal)),
        state.dealForm.stage,
      ].filter(Boolean),
    ),
  ];
  const isEdit = state.dealFormMode === "edit";
  const contactsHelper = state.contactsLoading
    ? "Loading contacts for linking..."
    : state.contactsError
      ? "Contacts could not be loaded right now. You can still save this deal without linking a contact."
      : "Optionally link this deal to an existing contact.";
  const leadsHelper = state.leadsLoading
    ? "Loading leads for linking..."
    : state.leadsError
      ? "Leads could not be loaded right now. You can still save this deal without linking a lead."
      : "Optionally link this deal to an existing lead.";

  return html`
    <div class="overlay centered" data-close-deal-form>
      <section
        class="modal contact-modal deal-modal"
        role="dialog"
        aria-label="${isEdit ? "Edit deal" : "Add deal"}"
      >
        <button class="icon-button close" data-close-deal-form>Close</button>
        <p class="eyebrow">${isEdit ? "Edit deal" : "New deal"}</p>
        <h2>
          ${isEdit ? "Update deal details" : "Add a new deal to the pipeline"}
        </h2>
        <p class="helper-text">
          Deals stay scoped to your organization automatically and default the
          active workspace member as both creator and owner.
        </p>
        ${state.dealFormError
          ? `<p class="auth-message error">${escapeHtml(state.dealFormError)}</p>`
          : ""}
        <form class="contact-form deal-form" data-deal-form>
          <div class="contact-form-grid deal-form-grid">
            <label
              >Deal name
              <input
                data-deal-field="dealName"
                type="text"
                value="${escapeHtml(state.dealForm.dealName)}"
                placeholder="Acme renewal expansion"
                required
              />
            </label>
            <label
              >Company
              <input
                data-deal-field="company"
                type="text"
                value="${escapeHtml(state.dealForm.company)}"
                placeholder="Acme Group"
              />
            </label>
            <label
              >Contact
              <select data-deal-field="contactId">
                <option value="">No contact selected</option>
                ${contactOptions
                  .map((contact) => {
                    const selected =
                      String(contact.id) === String(state.dealForm.contactId)
                        ? "selected"
                        : "";
                    return `<option value="${escapeHtml(contact.id)}" ${selected}>${escapeHtml(getContactName(contact))}</option>`;
                  })
                  .join("")}
              </select>
              <span class="helper-text">${escapeHtml(contactsHelper)}</span>
            </label>
            <label
              >Lead
              <select data-deal-field="leadId">
                <option value="">No lead selected</option>
                ${leadOptions
                  .map((lead) => {
                    const selected =
                      String(lead.id) === String(state.dealForm.leadId)
                        ? "selected"
                        : "";
                    return `<option value="${escapeHtml(lead.id)}" ${selected}>${escapeHtml(getLeadName(lead))}</option>`;
                  })
                  .join("")}
              </select>
              <span class="helper-text">${escapeHtml(leadsHelper)}</span>
            </label>
            <label
              >Stage
              <select data-deal-field="stage">
                ${stageOptions
                  .map(
                    (stage) =>
                      `<option ${stage === state.dealForm.stage ? "selected" : ""}>${escapeHtml(stage)}</option>`,
                  )
                  .join("")}
              </select>
            </label>
            <label
              >Value
              <input
                data-deal-field="value"
                type="number"
                min="0"
                step="1"
                value="${escapeHtml(state.dealForm.value)}"
                placeholder="120000"
              />
            </label>
            <label
              >Probability
              <input
                data-deal-field="probability"
                type="number"
                min="0"
                max="100"
                step="1"
                value="${escapeHtml(state.dealForm.probability)}"
                placeholder="65"
              />
            </label>
            <label
              >Expected close date
              <input
                data-deal-field="expectedCloseDate"
                type="date"
                value="${escapeHtml(state.dealForm.expectedCloseDate)}"
              />
            </label>
          </div>
          <label
            >Notes
            <textarea
              data-deal-field="notes"
              rows="5"
              placeholder="Add context, buying signals, blockers, or next steps"
            >
${escapeHtml(state.dealForm.notes)}</textarea
            >
          </label>
          <div class="contact-form-actions">
            <button class="button secondary" type="button" data-close-deal-form>
              Cancel
            </button>
            <button
              class="button primary"
              type="submit"
              ${state.dealFormBusy ? "disabled" : ""}
            >
              ${state.dealFormBusy
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save changes"
                  : "Create deal"}
            </button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderDealDeleteModal() {
  const deal = findDealById(state.dealDeleteId);

  if (!deal) return "";

  return html`
    <div class="overlay centered" data-close-deal-delete>
      <section
        class="modal confirm-modal"
        role="dialog"
        aria-label="Delete deal"
      >
        <button class="icon-button close" data-close-deal-delete>Close</button>
        <p class="eyebrow">Delete deal</p>
        <h2>Remove ${escapeHtml(getDealName(deal))}?</h2>
        <p>
          This will permanently delete the deal from your organization pipeline.
          Confirm before you remove this revenue record.
        </p>
        ${state.dealDeleteError
          ? `<p class="auth-message error">${escapeHtml(state.dealDeleteError)}</p>`
          : ""}
        <div class="contact-form-actions">
          <button class="button secondary" type="button" data-close-deal-delete>
            Cancel
          </button>
          <button
            class="button danger-button"
            type="button"
            data-confirm-deal-delete
            ${state.dealDeleteBusy ? "disabled" : ""}
          >
            ${state.dealDeleteBusy ? "Deleting..." : "Delete deal"}
          </button>
        </div>
      </section>
    </div>
  `;
}

function renderClients() {
  const query = state.clientQuery.trim().toLowerCase();
  const clients = sortClients(
    state.contacts.filter((contact) =>
      [
        contact.company,
        contact.first_name,
        contact.last_name,
        contact.email,
        contact.client_type,
        contact.client_status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    ),
  );

  if (!state.contactsLoaded && state.contactsLoading) {
    return renderClientsLoading();
  }

  if (!state.contactsLoaded && state.contactsError) {
    return renderClientsError();
  }

  if (!clients.length) {
    return renderClientsEmpty(Boolean(query));
  }

  return html`
    <div class="client-grid">
      ${state.contactsError && state.contactsLoaded
        ? `<div class="flash-banner error client-feedback">${escapeHtml(state.contactsError)}</div>`
        : ""}
      ${clients
        .map(
          (client) => html`
            <article
              class="card client-card"
              data-client-id="${escapeHtml(client.id)}"
            >
              <img
                src="${escapeHtml(getClientImage(client))}"
                alt="${escapeHtml(getClientTitle(client))} workspace"
              />
              <div class="client-body">
                <span
                  class="status ${statusClass(getClientStatusValue(client))}"
                  >${escapeHtml(getClientStatusValue(client))}</span
                >
                <h2>${escapeHtml(getClientTitle(client))}</h2>
                <p>${escapeHtml(getClientSubtitle(client))}</p>
                ${client.email
                  ? `<a href="mailto:${escapeHtml(client.email)}">${escapeHtml(client.email)}</a>`
                  : '<span class="helper-text">No email on file</span>'}
                <div class="health">
                  <span
                    style="width:${getClientRelationshipHealthNumber(client)}%"
                  ></span>
                </div>
                <small
                  >${getClientRelationshipHealthNumber(client)}% relationship
                  health</small
                >
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderClientsLoading() {
  return html`
    <div class="client-grid">
      ${Array.from({ length: 4 })
        .map(
          () => html`
            <article
              class="card client-card client-loading-card"
              aria-hidden="true"
            >
              <div class="client-loading-image"></div>
              <div class="client-body">
                <div class="client-loading-copy"></div>
                <div class="client-loading-copy short"></div>
                <div class="client-loading-copy short"></div>
                <div class="health"><span style="width:45%"></span></div>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderClientsError() {
  return html`
    <div class="client-grid">
      <article class="card client-card client-state-card">
        <div class="client-body">
          <span class="status inactive">Clients unavailable</span>
          <h2>We could not load your client cards.</h2>
          <p>${escapeHtml(state.contactsError || "Try again in a moment.")}</p>
          <button class="button secondary" type="button" data-clients-reload>
            Try again
          </button>
        </div>
      </article>
    </div>
  `;
}

function renderClientsEmpty(hasQuery) {
  return html`
    <div class="client-grid">
      <article class="card client-card client-state-card">
        <div class="client-body">
          <span class="status ${hasQuery ? "inactive" : "onboarding"}"
            >${hasQuery ? "No matches" : "No clients yet"}</span
          >
          <h2>
            ${hasQuery
              ? "No client cards match this search."
              : "Client cards will appear here."}
          </h2>
          <p>
            ${hasQuery
              ? "Try a broader company, contact, email, type, or status search."
              : "We’re treating clients as contacts for now, so any organization contact with client details will show up here."}
          </p>
          ${hasQuery
            ? '<button class="button secondary" type="button" data-clear-client-search>Clear search</button>'
            : ""}
        </div>
      </article>
    </div>
  `;
}

function renderTasks() {
  const statusOptions = getTaskStatusOptions();
  const priorityOptions = getTaskPriorityOptions();
  const query = state.taskQuery.trim().toLowerCase();
  const activeFilters =
    Boolean(query) ||
    state.taskStatus !== "All" ||
    state.taskPriority !== "All";
  const tasks = sortTasks(
    state.tasks.filter((task) => {
      const matchesQuery = [
        task.title,
        task.description,
        getTaskTypeValue(task),
        getTaskStatusValue(task),
        getTaskPriorityValue(task),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
      const matchesStatus =
        state.taskStatus === "All" ||
        getTaskStatusValue(task) === state.taskStatus;
      const matchesPriority =
        state.taskPriority === "All" ||
        getTaskPriorityValue(task) === state.taskPriority;

      return matchesQuery && matchesStatus && matchesPriority;
    }),
  );
  const openTasks = state.tasks.filter((task) => !isTaskCompleted(task)).length;
  const completedTasks = state.tasks.filter((task) =>
    isTaskCompleted(task),
  ).length;
  const dueToday = state.tasks.filter(
    (task) => !isTaskCompleted(task) && getTaskDueTone(task) === "today",
  ).length;
  const urgentTasks = state.tasks.filter(
    (task) =>
      !isTaskCompleted(task) &&
      ["High", "Urgent"].includes(getTaskPriorityValue(task)),
  ).length;

  return html`
    <div class="page-stack">
      <section class="card tasks-summary">
        <div class="tasks-summary-copy">
          <p class="eyebrow">Execution lane</p>
          <h2>Organization tasks</h2>
          <p>
            Keep follow-ups, internal work, and revenue-critical actions moving
            with clean routing, fast completion, and direct links back to the
            right contact, lead, or deal.
          </p>
        </div>
        <div class="tasks-summary-stats">
          <article>
            <span>Total tasks</span>
            <strong>${number(state.tasks.length)}</strong>
          </article>
          <article>
            <span>Open tasks</span>
            <strong>${number(openTasks)}</strong>
          </article>
          <article>
            <span>Due today</span>
            <strong>${number(dueToday)}</strong>
          </article>
          <article>
            <span>Completed</span>
            <strong>${number(completedTasks)}</strong>
          </article>
        </div>
      </section>

      <section class="toolbar tasks-toolbar">
        <label class="search-field">
          Search tasks
          <input
            data-task-search
            type="search"
            value="${escapeHtml(state.taskQuery)}"
            placeholder="Title, description, task type, status, priority"
          />
        </label>
        <label class="select-field"
          >Status<select data-task-status>
            ${statusOptions
              .map(
                (status) =>
                  `<option ${status === state.taskStatus ? "selected" : ""}>${escapeHtml(status)}</option>`,
              )
              .join("")}
          </select></label
        >
        <label class="select-field"
          >Priority<select data-task-priority>
            ${priorityOptions
              .map(
                (priority) =>
                  `<option ${priority === state.taskPriority ? "selected" : ""}>${escapeHtml(priority)}</option>`,
              )
              .join("")}
          </select></label
        >
        <label class="select-field"
          >Sort<select data-task-sort>
            <option
              value="due-date"
              ${state.taskSort === "due-date" ? "selected" : ""}
            >
              Due date
            </option>
            <option
              value="newest"
              ${state.taskSort === "newest" ? "selected" : ""}
            >
              Newest first
            </option>
          </select></label
        >
        <div class="tasks-toolbar-actions">
          <button
            class="button secondary"
            type="button"
            data-tasks-reload
            ${state.tasksLoading ? "disabled" : ""}
          >
            ${state.tasksLoading ? "Refreshing..." : "Refresh"}
          </button>
          <button class="button primary" type="button" data-open-task-create>
            Add task
          </button>
        </div>
      </section>

      ${state.tasksError && state.tasksLoaded
        ? `<div class="flash-banner error">${escapeHtml(state.tasksError)}</div>`
        : ""}
      ${!state.tasksLoaded && state.tasksLoading
        ? renderTasksLoading()
        : !state.tasksLoaded && state.tasksError
          ? renderTasksError()
          : tasks.length
            ? renderTasksTable(tasks, activeFilters)
            : renderTasksEmpty(activeFilters, urgentTasks)}
    </div>
  `;
}

function renderTasksLoading() {
  return html`
    <section class="card tasks-state-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">Sync in progress</p>
          <h2>Loading tasks</h2>
        </div>
        <span class="pill">Supabase</span>
      </div>
      <div class="tasks-loading-list">
        ${Array.from({ length: 5 })
          .map(() => '<div class="task-loading-row"></div>')
          .join("")}
      </div>
    </section>
  `;
}

function renderTasksError() {
  return html`
    <section class="card tasks-state-card">
      <p class="eyebrow">Tasks unavailable</p>
      <h2>We could not load your organization tasks.</h2>
      <p>${escapeHtml(state.tasksError || "Try again in a moment.")}</p>
      <div class="tasks-state-actions">
        <button class="button secondary" type="button" data-tasks-reload>
          Try again
        </button>
      </div>
    </section>
  `;
}

function renderTasksEmpty(activeFilters, urgentTasks) {
  return html`
    <section class="card tasks-state-card">
      <p class="eyebrow">${activeFilters ? "No matches" : "No tasks yet"}</p>
      <h2>
        ${activeFilters
          ? "No tasks match this view."
          : "Create the team’s first task."}
      </h2>
      <p>
        ${activeFilters
          ? "Adjust the search, status, or priority filter to widen the results."
          : "Task records stay scoped to your workspace automatically, default to the signed-in user, and can link straight back to contacts, leads, or deals."}
      </p>
      ${!activeFilters && urgentTasks
        ? `<p class="helper-text">${escapeHtml(`${urgentTasks} high-priority tasks are waiting once the next sync lands.`)}</p>`
        : ""}
      <div class="tasks-state-actions">
        ${activeFilters
          ? '<button class="button secondary" type="button" data-clear-task-filters>Clear filters</button>'
          : '<button class="button primary" type="button" data-open-task-create>Add first task</button>'}
      </div>
    </section>
  `;
}

function renderTasksTable(tasks, activeFilters) {
  const sortLabel = state.taskSort === "newest" ? "Newest first" : "Due date";

  return html`
    <section class="card tasks-table-card">
      <div class="section-head tasks-section-head">
        <div>
          <p class="eyebrow">Execution queue</p>
          <h2>
            ${number(tasks.length)} ${tasks.length === 1 ? "task" : "tasks"}
          </h2>
        </div>
        ${activeFilters
          ? '<button class="text-button" type="button" data-clear-task-filters>Clear filters</button>'
          : `<span class="pill">Sorted by ${escapeHtml(sortLabel)}</span>`}
      </div>

      <div class="tasks-table" aria-label="Tasks table">
        <div class="tasks-table-head">
          <span>Task</span>
          <span>Type</span>
          <span>Due</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        ${tasks
          .map((task) => {
            const links = getTaskLinks(task);
            const dueTone = getTaskDueTone(task);
            const isBusy = String(state.taskStatusBusyId) === String(task.id);
            const hasStatusError =
              String(state.taskStatusErrorId) === String(task.id);
            const completed = isTaskCompleted(task);

            return html`
              <article class="task-row ${completed ? "complete" : ""}">
                <div class="task-primary-cell">
                  <div class="task-avatar" aria-hidden="true">
                    ${escapeHtml(getTaskInitials(task))}
                  </div>
                  <div class="task-primary-copy">
                    <strong>${escapeHtml(getTaskTitle(task))}</strong>
                    <small
                      >${escapeHtml(getTaskDescriptionPreview(task))}</small
                    >
                    ${links.length
                      ? `<div class="task-link-list">${links
                          .map(
                            (link) =>
                              `<span class="task-link-pill">${escapeHtml(link.kind)}: ${escapeHtml(link.label)}</span>`,
                          )
                          .join("")}</div>`
                      : '<small class="task-empty-link">No linked contact, lead, or deal</small>'}
                  </div>
                </div>

                <div class="task-meta-cell">
                  <span class="task-cell-label">Type</span>
                  <strong>${escapeHtml(getTaskTypeValue(task))}</strong>
                  <small
                    >Priority: ${escapeHtml(getTaskPriorityValue(task))}</small
                  >
                </div>

                <div class="task-meta-cell">
                  <span class="task-cell-label">Due</span>
                  <strong class="task-due ${dueTone}"
                    >${escapeHtml(getTaskDueDateLabel(task))}</strong
                  >
                  <small
                    >${escapeHtml(
                      task.due_date
                        ? formatDate(task.due_date)
                        : "No date scheduled",
                    )}</small
                  >
                </div>

                <div class="task-status-cell">
                  <span class="task-cell-label">Status</span>
                  <span class="status ${statusClass(getTaskStatusValue(task))}">
                    ${escapeHtml(getTaskStatusValue(task))}
                  </span>
                  <small>
                    ${escapeHtml(
                      completed
                        ? `Completed ${formatDate(task.completed_at || task.updated_at || task.created_at)}`
                        : `Created ${formatDate(task.created_at)}`,
                    )}
                  </small>
                </div>

                <div class="task-actions-cell">
                  <span class="task-cell-label">Actions</span>
                  <button
                    class="text-button"
                    type="button"
                    data-complete-task-id="${escapeHtml(task.id)}"
                    ${completed || isBusy ? "disabled" : ""}
                  >
                    ${completed
                      ? "Completed"
                      : isBusy
                        ? "Completing..."
                        : "Mark completed"}
                  </button>
                  <button
                    class="text-button"
                    type="button"
                    data-edit-task-id="${escapeHtml(task.id)}"
                  >
                    Edit
                  </button>
                  <button
                    class="text-button danger-text"
                    type="button"
                    data-delete-task-id="${escapeHtml(task.id)}"
                  >
                    Delete
                  </button>
                  ${hasStatusError
                    ? `<small class="danger-text">${escapeHtml(state.taskStatusError)}</small>`
                    : ""}
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderTaskFormModal() {
  const contactOptions = [...state.contacts].sort((left, right) =>
    getContactName(left).localeCompare(getContactName(right)),
  );
  const leadOptions = [...state.leads].sort((left, right) =>
    getLeadName(left).localeCompare(getLeadName(right)),
  );
  const dealOptions = [...state.deals].sort((left, right) =>
    getDealName(left).localeCompare(getDealName(right)),
  );
  const typeOptions = [
    ...new Set([...taskTypePresets, state.taskForm.taskType].filter(Boolean)),
  ];
  const priorityOptions = [
    ...new Set(
      [
        ...taskPriorityPresets,
        ...state.tasks.map((task) => getTaskPriorityValue(task)),
        state.taskForm.priority,
      ].filter(Boolean),
    ),
  ];
  const statusOptions = [
    ...new Set(
      [
        ...taskStatusPresets,
        ...state.tasks.map((task) => getTaskStatusValue(task)),
        state.taskForm.status,
      ].filter(Boolean),
    ),
  ];
  const isEdit = state.taskFormMode === "edit";
  const contactsHelper = state.contactsLoading
    ? "Loading contacts for linking..."
    : state.contactsError
      ? "Contacts are unavailable right now. You can still save the task without linking a contact."
      : "Optionally link this task to a workspace contact.";
  const leadsHelper = state.leadsLoading
    ? "Loading leads for linking..."
    : state.leadsError
      ? "Leads are unavailable right now. You can still save the task without linking a lead."
      : "Optionally link this task to a workspace lead.";
  const dealsHelper = state.dealsLoading
    ? "Loading deals for linking..."
    : state.dealsError
      ? "Deals are unavailable right now. You can still save the task without linking a deal."
      : "Optionally link this task to a workspace deal.";

  return html`
    <div class="overlay centered" data-close-task-form>
      <section
        class="modal contact-modal task-modal"
        role="dialog"
        aria-label="${isEdit ? "Edit task" : "Add task"}"
      >
        <button class="icon-button close" data-close-task-form>Close</button>
        <p class="eyebrow">${isEdit ? "Edit task" : "New task"}</p>
        <h2>${isEdit ? "Update task details" : "Create a new task"}</h2>
        <p class="helper-text">
          Tasks stay scoped to your organization automatically and default the
          signed-in user as both creator and assignee.
        </p>
        ${state.taskFormError
          ? `<p class="auth-message error">${escapeHtml(state.taskFormError)}</p>`
          : ""}
        <form class="contact-form task-form" data-task-form>
          <div class="contact-form-grid task-form-grid">
            <label
              >Title
              <input
                data-task-field="title"
                type="text"
                value="${escapeHtml(state.taskForm.title)}"
                placeholder="Send renewal summary to Apex Foods"
                required
              />
            </label>
            <label
              >Task type
              <select data-task-field="taskType">
                ${typeOptions
                  .map(
                    (taskType) =>
                      `<option ${taskType === state.taskForm.taskType ? "selected" : ""}>${escapeHtml(taskType)}</option>`,
                  )
                  .join("")}
              </select>
            </label>
            <label
              >Priority
              <select data-task-field="priority">
                ${priorityOptions
                  .map(
                    (priority) =>
                      `<option ${priority === state.taskForm.priority ? "selected" : ""}>${escapeHtml(priority)}</option>`,
                  )
                  .join("")}
              </select>
            </label>
            <label
              >Status
              <select data-task-field="status">
                ${statusOptions
                  .map(
                    (status) =>
                      `<option ${status === state.taskForm.status ? "selected" : ""}>${escapeHtml(status)}</option>`,
                  )
                  .join("")}
              </select>
            </label>
            <label
              >Due date
              <input
                data-task-field="dueDate"
                type="date"
                value="${escapeHtml(state.taskForm.dueDate)}"
              />
            </label>
            <label
              >Contact
              <select data-task-field="contactId">
                <option value="">No contact selected</option>
                ${contactOptions
                  .map((contact) => {
                    const selected =
                      String(contact.id) === String(state.taskForm.contactId)
                        ? "selected"
                        : "";
                    return `<option value="${escapeHtml(contact.id)}" ${selected}>${escapeHtml(getContactName(contact))}</option>`;
                  })
                  .join("")}
              </select>
              <span class="helper-text">${escapeHtml(contactsHelper)}</span>
            </label>
            <label
              >Lead
              <select data-task-field="leadId">
                <option value="">No lead selected</option>
                ${leadOptions
                  .map((lead) => {
                    const selected =
                      String(lead.id) === String(state.taskForm.leadId)
                        ? "selected"
                        : "";
                    return `<option value="${escapeHtml(lead.id)}" ${selected}>${escapeHtml(getLeadName(lead))}</option>`;
                  })
                  .join("")}
              </select>
              <span class="helper-text">${escapeHtml(leadsHelper)}</span>
            </label>
            <label
              >Deal
              <select data-task-field="dealId">
                <option value="">No deal selected</option>
                ${dealOptions
                  .map((deal) => {
                    const selected =
                      String(deal.id) === String(state.taskForm.dealId)
                        ? "selected"
                        : "";
                    return `<option value="${escapeHtml(deal.id)}" ${selected}>${escapeHtml(getDealName(deal))}</option>`;
                  })
                  .join("")}
              </select>
              <span class="helper-text">${escapeHtml(dealsHelper)}</span>
            </label>
          </div>
          <label
            >Description
            <textarea
              data-task-field="description"
              rows="5"
              placeholder="Add context, talking points, blockers, or the expected next step"
            >
${escapeHtml(state.taskForm.description)}</textarea
            >
          </label>
          <div class="contact-form-actions">
            <button class="button secondary" type="button" data-close-task-form>
              Cancel
            </button>
            <button
              class="button primary"
              type="submit"
              ${state.taskFormBusy ? "disabled" : ""}
            >
              ${state.taskFormBusy
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save changes"
                  : "Create task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderTaskDeleteModal() {
  const task = findTaskById(state.taskDeleteId);

  if (!task) return "";

  return html`
    <div class="overlay centered" data-close-task-delete>
      <section
        class="modal confirm-modal"
        role="dialog"
        aria-label="Delete task"
      >
        <button class="icon-button close" data-close-task-delete>Close</button>
        <p class="eyebrow">Delete task</p>
        <h2>Remove ${escapeHtml(getTaskTitle(task))}?</h2>
        <p>
          This will permanently delete the task from your organization
          workspace. Make sure the follow-up is no longer needed before you
          continue.
        </p>
        ${state.taskDeleteError
          ? `<p class="auth-message error">${escapeHtml(state.taskDeleteError)}</p>`
          : ""}
        <div class="contact-form-actions">
          <button class="button secondary" type="button" data-close-task-delete>
            Cancel
          </button>
          <button
            class="button danger-button"
            type="button"
            data-confirm-task-delete
            ${state.taskDeleteBusy ? "disabled" : ""}
          >
            ${state.taskDeleteBusy ? "Deleting..." : "Delete task"}
          </button>
        </div>
      </section>
    </div>
  `;
}

function renderSettingsStateCard({
  eyebrow,
  title,
  body,
  actionLabel = "",
  actionDisabled = false,
}) {
  return html`
    <section class="card settings-card settings-state-card">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(body)}</p>
      ${actionLabel
        ? `<button class="button secondary" type="button" data-settings-reload ${actionDisabled ? "disabled" : ""}>${escapeHtml(actionLabel)}</button>`
        : ""}
    </section>
  `;
}

function renderSettingsTabs() {
  const tabs = [
    { label: "Organisation", active: true },
    { label: "Profile", active: false },
    { label: "Team", active: false },
    { label: "Billing", active: false },
    { label: "White Label", active: false },
  ];

  return html`
    <div class="settings-tabs" role="tablist" aria-label="Settings sections">
      ${tabs
        .map(
          (tab) => html`
            <button
              class="settings-tab ${tab.active ? "active" : ""}"
              type="button"
              ${tab.active ? "" : "disabled"}
            >
              ${tab.label}
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderOrganizationLogoPreview() {
  const logoUrl = getOrganizationLogoValue();

  if (!logoUrl) {
    return html`<div class="settings-logo-fallback">
      ${escapeHtml(getOrganizationInitials())}
    </div>`;
  }

  return html`
    <img
      class="brand-logo settings-preview-logo"
      src="${escapeHtml(logoUrl)}"
      alt="${escapeHtml(`${getOrganizationNameValue()} logo`)}"
    />
  `;
}

function renderSettingsLoadedView() {
  const accentColor = getOrganizationBrandColorValue();
  const website =
    (state.organizationForm.website || "").trim() || "Add your website";
  const email =
    (state.organizationForm.email || "").trim() || "Add a support email";
  const phone =
    (state.organizationForm.phone || "").trim() || "Add a contact number";
  const address =
    (state.organizationForm.address || "").trim() || "Add a business address";

  return html`
    <div class="settings-grid">
      <section
        class="brand-preview settings-brand-preview"
        style="--settings-accent:${accentColor}"
      >
        <div class="settings-preview-head">
          <div class="settings-logo-stage" data-settings-logo-preview>
            ${renderOrganizationLogoPreview()}
          </div>
          <span class="pill"
            >${state.organizationLoading
              ? "Refreshing..."
              : "Live preview"}</span
          >
        </div>
        <div class="settings-preview-copy">
          <p class="eyebrow">Brand preview</p>
          <h2 data-settings-preview-name>
            ${escapeHtml(getOrganizationNameValue())}
          </h2>
          <p data-settings-preview-industry>
            ${escapeHtml(getOrganizationIndustryValue())}
          </p>
        </div>
        <div class="settings-preview-contact">
          <article>
            <span>Website</span>
            <strong data-settings-preview-website
              >${escapeHtml(website)}</strong
            >
          </article>
          <article>
            <span>Email</span>
            <strong data-settings-preview-email>${escapeHtml(email)}</strong>
          </article>
          <article>
            <span>Phone</span>
            <strong data-settings-preview-phone>${escapeHtml(phone)}</strong>
          </article>
        </div>
        <div>
          <div class="swatches settings-swatches">
            <span
              data-brand-color-swatch
              style="background:${accentColor}"
            ></span>
            <span style="background:#101010"></span>
            <span style="background:#ffffff"></span>
          </div>
          <p class="settings-address-preview" data-settings-preview-address>
            ${escapeHtml(address)}
          </p>
        </div>
      </section>

      <section class="card settings-card settings-form-card">
        <div class="section-head settings-section-head">
          <div>
            <p class="eyebrow">Organisation</p>
            <h2>Workspace identity</h2>
          </div>
          <div class="settings-head-actions">
            <span class="pill"
              >${state.organizationLoading
                ? "Supabase refresh"
                : "Supabase linked"}</span
            >
            <button
              class="button secondary"
              type="button"
              data-settings-reload
              ${state.organizationLoading || state.organizationSaving
                ? "disabled"
                : ""}
            >
              ${state.organizationLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        ${state.organizationError
          ? `<p class="settings-feedback error" data-settings-load-feedback>${escapeHtml(state.organizationError)}</p>`
          : ""}
        ${state.organizationSaveError
          ? `<p class="settings-feedback error" data-settings-save-error>${escapeHtml(state.organizationSaveError)}</p>`
          : ""}
        ${state.organizationSaveSuccess
          ? `<p class="settings-feedback success" data-settings-save-success>${escapeHtml(state.organizationSaveSuccess)}</p>`
          : ""}

        <form class="settings-form" data-settings-form>
          <div class="settings-form-grid">
            <label>
              Organization name
              <input
                data-settings-field="name"
                type="text"
                value="${escapeHtml(state.organizationForm.name)}"
                placeholder="Pusha CRM"
                required
              />
            </label>
            <label>
              Industry
              <input
                data-settings-field="industry"
                type="text"
                value="${escapeHtml(state.organizationForm.industry)}"
                placeholder="CRM / SaaS"
              />
            </label>
            <label>
              Logo URL
              <input
                data-settings-field="logoUrl"
                type="url"
                value="${escapeHtml(state.organizationForm.logoUrl)}"
                placeholder="https://..."
              />
            </label>
            <label>
              Website
              <input
                data-settings-field="website"
                type="url"
                value="${escapeHtml(state.organizationForm.website)}"
                placeholder="https://pushacrm.com"
              />
            </label>
            <label>
              Email
              <input
                data-settings-field="email"
                type="email"
                value="${escapeHtml(state.organizationForm.email)}"
                placeholder="team@pushacrm.com"
              />
            </label>
            <label>
              Phone
              <input
                data-settings-field="phone"
                type="text"
                value="${escapeHtml(state.organizationForm.phone)}"
                placeholder="+27 00 000 0000"
              />
            </label>
          </div>

          <label>
            Address
            <textarea
              data-settings-field="address"
              placeholder="Company address, city, and region"
            >
${escapeHtml(state.organizationForm.address)}</textarea
            >
          </label>

          <div class="settings-color-grid">
            <label>
              Brand color
              <input
                data-settings-field="brandColor"
                data-settings-brand-color-text
                type="text"
                value="${escapeHtml(state.organizationForm.brandColor)}"
                placeholder="#d8aa3b"
              />
            </label>
            <label>
              Color picker
              <input
                data-settings-field="brandColor"
                data-settings-brand-color-picker
                type="color"
                value="${accentColor}"
              />
            </label>
          </div>

          <div class="settings-form-actions">
            <div class="settings-meta">
              <span>Organisation ID</span>
              <strong
                >${escapeHtml(
                  state.organization?.id ||
                    state.organizationId ||
                    "Pending sync",
                )}</strong
              >
              <small
                >Last updated
                ${escapeHtml(
                  formatDateTime(state.organization?.updated_at),
                )}</small
              >
            </div>
            <button
              class="button primary"
              type="submit"
              ${state.organizationSaving ? "disabled" : ""}
            >
              ${state.organizationSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      <section class="card settings-card settings-support-card">
        <p class="eyebrow">Workspace map</p>
        <h2>Connected record</h2>
        <div class="settings-detail-list">
          <article>
            <span>Signed in as</span>
            <strong
              >${escapeHtml(
                state.session?.user?.email || "Authenticated user",
              )}</strong
            >
          </article>
          <article>
            <span>Profile link</span>
            <strong
              >${escapeHtml(
                state.currentProfile?.organization_id ||
                  state.organizationId ||
                  "Pending sync",
              )}</strong
            >
          </article>
          <article>
            <span>Created by</span>
            <strong
              >${escapeHtml(
                state.organization?.created_by || "Workspace owner",
              )}</strong
            >
          </article>
          <article>
            <span>Created</span>
            <strong
              >${escapeHtml(
                formatDateTime(state.organization?.created_at),
              )}</strong
            >
          </article>
        </div>
        <div class="settings-coming-soon">
          <span class="pill">Profile</span>
          <span class="pill">Team</span>
          <span class="pill">Billing</span>
          <span class="pill">White Label</span>
        </div>
        <p class="helper-text">
          This page is ready for future settings modules without rebuilding the
          current CRM shell.
        </p>
      </section>
    </div>
  `;
}

function renderSettings() {
  const isBlockingError = Boolean(
    state.organizationError && !state.organizationLoaded,
  );
  const isLoadingView = !state.organizationLoaded && !isBlockingError;

  return html`
    <div class="page-stack">
      <section class="card settings-hero">
        <div class="settings-hero-copy">
          <p class="eyebrow">Settings</p>
          <h2>
            Shape the organization profile behind every deal, task, and client
            touchpoint.
          </h2>
          <p>
            Pusha CRM pulls your authenticated profile, resolves the linked
            organisation, and lets you update the shared workspace identity
            without rebuilding auth or duplicating the Supabase client.
          </p>
        </div>
        ${renderSettingsTabs()}
      </section>

      ${isBlockingError
        ? renderSettingsStateCard({
            eyebrow: "Organisation sync",
            title: "We could not load your organization settings.",
            body: state.organizationError,
            actionLabel: "Try again",
          })
        : isLoadingView
          ? renderSettingsStateCard({
              eyebrow: "Organisation sync",
              title: "Loading organisation settings",
              body: state.organizationLoading
                ? "Fetching your authenticated workspace, profile link, and organisation record from Supabase."
                : "Preparing your workspace settings view.",
              actionLabel: state.organizationLoading ? "" : "Refresh",
              actionDisabled: state.organizationLoading,
            })
          : renderSettingsLoadedView()}
    </div>
  `;
}

function renderLeadDrawer(lead) {
  return html`
    <div class="overlay" data-close-drawer>
      <aside class="drawer" role="dialog" aria-label="${lead.name} lead detail">
        <button class="icon-button close" data-close-drawer>Close</button>
        <p class="eyebrow">Lead detail</p>
        <h2>${lead.name}</h2>
        <span class="status ${statusClass(lead.status)}">${lead.status}</span>
        <dl>
          <div>
            <dt>Contact</dt>
            <dd>${lead.contact}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>${lead.email}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>${lead.phone}</dd>
          </div>
          <div>
            <dt>Pipeline value</dt>
            <dd>${currency(lead.value)}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>${lead.owner}</dd>
          </div>
        </dl>
        <p>${lead.notes}</p>
        <button class="button primary">Create follow-up</button>
      </aside>
    </div>
  `;
}

function renderClientModal(client) {
  const relationshipHealth = getClientRelationshipHealthNumber(client);

  return html`
    <div class="overlay centered" data-close-client>
      <section
        class="modal"
        role="dialog"
        aria-label="${escapeHtml(getClientTitle(client))} client detail"
      >
        <img
          src="${escapeHtml(getClientImage(client))}"
          alt="${escapeHtml(getClientTitle(client))} team"
        />
        <button class="icon-button close" data-close-client>Close</button>
        <p class="eyebrow">${escapeHtml(getClientTypeValue(client))}</p>
        <h2>${escapeHtml(getClientTitle(client))}</h2>
        <p>
          ${escapeHtml(getClientContactName(client))} leads this relationship.
          Current health score is ${relationshipHealth}% and the account is
          marked ${escapeHtml(getClientStatusValue(client))}.
        </p>
        ${client.email
          ? `<a class="button secondary" href="mailto:${escapeHtml(client.email)}">Email client</a>`
          : '<button class="button secondary" type="button" disabled>No email on file</button>'}
      </section>
    </div>
  `;
}

function animateCounters() {
  document.querySelectorAll("[data-counter]").forEach((element) => {
    const target = Number(element.dataset.counter);
    const prefix = element.dataset.prefix || "";
    const duration = 900;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      element.textContent = prefix ? currency(current) : number(current);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  });
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  if (!supabase) {
    state.authError = supabaseConfigError;
    render();
    return;
  }

  state.authBusy = true;
  state.authError = "";
  state.authSuccess = "";
  render();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: state.authEmail.trim(),
    password: state.authPassword,
  });

  if (error) {
    state.authBusy = false;
    state.authError = error.message;
    render();
    return;
  }

  applySession(authData.session);
}

async function handleSignupSubmit(event) {
  event.preventDefault();

  if (!supabase) {
    state.authError = supabaseConfigError;
    render();
    return;
  }

  const fullName = state.signupFullName.trim();
  const companyName = state.signupCompanyName.trim();
  const email = state.signupEmail.trim();
  const password = state.signupPassword;
  const confirmPassword = state.signupConfirmPassword;

  if (!fullName || !companyName || !email || !password || !confirmPassword) {
    state.authError =
      "Complete all signup fields before creating your account.";
    state.authSuccess = "";
    render();
    return;
  }

  if (password.length < 6) {
    state.authError = "Password must be at least 6 characters long.";
    state.authSuccess = "";
    render();
    return;
  }

  if (password !== confirmPassword) {
    state.authError = "Password and confirm password must match.";
    state.authSuccess = "";
    render();
    return;
  }

  state.authBusy = true;
  state.authError = "";
  state.authSuccess = "";
  render();

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company_name: companyName,
      },
    },
  });

  if (error) {
    state.authBusy = false;
    state.authError = error.message;
    render();
    return;
  }

  state.authBusy = false;
  state.authEmail = email;
  state.authPassword = "";
  state.signupFullName = "";
  state.signupCompanyName = "";
  state.signupEmail = email;
  state.signupPassword = "";
  state.signupConfirmPassword = "";

  if (authData.session) {
    if (state.session?.access_token !== authData.session.access_token) {
      applySession(authData.session);
    }
    showFlash(
      `Welcome to Pusha CRM, ${fullName}. Your workspace is ready.`,
      "success",
    );
    return;
  }

  state.authSuccess =
    "Account created. Check your email to confirm your account, then sign in to Pusha CRM.";
  render();

  window.setTimeout(() => {
    if (!isAuthenticated()) {
      setRoute("login", { preserveAuthFeedback: true });
    }
  }, 1400);
}

async function handleLogout() {
  if (!supabase) return;

  state.authBusy = true;
  state.authError = "";
  render();

  const { error } = await supabase.auth.signOut();

  if (error) {
    state.authBusy = false;
    state.authError = error.message;
    render();
    return;
  }

  applySession(null);
}

function hydrateRouteData(route) {
  if (!isAuthenticated()) return;

  if (route === "dashboard") {
    void loadDashboardData();
  }

  if (route === "contacts") {
    void loadContacts();
  }

  if (route === "leads") {
    void loadContacts();
    void loadLeads();
  }

  if (route === "deals") {
    void loadContacts();
    void loadLeads();
    void loadDeals();
  }

  if (route === "clients") {
    void loadContacts();
  }

  if (route === "tasks") {
    void loadContacts();
    void loadLeads();
    void loadDeals();
    void loadTasks();
  }

  if (route === "settings") {
    void loadOrganizationSettings();
  }
}

async function loadDashboardData(options = {}) {
  const { force = false } = options;

  if (!supabase || !state.session?.user) return;
  if (state.dashboardLoading) return;
  if (areDashboardSourcesLoaded() && !force) return;

  state.dashboardLoading = true;
  state.dashboardError = "";
  render();

  try {
    const profile = await ensureCurrentProfile();
    const organizationId = profile.organization_id;
    const [contacts, leads, deals, tasks] = await Promise.all([
      listContactsByOrganization(organizationId),
      listLeadsByOrganization(organizationId),
      listDealsByOrganization(organizationId),
      listTasksByOrganization(organizationId),
    ]);

    state.organizationId = organizationId;
    state.contacts = contacts;
    state.contactsLoaded = true;
    state.contactsError = "";
    state.leads = leads;
    state.leadsLoaded = true;
    state.leadsError = "";
    state.deals = deals;
    state.dealsLoaded = true;
    state.dealsError = "";
    state.tasks = tasks;
    state.tasksLoaded = true;
    state.tasksError = "";
  } catch (error) {
    state.dashboardError =
      error.message || "Unable to load your dashboard right now.";
  } finally {
    state.dashboardLoading = false;
    render();
  }
}

async function loadOrganizationSettings(options = {}) {
  const { force = false } = options;
  const user = state.session?.user;

  if (!supabase || !user) return;
  if (state.organizationLoading) return;
  if (state.organizationLoaded && !force) return;

  state.organizationLoading = true;
  if (!state.organizationLoaded || force) {
    state.organizationError = "";
  }
  if (force) {
    state.organizationSaveSuccess = "";
    state.organizationSaveError = "";
  }
  render();

  try {
    const profile = await ensureCurrentProfile();
    const organization = await getOrganizationById(profile.organization_id);

    state.organizationId = profile.organization_id;
    state.organization = organization;
    state.organizationLoaded = true;
    state.organizationError = "";
    state.organizationForm =
      createOrganizationSettingsFormFromRecord(organization);
  } catch (error) {
    state.organizationError =
      error.message || "Unable to load organization settings right now.";
  } finally {
    state.organizationLoading = false;
    render();
  }
}

function syncSettingsPreview() {
  if (state.route !== "settings") return;

  const accentColor = getOrganizationBrandColorValue();
  const website =
    (state.organizationForm.website || "").trim() || "Add your website";
  const email =
    (state.organizationForm.email || "").trim() || "Add a support email";
  const phone =
    (state.organizationForm.phone || "").trim() || "Add a contact number";
  const address =
    (state.organizationForm.address || "").trim() || "Add a business address";

  const previewCard = document.querySelector(".settings-brand-preview");
  if (previewCard) {
    previewCard.style.setProperty("--settings-accent", accentColor);
  }

  const logoPreview = document.querySelector("[data-settings-logo-preview]");
  if (logoPreview) {
    logoPreview.innerHTML = renderOrganizationLogoPreview();
  }

  const previewName = document.querySelector("[data-settings-preview-name]");
  if (previewName) {
    previewName.textContent = getOrganizationNameValue();
  }

  const previewIndustry = document.querySelector(
    "[data-settings-preview-industry]",
  );
  if (previewIndustry) {
    previewIndustry.textContent = getOrganizationIndustryValue();
  }

  const previewWebsite = document.querySelector(
    "[data-settings-preview-website]",
  );
  if (previewWebsite) {
    previewWebsite.textContent = website;
  }

  const previewEmail = document.querySelector("[data-settings-preview-email]");
  if (previewEmail) {
    previewEmail.textContent = email;
  }

  const previewPhone = document.querySelector("[data-settings-preview-phone]");
  if (previewPhone) {
    previewPhone.textContent = phone;
  }

  const previewAddress = document.querySelector(
    "[data-settings-preview-address]",
  );
  if (previewAddress) {
    previewAddress.textContent = address;
  }

  const brandSwatch = document.querySelector("[data-brand-color-swatch]");
  if (brandSwatch) {
    brandSwatch.style.background = accentColor;
  }

  const colorPicker = document.querySelector(
    "[data-settings-brand-color-picker]",
  );
  if (colorPicker && document.activeElement !== colorPicker) {
    colorPicker.value = accentColor;
  }

  const colorText = document.querySelector("[data-settings-brand-color-text]");
  if (colorText && document.activeElement !== colorText) {
    colorText.value = state.organizationForm.brandColor;
  }
}

async function handleSettingsFormSubmit(event) {
  event.preventDefault();

  if (!state.session?.user || !supabase) return;

  const name = state.organizationForm.name.trim();
  const brandColor = state.organizationForm.brandColor.trim();

  if (!name) {
    state.organizationSaveSuccess = "";
    state.organizationSaveError = "Organisation name is required.";
    render();
    return;
  }

  if (brandColor && !isValidHexColor(brandColor)) {
    state.organizationSaveSuccess = "";
    state.organizationSaveError =
      "Brand color must be a valid hex value like #d8aa3b.";
    render();
    return;
  }

  state.organizationSaving = true;
  state.organizationSaveSuccess = "";
  state.organizationSaveError = "";
  render();

  try {
    const profile = await ensureCurrentProfile();
    const organizationId = profile.organization_id;
    const updatedOrganization = await updateOrganization(organizationId, {
      name,
      logo_url: normalizeOptionalText(state.organizationForm.logoUrl),
      industry: normalizeOptionalText(state.organizationForm.industry),
      website: normalizeOptionalText(state.organizationForm.website),
      email: normalizeOptionalText(state.organizationForm.email),
      phone: normalizeOptionalText(state.organizationForm.phone),
      address: normalizeOptionalText(state.organizationForm.address),
      brand_color: brandColor || null,
      updated_at: new Date().toISOString(),
    });

    state.organizationId = organizationId;
    state.organization = updatedOrganization;
    state.organizationLoaded = true;
    state.organizationLoading = false;
    state.organizationError = "";
    state.organizationSaving = false;
    state.organizationSaveSuccess = "Organisation settings saved successfully.";
    state.organizationForm =
      createOrganizationSettingsFormFromRecord(updatedOrganization);
    render();
    showFlash("Organisation settings updated successfully.", "success");
  } catch (error) {
    state.organizationSaving = false;
    state.organizationSaveSuccess = "";
    state.organizationSaveError =
      error.message || "Unable to save organization settings.";
    render();
  }
}

async function loadContacts(options = {}) {
  const { force = false } = options;

  if (!supabase || !state.session?.user) return;
  if (state.contactsLoading) return;
  if (state.contactsLoaded && !force) return;

  state.contactsLoading = true;
  if (!state.contactsLoaded) {
    state.contactsError = "";
  }
  render();

  try {
    const profile = await ensureCurrentProfile();
    const contacts = await listContactsByOrganization(profile.organization_id);

    state.contacts = contacts;
    if (state.selectedClient) {
      state.selectedClient =
        contacts.find(
          (contact) => String(contact.id) === String(state.selectedClient.id),
        ) || null;
    }
    state.contactsLoaded = true;
    state.contactsError = "";
  } catch (error) {
    state.contactsError = error.message || "Unable to load contacts right now.";
  } finally {
    state.contactsLoading = false;
    render();
  }
}

async function loadLeads(options = {}) {
  const { force = false } = options;

  if (!supabase || !state.session?.user) return;
  if (state.leadsLoading) return;
  if (state.leadsLoaded && !force) return;

  state.leadsLoading = true;
  if (!state.leadsLoaded) {
    state.leadsError = "";
  }
  render();

  try {
    const profile = await ensureCurrentProfile();
    const leads = await listLeadsByOrganization(profile.organization_id);

    state.leads = leads;
    state.leadsLoaded = true;
    state.leadsError = "";
  } catch (error) {
    state.leadsError = error.message || "Unable to load leads right now.";
  } finally {
    state.leadsLoading = false;
    render();
  }
}

async function loadDeals(options = {}) {
  const { force = false } = options;

  if (!supabase || !state.session?.user) return;
  if (state.dealsLoading) return;
  if (state.dealsLoaded && !force) return;

  state.dealsLoading = true;
  if (!state.dealsLoaded) {
    state.dealsError = "";
  }
  render();

  try {
    const profile = await ensureCurrentProfile();
    const deals = await listDealsByOrganization(profile.organization_id);

    state.organizationId = profile.organization_id;
    state.deals = deals;
    state.dealsLoaded = true;
    state.dealsError = "";
  } catch (error) {
    state.dealsError = error.message || "Unable to load deals right now.";
  } finally {
    state.dealsLoading = false;
    render();
  }
}

async function loadTasks(options = {}) {
  const { force = false } = options;

  if (!supabase || !state.session?.user) return;
  if (state.tasksLoading) return;
  if (state.tasksLoaded && !force) return;

  state.tasksLoading = true;
  if (!state.tasksLoaded) {
    state.tasksError = "";
  }
  render();

  try {
    const profile = await ensureCurrentProfile();
    const tasks = await listTasksByOrganization(profile.organization_id);

    state.organizationId = profile.organization_id;
    state.tasks = tasks;
    state.tasksLoaded = true;
    state.tasksError = "";
  } catch (error) {
    state.tasksError = error.message || "Unable to load tasks right now.";
  } finally {
    state.tasksLoading = false;
    render();
  }
}

function openContactForm(mode, contact = null) {
  state.contactFormOpen = true;
  state.contactFormMode = mode;
  state.contactFormId = contact?.id || null;
  state.contactFormBusy = false;
  state.contactFormError = "";
  state.contactForm = contact
    ? {
        firstName: contact.first_name || "",
        lastName: contact.last_name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        jobTitle: contact.job_title || "",
        source: contact.source || "",
        status: getContactStatusValue(contact),
        notes: contact.notes || "",
      }
    : createEmptyContactForm();
  render();
}

function closeContactForm() {
  resetContactFormState();
  render();
}

function openLeadForm(mode, lead = null) {
  state.leadFormOpen = true;
  state.leadFormMode = mode;
  state.leadFormId = lead?.id || null;
  state.leadFormBusy = false;
  state.leadFormError = "";
  state.leadForm = lead
    ? {
        leadName: lead.lead_name || "",
        company: lead.company || "",
        contactId: lead.contact_id ? String(lead.contact_id) : "",
        status: getLeadStatusValue(lead),
        source: lead.source || "",
        value: lead.value == null ? "" : String(lead.value),
        probability: lead.probability == null ? "" : String(lead.probability),
        expectedCloseDate: lead.expected_close_date
          ? String(lead.expected_close_date).slice(0, 10)
          : "",
        notes: lead.notes || "",
      }
    : createEmptyLeadForm();
  render();
}

function closeLeadForm() {
  resetLeadFormState();
  render();
}

function openLeadDelete(leadId) {
  state.leadDeleteId = leadId;
  state.leadDeleteBusy = false;
  state.leadDeleteError = "";
  render();
}

function closeLeadDelete() {
  state.leadDeleteId = null;
  state.leadDeleteBusy = false;
  state.leadDeleteError = "";
  render();
}

function openDealForm(mode, deal = null) {
  state.dealFormOpen = true;
  state.dealFormMode = mode;
  state.dealFormId = deal?.id || null;
  state.dealFormBusy = false;
  state.dealFormError = "";
  state.dealForm = deal
    ? {
        dealName: deal.deal_name || "",
        company: deal.company || "",
        contactId: deal.contact_id ? String(deal.contact_id) : "",
        leadId: deal.lead_id ? String(deal.lead_id) : "",
        stage: getDealStageValue(deal),
        value: deal.value == null ? "" : String(deal.value),
        probability: deal.probability == null ? "" : String(deal.probability),
        expectedCloseDate: deal.expected_close_date
          ? String(deal.expected_close_date).slice(0, 10)
          : "",
        notes: deal.notes || "",
      }
    : createEmptyDealForm();
  render();
}

function openDealDetail(dealId) {
  if (!findDealById(dealId)) return;

  state.selectedDealId = dealId;
  render();
}

function closeDealDetail() {
  state.selectedDealId = null;
  render();
}

function closeDealForm() {
  resetDealFormState();
  render();
}

function openDealFormFromLead(lead) {
  state.dealFormOpen = true;
  state.dealFormMode = "create";
  state.dealFormId = null;
  state.dealFormBusy = false;
  state.dealFormError = "";
  state.dealForm = {
    ...createEmptyDealForm(),
    dealName: getLeadName(lead),
    company: lead.company || "",
    contactId: lead.contact_id ? String(lead.contact_id) : "",
    leadId: lead.id ? String(lead.id) : "",
    value: lead.value == null ? "" : String(lead.value),
    probability: lead.probability == null ? "" : String(lead.probability),
    expectedCloseDate: lead.expected_close_date
      ? String(lead.expected_close_date).slice(0, 10)
      : "",
    notes: lead.notes || "",
  };
  render();
}

function openDealDelete(dealId) {
  state.dealDeleteId = dealId;
  state.dealDeleteBusy = false;
  state.dealDeleteError = "";
  render();
}

function closeDealDelete() {
  state.dealDeleteId = null;
  state.dealDeleteBusy = false;
  state.dealDeleteError = "";
  render();
}

function openTaskForm(mode, task = null) {
  state.taskFormOpen = true;
  state.taskFormMode = mode;
  state.taskFormId = task?.id || null;
  state.taskFormBusy = false;
  state.taskFormError = "";
  state.taskForm = task
    ? {
        title: task.title || "",
        description: task.description || "",
        taskType: getTaskTypeValue(task),
        priority: getTaskPriorityValue(task),
        status: getTaskStatusValue(task),
        dueDate: task.due_date ? String(task.due_date).slice(0, 10) : "",
        contactId: task.contact_id ? String(task.contact_id) : "",
        leadId: task.lead_id ? String(task.lead_id) : "",
        dealId: task.deal_id ? String(task.deal_id) : "",
      }
    : createEmptyTaskForm();
  render();
}

function closeTaskForm() {
  resetTaskFormState();
  render();
}

function openTaskDelete(taskId) {
  state.taskDeleteId = taskId;
  state.taskDeleteBusy = false;
  state.taskDeleteError = "";
  render();
}

function closeTaskDelete() {
  state.taskDeleteId = null;
  state.taskDeleteBusy = false;
  state.taskDeleteError = "";
  render();
}

function openContactDelete(contactId) {
  state.contactDeleteId = contactId;
  state.contactDeleteBusy = false;
  state.contactDeleteError = "";
  render();
}

function closeContactDelete() {
  state.contactDeleteId = null;
  state.contactDeleteBusy = false;
  state.contactDeleteError = "";
  render();
}

function clearContactFilters() {
  state.contactsQuery = "";
  state.contactsCompany = "All";
  state.contactsStatus = "All";
  state.contactsSource = "All";
  render();
}

function clearLeadFilters() {
  state.leadQuery = "";
  state.leadStatus = "All";
  render();
}

function clearDealFilters() {
  state.dealQuery = "";
  state.dealStage = "All";
  render();
}

function clearTaskFilters() {
  state.taskQuery = "";
  state.taskStatus = "All";
  state.taskPriority = "All";
  state.taskSort = "due-date";
  render();
}

async function handleContactFormSubmit(event) {
  event.preventDefault();

  if (!supabase || !state.session?.user) {
    state.contactFormError =
      supabaseConfigError ||
      "You need an active session before saving contacts.";
    render();
    return;
  }

  const firstName = state.contactForm.firstName.trim();
  const lastName = state.contactForm.lastName.trim();
  const email = state.contactForm.email.trim();
  const phone = state.contactForm.phone.trim();
  const company = state.contactForm.company.trim();
  const jobTitle = state.contactForm.jobTitle.trim();
  const source = state.contactForm.source.trim();
  const status = state.contactForm.status.trim() || "New";
  const notes = state.contactForm.notes.trim();

  if (!firstName) {
    state.contactFormError = "First name is required before saving a contact.";
    render();
    return;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    state.contactFormError =
      "Enter a valid email address or leave the email field blank.";
    render();
    return;
  }

  state.contactFormBusy = true;
  state.contactFormError = "";
  render();

  try {
    const profile = await ensureCurrentProfile();
    const organizationId = profile.organization_id;
    const payload = {
      first_name: firstName,
      last_name: lastName || null,
      email: email || null,
      phone: phone || null,
      company: company || null,
      job_title: jobTitle || null,
      source: source || null,
      status,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    };
    const mode = state.contactFormMode;
    const contactName = [firstName, lastName].filter(Boolean).join(" ");

    state.organizationId = organizationId;

    if (mode === "edit" && state.contactFormId) {
      await updateContact(state.contactFormId, payload);
    } else {
      await createContact({
        ...payload,
        organization_id: organizationId,
        created_by: state.session.user.id,
      });
    }

    resetContactFormState();
    render();
    await loadContacts({ force: true });
    showFlash(
      mode === "edit"
        ? `${contactName || "Contact"} updated successfully.`
        : `${contactName || "Contact"} added successfully.`,
      "success",
    );
  } catch (error) {
    state.contactFormBusy = false;
    state.contactFormError = error.message || "Unable to save this contact.";
    render();
  }
}

async function handleLeadFormSubmit(event) {
  event.preventDefault();

  if (!supabase || !state.session?.user) {
    state.leadFormError =
      supabaseConfigError || "You need an active session before saving leads.";
    render();
    return;
  }

  const leadName = state.leadForm.leadName.trim();
  const company = state.leadForm.company.trim();
  const source = state.leadForm.source.trim();
  const notes = state.leadForm.notes.trim();
  const status = state.leadForm.status.trim() || "New";
  const contactId = state.leadForm.contactId ? state.leadForm.contactId : null;
  const expectedCloseDate = state.leadForm.expectedCloseDate || null;
  const value =
    state.leadForm.value === "" ? null : Number(state.leadForm.value);
  const probability =
    state.leadForm.probability === ""
      ? null
      : Number(state.leadForm.probability);

  if (!leadName) {
    state.leadFormError = "Lead name is required before saving a lead.";
    render();
    return;
  }

  if (value != null && (!Number.isFinite(value) || value < 0)) {
    state.leadFormError = "Lead value must be a valid positive number.";
    render();
    return;
  }

  if (
    probability != null &&
    (!Number.isFinite(probability) || probability < 0 || probability > 100)
  ) {
    state.leadFormError = "Probability must be between 0 and 100.";
    render();
    return;
  }

  state.leadFormBusy = true;
  state.leadFormError = "";
  render();

  try {
    const profile = await ensureCurrentProfile();
    const payload = {
      lead_name: leadName,
      company: company || null,
      contact_id: contactId || null,
      status,
      source: source || null,
      value,
      probability,
      expected_close_date: expectedCloseDate,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    };
    const mode = state.leadFormMode;

    if (mode === "edit" && state.leadFormId) {
      await updateLead(state.leadFormId, payload);
    } else {
      await createLead({
        ...payload,
        organization_id: profile.organization_id,
        created_by: state.session.user.id,
        assigned_to: state.session.user.id,
      });
    }

    resetLeadFormState();
    render();
    await loadLeads({ force: true });
    showFlash(
      mode === "edit"
        ? `${leadName} updated successfully.`
        : `${leadName} added successfully.`,
      "success",
    );
  } catch (error) {
    state.leadFormBusy = false;
    state.leadFormError = error.message || "Unable to save this lead.";
    render();
  }
}

async function handleDealFormSubmit(event) {
  event.preventDefault();

  if (!supabase || !state.session?.user) {
    state.dealFormError =
      supabaseConfigError || "You need an active session before saving deals.";
    render();
    return;
  }

  const dealName = state.dealForm.dealName.trim();
  const company = state.dealForm.company.trim();
  const notes = state.dealForm.notes.trim();
  const stage = state.dealForm.stage.trim() || dealStagePresets[0];
  const contactId = state.dealForm.contactId ? state.dealForm.contactId : null;
  const leadId = state.dealForm.leadId ? state.dealForm.leadId : null;
  const expectedCloseDate = state.dealForm.expectedCloseDate || null;
  const value =
    state.dealForm.value === "" ? null : Number(state.dealForm.value);
  const probability =
    state.dealForm.probability === ""
      ? null
      : Number(state.dealForm.probability);

  if (!dealName) {
    state.dealFormError = "Deal name is required before saving a deal.";
    render();
    return;
  }

  if (value != null && (!Number.isFinite(value) || value < 0)) {
    state.dealFormError = "Deal value must be a valid positive number.";
    render();
    return;
  }

  if (
    probability != null &&
    (!Number.isFinite(probability) || probability < 0 || probability > 100)
  ) {
    state.dealFormError = "Probability must be between 0 and 100.";
    render();
    return;
  }

  state.dealFormBusy = true;
  state.dealFormError = "";
  render();

  try {
    const profile = await ensureCurrentProfile();
    const payload = {
      deal_name: dealName,
      company: company || null,
      contact_id: contactId || null,
      lead_id: leadId || null,
      stage,
      value,
      probability,
      expected_close_date: expectedCloseDate,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    };
    const mode = state.dealFormMode;

    if (mode === "edit" && state.dealFormId) {
      await updateDeal(state.dealFormId, payload);
    } else {
      await createDeal({
        ...payload,
        organization_id: profile.organization_id,
        created_by: state.session.user.id,
        assigned_to: state.session.user.id,
      });
    }

    resetDealFormState();
    render();
    await loadDeals({ force: true });
    showFlash(
      mode === "edit"
        ? `${dealName} updated successfully.`
        : `${dealName} added successfully.`,
      "success",
    );
  } catch (error) {
    state.dealFormBusy = false;
    state.dealFormError = error.message || "Unable to save this deal.";
    render();
  }
}

async function handleTaskFormSubmit(event) {
  event.preventDefault();

  if (!supabase || !state.session?.user) {
    state.taskFormError =
      supabaseConfigError || "You need an active session before saving tasks.";
    render();
    return;
  }

  const title = state.taskForm.title.trim();
  const description = state.taskForm.description.trim();
  const taskType = state.taskForm.taskType.trim() || taskTypePresets[0];
  const priority = state.taskForm.priority.trim() || "Medium";
  const status = state.taskForm.status.trim() || "Pending";
  const dueDate = state.taskForm.dueDate || null;
  const contactId = state.taskForm.contactId ? state.taskForm.contactId : null;
  const leadId = state.taskForm.leadId ? state.taskForm.leadId : null;
  const dealId = state.taskForm.dealId ? state.taskForm.dealId : null;
  const existingTask =
    state.taskFormMode === "edit" ? findTaskById(state.taskFormId) : null;
  const completedAt =
    status === "Completed"
      ? existingTask?.completed_at || new Date().toISOString()
      : null;

  if (!title) {
    state.taskFormError = "Task title is required before saving.";
    render();
    return;
  }

  state.taskFormBusy = true;
  state.taskFormError = "";
  render();

  try {
    const profile = await ensureCurrentProfile();
    const payload = {
      title,
      description: description || null,
      task_type: taskType,
      priority,
      status,
      due_date: dueDate,
      contact_id: contactId || null,
      lead_id: leadId || null,
      deal_id: dealId || null,
      completed_at: completedAt,
      updated_at: new Date().toISOString(),
    };
    const mode = state.taskFormMode;

    if (mode === "edit" && state.taskFormId) {
      await updateTask(state.taskFormId, payload);
    } else {
      await createTask({
        ...payload,
        organization_id: profile.organization_id,
        created_by: state.session.user.id,
        assigned_to: state.session.user.id,
      });
    }

    resetTaskFormState();
    render();
    await loadTasks({ force: true });
    showFlash(
      mode === "edit"
        ? `${title} updated successfully.`
        : `${title} created successfully.`,
      "success",
    );
  } catch (error) {
    state.taskFormBusy = false;
    state.taskFormError = error.message || "Unable to save this task.";
    render();
  }
}

async function handleConfirmContactDelete() {
  const contact = findContactById(state.contactDeleteId);

  if (!contact) {
    closeContactDelete();
    return;
  }

  state.contactDeleteBusy = true;
  state.contactDeleteError = "";
  render();

  try {
    await deleteContact(contact.id);
    state.contactDeleteId = null;
    state.contactDeleteBusy = false;
    state.contactDeleteError = "";
    render();
    await loadContacts({ force: true });
    showFlash(`${getContactName(contact)} deleted successfully.`, "success");
  } catch (error) {
    state.contactDeleteBusy = false;
    state.contactDeleteError =
      error.message || "Unable to delete this contact.";
    render();
  }
}

async function handleConfirmLeadDelete() {
  const lead = findLeadById(state.leadDeleteId);

  if (!lead) {
    closeLeadDelete();
    return;
  }

  state.leadDeleteBusy = true;
  state.leadDeleteError = "";
  render();

  try {
    await deleteLead(lead.id);
    state.leadDeleteId = null;
    state.leadDeleteBusy = false;
    state.leadDeleteError = "";
    render();
    await loadLeads({ force: true });
    showFlash(`${getLeadName(lead)} deleted successfully.`, "success");
  } catch (error) {
    state.leadDeleteBusy = false;
    state.leadDeleteError = error.message || "Unable to delete this lead.";
    render();
  }
}

async function handleConfirmDealDelete() {
  const deal = findDealById(state.dealDeleteId);

  if (!deal) {
    closeDealDelete();
    return;
  }

  state.dealDeleteBusy = true;
  state.dealDeleteError = "";
  render();

  try {
    await deleteDeal(deal.id);
    state.dealDeleteId = null;
    state.dealDeleteBusy = false;
    state.dealDeleteError = "";
    render();
    await loadDeals({ force: true });
    showFlash(`${getDealName(deal)} deleted successfully.`, "success");
  } catch (error) {
    state.dealDeleteBusy = false;
    state.dealDeleteError = error.message || "Unable to delete this deal.";
    render();
  }
}

async function handleConfirmTaskDelete() {
  const task = findTaskById(state.taskDeleteId);

  if (!task) {
    closeTaskDelete();
    return;
  }

  state.taskDeleteBusy = true;
  state.taskDeleteError = "";
  render();

  try {
    await deleteTask(task.id);
    state.taskDeleteId = null;
    state.taskDeleteBusy = false;
    state.taskDeleteError = "";
    render();
    await loadTasks({ force: true });
    showFlash(`${getTaskTitle(task)} deleted successfully.`, "success");
  } catch (error) {
    state.taskDeleteBusy = false;
    state.taskDeleteError = error.message || "Unable to delete this task.";
    render();
  }
}

async function markTaskAsCompleted(taskId) {
  const task = findTaskById(taskId);

  if (!task || isTaskCompleted(task)) return;

  state.taskStatusBusyId = task.id;
  state.taskStatusErrorId = null;
  state.taskStatusError = "";
  render();

  try {
    await updateTask(task.id, {
      status: "Completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    state.taskStatusBusyId = null;
    render();
    await loadTasks({ force: true });
    showFlash(`${getTaskTitle(task)} marked as completed.`, "success");
  } catch (error) {
    state.taskStatusBusyId = null;
    state.taskStatusErrorId = task.id;
    state.taskStatusError =
      error.message || "Unable to mark this task as completed.";
    render();
  }
}

async function moveDealToStage(dealId, stage) {
  const deal = findDealById(dealId);

  if (!deal || !stage) return;

  const previousStage = getDealStageValue(deal);
  if (previousStage === stage) return;

  state.dealStageBusyId = deal.id;
  state.dealStageErrorId = null;
  state.dealStageError = "";
  state.deals = state.deals.map((item) =>
    String(item.id) === String(deal.id) ? { ...item, stage } : item,
  );
  render();

  try {
    await updateDeal(deal.id, {
      stage,
      updated_at: new Date().toISOString(),
    });
    state.dealStageBusyId = null;
    render();
  } catch (error) {
    state.deals = state.deals.map((item) =>
      String(item.id) === String(deal.id)
        ? { ...item, stage: previousStage }
        : item,
    );
    state.dealStageBusyId = null;
    state.dealStageErrorId = deal.id;
    state.dealStageError = error.message || "Unable to update this deal stage.";
    render();
  }
}

function bindEvents() {
  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => setRoute(button.dataset.route));
  });
  document
    .querySelector("[data-login-form]")
    ?.addEventListener("submit", handleLoginSubmit);
  document
    .querySelector("[data-signup-form]")
    ?.addEventListener("submit", handleSignupSubmit);
  document
    .querySelector("[data-auth-email]")
    ?.addEventListener("input", (event) => {
      state.authEmail = event.target.value;
    });
  document
    .querySelector("[data-auth-password]")
    ?.addEventListener("input", (event) => {
      state.authPassword = event.target.value;
    });
  document
    .querySelector("[data-signup-full-name]")
    ?.addEventListener("input", (event) => {
      state.signupFullName = event.target.value;
    });
  document
    .querySelector("[data-signup-company-name]")
    ?.addEventListener("input", (event) => {
      state.signupCompanyName = event.target.value;
    });
  document
    .querySelector("[data-signup-email]")
    ?.addEventListener("input", (event) => {
      state.signupEmail = event.target.value;
    });
  document
    .querySelector("[data-signup-password]")
    ?.addEventListener("input", (event) => {
      state.signupPassword = event.target.value;
    });
  document
    .querySelector("[data-signup-confirm-password]")
    ?.addEventListener("input", (event) => {
      state.signupConfirmPassword = event.target.value;
    });
  document
    .querySelector("[data-logout]")
    ?.addEventListener("click", handleLogout);
  document.querySelector("[data-toggle-nav]")?.addEventListener("click", () => {
    state.sidebarOpen = !state.sidebarOpen;
    render();
  });
  document.querySelector("[data-close-nav]")?.addEventListener("click", () => {
    state.sidebarOpen = false;
    render();
  });
  document
    .querySelector("[data-global-search]")
    ?.addEventListener("input", (event) => {
      updateGlobalSearchQuery(event.target.value);
      render();
    });
  document
    .querySelector("[data-settings-form]")
    ?.addEventListener("submit", handleSettingsFormSubmit);
  document.querySelectorAll("[data-settings-reload]").forEach((button) => {
    button.addEventListener("click", () => {
      void loadOrganizationSettings({ force: true });
    });
  });
  document.querySelectorAll("[data-dashboard-reload]").forEach((button) => {
    button.addEventListener("click", () => {
      void loadDashboardData({ force: true });
    });
  });
  document.querySelectorAll("[data-settings-field]").forEach((field) => {
    const syncField = (event) => {
      state.organizationForm = {
        ...state.organizationForm,
        [event.target.dataset.settingsField]: event.target.value,
      };
      state.organizationSaveSuccess = "";
      state.organizationSaveError = "";
      document.querySelector("[data-settings-save-success]")?.remove();
      document.querySelector("[data-settings-save-error]")?.remove();
      syncSettingsPreview();
    };

    field.addEventListener("input", syncField);
    field.addEventListener("change", syncField);
  });
  document
    .querySelector("[data-task-search]")
    ?.addEventListener("input", (event) => {
      state.taskQuery = event.target.value;
      render();
    });
  document
    .querySelector("[data-task-status]")
    ?.addEventListener("change", (event) => {
      state.taskStatus = event.target.value;
      render();
    });
  document
    .querySelector("[data-task-priority]")
    ?.addEventListener("change", (event) => {
      state.taskPriority = event.target.value;
      render();
    });
  document
    .querySelector("[data-task-sort]")
    ?.addEventListener("change", (event) => {
      state.taskSort = event.target.value;
      render();
    });
  document.querySelectorAll("[data-open-task-create]").forEach((button) => {
    button.addEventListener("click", () => openTaskForm("create"));
  });
  document.querySelectorAll("[data-tasks-reload]").forEach((button) => {
    button.addEventListener("click", () => {
      void loadTasks({ force: true });
      void loadContacts({ force: true });
      void loadLeads({ force: true });
      void loadDeals({ force: true });
    });
  });
  document.querySelectorAll("[data-clear-task-filters]").forEach((button) => {
    button.addEventListener("click", clearTaskFilters);
  });
  document.querySelectorAll("[data-clients-reload]").forEach((button) => {
    button.addEventListener("click", () => {
      void loadContacts({ force: true });
    });
  });
  document.querySelectorAll("[data-clear-client-search]").forEach((button) => {
    button.addEventListener("click", () => {
      state.clientQuery = "";
      render();
    });
  });
  document.querySelectorAll("[data-edit-task-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const task = findTaskById(button.dataset.editTaskId);
      if (task) openTaskForm("edit", task);
    });
  });
  document.querySelectorAll("[data-delete-task-id]").forEach((button) => {
    button.addEventListener("click", () =>
      openTaskDelete(button.dataset.deleteTaskId),
    );
  });
  document.querySelectorAll("[data-complete-task-id]").forEach((button) => {
    button.addEventListener("click", () => {
      void markTaskAsCompleted(button.dataset.completeTaskId);
    });
  });
  document
    .querySelectorAll("[data-dashboard-task-toggle-id]")
    .forEach((field) => {
      field.addEventListener("change", (event) => {
        if (event.target.checked) {
          void markTaskAsCompleted(event.target.dataset.dashboardTaskToggleId);
        }
      });
    });
  document
    .querySelector("[data-task-form]")
    ?.addEventListener("submit", handleTaskFormSubmit);
  document.querySelectorAll("[data-task-field]").forEach((field) => {
    const syncField = (event) => {
      state.taskForm = {
        ...state.taskForm,
        [event.target.dataset.taskField]: event.target.value,
      };
    };

    field.addEventListener("input", syncField);
    field.addEventListener("change", syncField);
  });
  document.querySelectorAll("[data-close-task-form]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const clickedBackdrop = event.target === element;
      const clickedDismissControl = element.tagName === "BUTTON";

      if (clickedBackdrop || clickedDismissControl) {
        closeTaskForm();
      }
    });
  });
  document.querySelectorAll("[data-close-task-delete]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const clickedBackdrop = event.target === element;
      const clickedDismissControl = element.tagName === "BUTTON";

      if (clickedBackdrop || clickedDismissControl) {
        closeTaskDelete();
      }
    });
  });
  document
    .querySelector("[data-confirm-task-delete]")
    ?.addEventListener("click", handleConfirmTaskDelete);
  document
    .querySelector("[data-lead-search]")
    ?.addEventListener("input", (event) => {
      state.leadQuery = event.target.value;
      render();
    });
  document
    .querySelector("[data-lead-status]")
    ?.addEventListener("change", (event) => {
      state.leadStatus = event.target.value;
      render();
    });
  document.querySelectorAll("[data-open-lead-create]").forEach((button) => {
    button.addEventListener("click", () => openLeadForm("create"));
  });
  document.querySelectorAll("[data-leads-reload]").forEach((button) => {
    button.addEventListener("click", () => {
      void loadLeads({ force: true });
      void loadContacts({ force: true });
    });
  });
  document.querySelectorAll("[data-clear-lead-filters]").forEach((button) => {
    button.addEventListener("click", clearLeadFilters);
  });
  document.querySelectorAll("[data-edit-lead-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const lead = findLeadById(button.dataset.editLeadId);
      if (lead) openLeadForm("edit", lead);
    });
  });
  document.querySelectorAll("[data-delete-lead-id]").forEach((button) => {
    button.addEventListener("click", () =>
      openLeadDelete(button.dataset.deleteLeadId),
    );
  });
  document
    .querySelectorAll("[data-create-deal-from-lead-id]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const lead = findLeadById(button.dataset.createDealFromLeadId);
        if (lead) openDealFormFromLead(lead);
      });
    });
  document
    .querySelector("[data-lead-form]")
    ?.addEventListener("submit", handleLeadFormSubmit);
  document.querySelectorAll("[data-lead-field]").forEach((field) => {
    const syncField = (event) => {
      state.leadForm = {
        ...state.leadForm,
        [event.target.dataset.leadField]: event.target.value,
      };
    };

    field.addEventListener("input", syncField);
    field.addEventListener("change", syncField);
  });
  document.querySelectorAll("[data-close-lead-form]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const clickedBackdrop = event.target === element;
      const clickedDismissControl = element.tagName === "BUTTON";

      if (clickedBackdrop || clickedDismissControl) {
        closeLeadForm();
      }
    });
  });
  document.querySelectorAll("[data-close-lead-delete]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const clickedBackdrop = event.target === element;
      const clickedDismissControl = element.tagName === "BUTTON";

      if (clickedBackdrop || clickedDismissControl) {
        closeLeadDelete();
      }
    });
  });
  document
    .querySelector("[data-confirm-lead-delete]")
    ?.addEventListener("click", handleConfirmLeadDelete);
  document
    .querySelector("[data-deal-search]")
    ?.addEventListener("input", (event) => {
      state.dealQuery = event.target.value;
      render();
    });
  document
    .querySelector("[data-deal-stage]")
    ?.addEventListener("change", (event) => {
      state.dealStage = event.target.value;
      render();
    });
  document.querySelectorAll("[data-open-deal-create]").forEach((button) => {
    button.addEventListener("click", () => openDealForm("create"));
  });
  document.querySelectorAll("[data-deals-reload]").forEach((button) => {
    button.addEventListener("click", () => {
      void loadDeals({ force: true });
      void loadContacts({ force: true });
      void loadLeads({ force: true });
    });
  });
  document.querySelectorAll("[data-clear-deal-filters]").forEach((button) => {
    button.addEventListener("click", clearDealFilters);
  });
  document.querySelectorAll("[data-open-deal-detail-id]").forEach((card) => {
    card.addEventListener("click", () =>
      openDealDetail(card.dataset.openDealDetailId),
    );
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDealDetail(card.dataset.openDealDetailId);
      }
    });
  });
  document.querySelectorAll("[data-edit-deal-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const deal = findDealById(button.dataset.editDealId);
      if (deal) {
        state.selectedDealId = null;
        openDealForm("edit", deal);
      }
    });
  });
  document.querySelectorAll("[data-delete-deal-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDealId = null;
      openDealDelete(button.dataset.deleteDealId);
    });
  });
  document
    .querySelector("[data-deal-form]")
    ?.addEventListener("submit", handleDealFormSubmit);
  document.querySelectorAll("[data-deal-field]").forEach((field) => {
    const syncField = (event) => {
      state.dealForm = {
        ...state.dealForm,
        [event.target.dataset.dealField]: event.target.value,
      };
    };

    field.addEventListener("input", syncField);
    field.addEventListener("change", syncField);
  });
  document.querySelectorAll("[data-close-deal-form]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const clickedBackdrop = event.target === element;
      const clickedDismissControl = element.tagName === "BUTTON";

      if (clickedBackdrop || clickedDismissControl) {
        closeDealForm();
      }
    });
  });
  document.querySelectorAll("[data-close-deal-delete]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const clickedBackdrop = event.target === element;
      const clickedDismissControl = element.tagName === "BUTTON";

      if (clickedBackdrop || clickedDismissControl) {
        closeDealDelete();
      }
    });
  });
  document
    .querySelector("[data-confirm-deal-delete]")
    ?.addEventListener("click", handleConfirmDealDelete);
  document.querySelectorAll("[data-close-deal-detail]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const clickedBackdrop = event.target === element;
      const clickedDismissControl = element.tagName === "BUTTON";

      if (clickedBackdrop || clickedDismissControl) {
        closeDealDetail();
      }
    });
  });
  document.querySelectorAll("[data-deal-stage-id]").forEach((field) => {
    field.addEventListener("change", (event) => {
      void moveDealToStage(
        event.target.dataset.dealStageId,
        event.target.value,
      );
    });
  });
  document
    .querySelector("[data-contact-search]")
    ?.addEventListener("input", (event) => {
      state.contactsQuery = event.target.value;
      render();
    });
  document
    .querySelector("[data-contact-company]")
    ?.addEventListener("change", (event) => {
      state.contactsCompany = event.target.value;
      render();
    });
  document
    .querySelector("[data-contact-status]")
    ?.addEventListener("change", (event) => {
      state.contactsStatus = event.target.value;
      render();
    });
  document
    .querySelector("[data-contact-source]")
    ?.addEventListener("change", (event) => {
      state.contactsSource = event.target.value;
      render();
    });
  document.querySelectorAll("[data-open-contact-create]").forEach((button) => {
    button.addEventListener("click", () => openContactForm("create"));
  });
  document.querySelectorAll("[data-contacts-reload]").forEach((button) => {
    button.addEventListener("click", () => {
      void loadContacts({ force: true });
    });
  });
  document
    .querySelectorAll("[data-clear-contact-filters]")
    .forEach((button) => {
      button.addEventListener("click", clearContactFilters);
    });
  document.querySelectorAll("[data-edit-contact-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const contact = findContactById(button.dataset.editContactId);
      if (contact) openContactForm("edit", contact);
    });
  });
  document.querySelectorAll("[data-delete-contact-id]").forEach((button) => {
    button.addEventListener("click", () =>
      openContactDelete(button.dataset.deleteContactId),
    );
  });
  document
    .querySelector("[data-contact-form]")
    ?.addEventListener("submit", handleContactFormSubmit);
  document.querySelectorAll("[data-contact-field]").forEach((field) => {
    const syncField = (event) => {
      state.contactForm = {
        ...state.contactForm,
        [event.target.dataset.contactField]: event.target.value,
      };
    };

    field.addEventListener("input", syncField);
    field.addEventListener("change", syncField);
  });
  document.querySelectorAll("[data-close-contact-form]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const clickedBackdrop = event.target === element;
      const clickedDismissControl = element.tagName === "BUTTON";

      if (clickedBackdrop || clickedDismissControl) {
        closeContactForm();
      }
    });
  });
  document
    .querySelectorAll("[data-close-contact-delete]")
    .forEach((element) => {
      element.addEventListener("click", (event) => {
        const clickedBackdrop = event.target === element;
        const clickedDismissControl = element.tagName === "BUTTON";

        if (clickedBackdrop || clickedDismissControl) {
          closeContactDelete();
        }
      });
    });
  document
    .querySelector("[data-confirm-contact-delete]")
    ?.addEventListener("click", handleConfirmContactDelete);
  document.querySelectorAll("[data-client-id]").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedClient =
        state.contacts.find(
          (client) => String(client.id) === String(card.dataset.clientId),
        ) || null;
      render();
    });
  });
  document.querySelectorAll("[data-close-client]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (event.target === element || element.classList.contains("close")) {
        state.selectedClient = null;
        render();
      }
    });
  });
  bindDragAndDrop();
}

function bindDragAndDrop() {
  document.querySelectorAll(".deal-card").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      if (String(state.dealStageBusyId) === String(card.dataset.dealId)) {
        event.preventDefault();
        return;
      }

      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", card.dataset.dealId);
    });
  });

  document.querySelectorAll(".deals-column").forEach((column) => {
    column.addEventListener("dragover", (event) => {
      event.preventDefault();
      column.classList.add("drag-over");
    });
    column.addEventListener("dragleave", () =>
      column.classList.remove("drag-over"),
    );
    column.addEventListener("drop", (event) => {
      event.preventDefault();
      column.classList.remove("drag-over");
      const id = event.dataTransfer.getData("text/plain");
      void moveDealToStage(id, column.dataset.stage);
    });
  });
}

async function bootstrapAuth() {
  render();

  if (!supabase) return;

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    state.authError = error.message;
  }

  applySession(session);

  supabase.auth.onAuthStateChange((_event, nextSession) => {
    const currentToken = state.session?.access_token || null;
    const nextToken = nextSession?.access_token || null;

    if (
      currentToken === nextToken &&
      Boolean(state.session) === Boolean(nextSession)
    ) {
      return;
    }

    applySession(nextSession);
  });
}

window.addEventListener("hashchange", () => {
  const route = isAuthenticated()
    ? getRequestedRoute()
    : getRequestedPublicRoute();
  if (route !== state.route) setRoute(route);
});

bootstrapAuth();
