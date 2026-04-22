import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ChevronLeft, ChevronRight, Upload, Dumbbell, Clock3, MapPin, Filter, Layers3, Users, BookOpen, Monitor, Building2, Briefcase, GraduationCap, Globe, Wrench, FlaskConical, Laptop, Trash2, PenTool, Wifi, Star } from "lucide-react";
import { motion } from "framer-motion";

const TRAINING_TYPE_OPTIONS = ["Nursery", "Projects", "Special Requests", "GreenLink", "TMO"];
const AUDIENCE_OPTIONS = ["Internal - Team", "Internal - Teacher Training (TT)", "External"];
const CONTENT_TYPE_OPTIONS = ["Theory", "Practical", "Hybrid"];
const DELIVERY_METHOD_OPTIONS = ["Online", "Onsite"];
const DEFAULT_TRAINING_TOPICS = [
  "Induction",
  "Safety",
  "GreenLink Orientation",
  "Irrigation Troubleshooting",
  "Planning Workshop",
];
const DEFAULT_FACILITATORS = [
  "Amina",
  "Karim",
  "Lina",
  "Rashid",
  "Nadia",
];

const sampleTrainingData = [
  {
    id: 1,
    title: "Nursery induction for new staff",
    trainingTopic: "Induction",
    entity: "Green Academy",
    date: "2026-04-03",
    startTime: "09:00",
    endTime: "10:30",
    trainingType: "Nursery",
    audience: "Internal - Team",
    contentType: "Theory",
    deliveryMethod: "Online",
    location: "Teams",
    facilitator: "Amina",
    notes: "Introduction to nursery workflows and seasonal priorities.",
  },
  {
    id: 2,
    title: "Project handover training",
    trainingTopic: "Planning Workshop",
    entity: "Project Delta Contractor",
    date: "2026-04-03",
    startTime: "13:00",
    endTime: "15:00",
    trainingType: "Projects",
    audience: "Internal - Teacher Training (TT)",
    contentType: "Hybrid",
    deliveryMethod: "Onsite",
    location: "Training Room A",
    facilitator: "Karim",
    notes: "Includes classroom overview and site walk-through.",
  },
  {
    id: 3,
    title: "GreenLink platform orientation",
    trainingTopic: "GreenLink Orientation",
    entity: "Municipality Client Team",
    date: "2026-04-08",
    startTime: "11:00",
    endTime: "12:00",
    trainingType: "GreenLink",
    audience: "External",
    contentType: "Theory",
    deliveryMethod: "Online",
    location: "Zoom",
    facilitator: "Lina",
    notes: "Navigation, reporting, and user roles.",
  },
  {
    id: 4,
    title: "Special request: irrigation troubleshooting",
    trainingTopic: "Irrigation Troubleshooting",
    entity: "Oasis Facilities",
    date: "2026-04-10",
    startTime: "08:30",
    endTime: "11:30",
    trainingType: "Special Requests",
    audience: "Internal - Team",
    contentType: "Practical",
    deliveryMethod: "Onsite",
    location: "South Compound",
    facilitator: "Rashid",
    notes: "Hands-on diagnostics and repair workflow.",
  },
  {
    id: 5,
    title: "TMO safety refresher",
    trainingTopic: "Safety",
    entity: "TMO Operations",
    date: "2026-04-12",
    startTime: "14:00",
    endTime: "15:30",
    trainingType: "TMO",
    audience: "Internal - Team",
    contentType: "Theory",
    deliveryMethod: "Online",
    location: "Teams",
    facilitator: "Nadia",
    notes: "Updated safety expectations and reporting chain.",
  },
  {
    id: 6,
    title: "Nursery practical demonstration",
    trainingTopic: "Induction",
    entity: "External Delegation",
    date: "2026-04-15",
    startTime: "07:30",
    endTime: "09:30",
    trainingType: "Nursery",
    audience: "External",
    contentType: "Practical",
    deliveryMethod: "Onsite",
    location: "Nursery Block C",
    facilitator: "Amina",
    notes: "Propagation setup and quality checks.",
  },
  {
    id: 7,
    title: "Projects TT planning workshop",
    trainingTopic: "Planning Workshop",
    entity: "Projects Division",
    date: "2026-04-18",
    startTime: "10:00",
    endTime: "12:00",
    trainingType: "Projects",
    audience: "Internal - Teacher Training (TT)",
    contentType: "Hybrid",
    deliveryMethod: "Onsite",
    location: "HQ Meeting Room 2",
    facilitator: "Karim",
    notes: "Planning template walkthrough with mock delivery.",
  },
  {
    id: 8,
    title: "GreenLink field implementation session",
    trainingTopic: "GreenLink Orientation",
    entity: "Pilot Site Contractor",
    date: "2026-04-21",
    startTime: "09:30",
    endTime: "11:00",
    trainingType: "GreenLink",
    audience: "Internal - Team",
    contentType: "Hybrid",
    deliveryMethod: "Onsite",
    location: "Pilot Site",
    facilitator: "Lina",
    notes: "Dashboard review followed by field validation.",
  },
];

const trainingTypeStyles = {
  Nursery: {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    soft: "bg-emerald-50 border-emerald-200",
    accent: "bg-emerald-500",
    text: "text-emerald-900",
  },
  Projects: {
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    soft: "bg-blue-50 border-blue-200",
    accent: "bg-blue-500",
    text: "text-blue-900",
  },
  "Special Requests": {
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    soft: "bg-amber-50 border-amber-200",
    accent: "bg-amber-500",
    text: "text-amber-900",
  },
  GreenLink: {
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
    soft: "bg-cyan-50 border-cyan-200",
    accent: "bg-cyan-500",
    text: "text-cyan-900",
  },
  TMO: {
    badge: "bg-violet-100 text-violet-800 border-violet-200",
    soft: "bg-violet-50 border-violet-200",
    accent: "bg-violet-500",
    text: "text-violet-900",
  },
  Default: {
    badge: "bg-slate-100 text-slate-800 border-slate-200",
    soft: "bg-slate-50 border-slate-200",
    accent: "bg-slate-400",
    text: "text-slate-900",
  },
};

function getAudienceMeta(audience) {
  switch (audience) {
    case "Internal - Team":
      return { icon: Briefcase, label: "Internal Team" };
    case "Internal - Teacher Training (TT)":
      return { icon: GraduationCap, label: "Teacher Training" };
    case "External":
      return { icon: Globe, label: "External" };
    default:
      return { icon: Users, label: audience || "Audience" };
  }
}

function getContentMeta(contentType) {
  switch (contentType) {
    case "Theory":
      return { icon: BookOpen, label: "Theory" };
    case "Practical":
      return { icon: Wrench, label: "Practical" };
    case "Hybrid":
      return { icon: Star, label: "Hybrid" };
    default:
      return { icon: Layers3, label: contentType || "Content" };
  }
}

function getDeliveryMeta(deliveryMethod) {
  switch (deliveryMethod) {
    case "Online":
      return { icon: Laptop, label: "Online" };
    case "Onsite":
      return { icon: Building2, label: "Onsite" };
    default:
      return { icon: Monitor, label: deliveryMethod || "Delivery" };
  }
}

function HierarchyTag({ icon: Icon, label }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-600">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
  );
}

function getAudienceBadgeMeta(audience) {
  switch (audience) {
    case "External":
      return { short: "E", label: "External" };
    case "Internal - Team":
      return { short: "I", label: "Internal Team" };
    case "Internal - Teacher Training (TT)":
      return { short: "I", label: "Internal TT" };
    default:
      return { short: "?", label: audience || "Audience" };
  }
}

function getContentBadgeMeta(contentType) {
  switch (contentType) {
    case "Theory":
      return { icon: BookOpen, label: "Theory" };
    case "Practical":
      return { icon: PenTool, label: "Practical" };
    case "Hybrid":
      return { icon: Star, label: "Hybrid" };
    default:
      return { icon: Layers3, label: contentType || "Content" };
  }
}

function getDeliveryBadgeMeta(deliveryMethod) {
  switch (deliveryMethod) {
    case "Online":
      return { icon: Wifi, label: "Online" };
    case "Onsite":
      return { icon: Building2, label: "Onsite" };
    default:
      return { icon: Monitor, label: deliveryMethod || "Delivery" };
  }
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line, index) => {
    const values = line.split(",").map((v) => v.trim());
    const entry = { id: Date.now() + index };
    headers.forEach((header, i) => {
      entry[header] = values[i] ?? "";
    });
    return entry;
  });
}

function formatMonthYear(date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function formatDayLabel(date) {
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function getMonthGrid(currentDate) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const startDay = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastOfMonth.getDate();

  const cells = [];

  for (let i = 0; i < startDay; i++) {
    const d = new Date(year, month, -(startDay - 1 - i));
    cells.push({ date: d, inCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), inCurrentMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const d = new Date(year, month + 1, cells.length - (startDay + daysInMonth) + 1);
    cells.push({ date: d, inCurrentMonth: false });
  }

  return cells;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function normalizeTrainingItem(item, index) {
  return {
    id: item.id ?? index + 1,
    title: item.title ?? item.trainingTopic ?? "Training Session",
    trainingTopic: item.trainingTopic ?? item.title ?? "",
    entity: item.entity ?? "",
    date: item.date,
    startTime: item.startTime ?? "",
    endTime: item.endTime ?? "",
    trainingType: item.trainingType ?? item.type ?? "Nursery",
    audience: item.audience ?? "Internal - Team",
    contentType: item.contentType ?? item.content ?? "Theory",
    deliveryMethod: item.deliveryMethod ?? "Online",
    location: item.location ?? "",
    facilitator: item.facilitator ?? item.coach ?? "",
    notes: item.notes ?? "",
  };
}

export default function TrainingCalendarApp() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 3, 21));
  const [trainingData, setTrainingData] = useState(sampleTrainingData);
  const [selectedTrainingType, setSelectedTrainingType] = useState("All");
  const [selectedAudience, setSelectedAudience] = useState("All");
  const [selectedContentType, setSelectedContentType] = useState("All");
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [rawImport, setRawImport] = useState(`[
  {
    "title": "Nursery induction",
    "date": "2026-04-24",
    "startTime": "09:00",
    "endTime": "10:30",
    "trainingType": "Nursery",
    "trainingTopic": "Induction",
    "entity": "Green Academy",
    "audience": "Internal - Team",
    "contentType": "Theory",
    "deliveryMethod": "Online",
    "location": "Teams",
    "facilitator": "Amina",
    "notes": "Monthly induction session"
  }
]`);
  const [importError, setImportError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    trainingTopic: "",
    entity: "",
    date: "2026-04-21",
    startTime: "09:00",
    endTime: "10:00",
    trainingType: "Nursery",
    audience: "Internal - Team",
    contentType: "Theory",
    deliveryMethod: "Online",
    location: "",
    facilitator: "",
    notes: "",
  });
  const [formError, setFormError] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [customFacilitator, setCustomFacilitator] = useState("");
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  const normalizedData = useMemo(
    () => trainingData.map((item, index) => normalizeTrainingItem(item, index)),
    [trainingData]
  );

  const trainingTypes = useMemo(() => {
    return ["All", ...new Set([...TRAINING_TYPE_OPTIONS, ...normalizedData.map((item) => item.trainingType)])];
  }, [normalizedData]);

  const audienceOptions = useMemo(() => {
    return ["All", ...new Set([...AUDIENCE_OPTIONS, ...normalizedData.map((item) => item.audience)])];
  }, [normalizedData]);

  const contentTypeOptions = useMemo(() => {
    return ["All", ...new Set([...CONTENT_TYPE_OPTIONS, ...normalizedData.map((item) => item.contentType)])];
  }, [normalizedData]);

  const deliveryMethodOptions = useMemo(() => {
    return ["All", ...new Set([...DELIVERY_METHOD_OPTIONS, ...normalizedData.map((item) => item.deliveryMethod)])];
  }, [normalizedData]);

  const trainingTopicOptions = useMemo(() => {
    return [...new Set([...DEFAULT_TRAINING_TOPICS, ...normalizedData.map((item) => item.trainingTopic).filter(Boolean)])].sort();
  }, [normalizedData]);

  const facilitatorOptions = useMemo(() => {
    return [...new Set([...DEFAULT_FACILITATORS, ...normalizedData.map((item) => item.facilitator).filter(Boolean)])].sort();
  }, [normalizedData]);

  const filteredData = useMemo(() => {
    return normalizedData.filter((item) => {
      const matchesTrainingType = selectedTrainingType === "All" || item.trainingType === selectedTrainingType;
      const matchesAudience = selectedAudience === "All" || item.audience === selectedAudience;
      const matchesContentType = selectedContentType === "All" || item.contentType === selectedContentType;
      const matchesDeliveryMethod = selectedDeliveryMethod === "All" || item.deliveryMethod === selectedDeliveryMethod;
      const haystack = `${item.title} ${item.trainingTopic} ${item.entity} ${item.trainingType} ${item.audience} ${item.contentType} ${item.deliveryMethod} ${item.location} ${item.facilitator} ${item.notes}`.toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      return matchesTrainingType && matchesAudience && matchesContentType && matchesDeliveryMethod && matchesSearch;
    });
  }, [normalizedData, selectedTrainingType, selectedAudience, selectedContentType, selectedDeliveryMethod, searchTerm]);

  const sessionsByDate = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      acc[item.date].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
      return acc;
    }, {});
  }, [filteredData]);

  const selectedSessions = useMemo(() => {
    return sessionsByDate[toDateKey(selectedDate)] ?? [];
  }, [sessionsByDate, selectedDate]);

  const totalSessions = filteredData.length;
  const trainingTypeCounts = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      acc[item.trainingType] = (acc[item.trainingType] || 0) + 1;
      return acc;
    }, {});
  }, [filteredData]);
  const totalHours = filteredData.reduce((sum, item) => {
    if (!item.startTime || !item.endTime) return sum;
    const [sh, sm] = item.startTime.split(":").map(Number);
    const [eh, em] = item.endTime.split(":").map(Number);
    const minutes = eh * 60 + em - (sh * 60 + sm);
    return sum + Math.max(0, minutes / 60);
  }, 0);

  const monthCells = getMonthGrid(currentMonth);
  const today = new Date();

  function handlePrevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }

  React.useEffect(() => {
    setFormData((current) => ({ ...current, date: toDateKey(selectedDate) }));
  }, [selectedDate]);

  function handleImportJson() {
    try {
      const parsed = JSON.parse(rawImport);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of session objects.");
      setTrainingData(parsed);
      setImportError("");
      if (parsed[0]?.date) setSelectedDate(new Date(parsed[0].date));
    } catch (error) {
      setImportError(error.message || "Could not parse JSON.");
    }
  }

  function handleImportCsv() {
    try {
      const parsed = parseCsv(rawImport);
      if (!parsed.length) throw new Error("CSV appears empty or invalid.");
      setTrainingData(parsed);
      setImportError("");
      if (parsed[0]?.date) setSelectedDate(new Date(parsed[0].date));
    } catch (error) {
      setImportError(error.message || "Could not parse CSV.");
    }
  }

  function updateFormField(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function resetForm(dateValue = formData.date) {
    setFormData({
      title: "",
      trainingTopic: "",
      entity: "",
      date: dateValue,
      startTime: "09:00",
      endTime: "10:00",
      trainingType: "Nursery",
      audience: "Internal - Team",
      contentType: "Theory",
      deliveryMethod: "Online",
      location: "",
      facilitator: "",
      notes: "",
    });
    setCustomTopic("");
    setCustomFacilitator("");
    setEditingSessionId(null);
    setFormError("");
  }

  function handleAddSession() {
    if (!formData.trainingTopic.trim()) {
      setFormError("Please select or add a training topic.");
      return;
    }

    if (!formData.date) {
      setFormError("Please choose a date.");
      return;
    }

    const preparedSession = {
      ...formData,
      title: formData.trainingTopic.trim(),
      trainingTopic: formData.trainingTopic.trim(),
      entity: formData.entity.trim(),
      location: formData.location.trim(),
      facilitator: formData.facilitator.trim(),
      notes: formData.notes.trim(),
    };

    if (editingSessionId !== null) {
      setTrainingData((current) => current.map((item) => (
        item.id === editingSessionId ? { ...item, ...preparedSession, id: editingSessionId } : item
      )));
    } else {
      setTrainingData((current) => [...current, { id: Date.now(), ...preparedSession }]);
    }

    setSelectedDate(new Date(formData.date));
    setCurrentMonth(new Date(formData.date));
    resetForm(formData.date);
  }

  function handleDeleteSession(sessionId) {
    setTrainingData((current) => current.filter((item) => item.id !== sessionId));
    if (editingSessionId === sessionId) {
      resetForm(toDateKey(selectedDate));
    }
  }

  function handleEditSession(session) {
    setEditingSessionId(session.id);
    setFormData({
      title: session.title ?? session.trainingTopic ?? "",
      trainingTopic: session.trainingTopic ?? session.title ?? "",
      entity: session.entity ?? "",
      date: session.date ?? toDateKey(selectedDate),
      startTime: session.startTime ?? "09:00",
      endTime: session.endTime ?? "10:00",
      trainingType: session.trainingType ?? "Nursery",
      audience: session.audience ?? "Internal - Team",
      contentType: session.contentType ?? "Theory",
      deliveryMethod: session.deliveryMethod ?? "Online",
      location: session.location ?? "",
      facilitator: session.facilitator ?? "",
      notes: session.notes ?? "",
    });
    setCustomTopic("");
    setCustomFacilitator("");
    setFormError("");
  }

  function handleUseCustomTopic() {
    if (!customTopic.trim()) return;
    updateFormField("trainingTopic", customTopic.trim());
  }

  function handleUseCustomFacilitator() {
    if (!customFacilitator.trim()) return;
    updateFormField("facilitator", customFacilitator.trim());
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "grid gap-4",
            isRightPanelCollapsed ? "lg:grid-cols-[1fr_auto]" : "lg:grid-cols-[1.4fr_auto_0.9fr]"
          )}
        >
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Calendar className="h-6 w-6" />
                    Green Academy Training Calendar
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-600">
                    Display, filter, and review training sessions by day.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-full min-w-[220px] md:w-64">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search title, topic, entity, audience, facilitator..."
                      className="rounded-xl bg-white"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm text-slate-600">
                      <Filter className="h-4 w-4" />
                      <select
                        value={selectedTrainingType}
                        onChange={(e) => setSelectedTrainingType(e.target.value)}
                        className="bg-transparent outline-none"
                      >
                        {trainingTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm text-slate-600">
                      <Users className="h-4 w-4" />
                      <select
                        value={selectedAudience}
                        onChange={(e) => setSelectedAudience(e.target.value)}
                        className="bg-transparent outline-none"
                      >
                        {audienceOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm text-slate-600">
                      <BookOpen className="h-4 w-4" />
                      <select
                        value={selectedContentType}
                        onChange={(e) => setSelectedContentType(e.target.value)}
                        className="bg-transparent outline-none"
                      >
                        {contentTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm text-slate-600">
                      <Monitor className="h-4 w-4" />
                      <select
                        value={selectedDeliveryMethod}
                        onChange={(e) => setSelectedDeliveryMethod(e.target.value)}
                        className="bg-transparent outline-none"
                      >
                        {deliveryMethodOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="rounded-2xl border-slate-200 shadow-none">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="rounded-2xl bg-slate-100 p-3">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Sessions</p>
                      <p className="text-2xl font-semibold">{totalSessions}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200 shadow-none">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="rounded-2xl bg-slate-100 p-3">
                      <Clock3 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Hours Scheduled</p>
                      <p className="text-2xl font-semibold">{totalHours.toFixed(1)}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200 shadow-none">
                  <CardContent className="p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Selected Date</p>
                    <p className="text-lg font-semibold">
                      {selectedDate.toLocaleDateString(undefined, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(trainingTypeCounts).map(([type, count]) => {
                  const style = trainingTypeStyles[type] || trainingTypeStyles.Default;
                  return (
                    <div
                      key={type}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                        style.badge
                      )}
                    >
                      <span className={cn("h-2.5 w-2.5 rounded-full", style.accent)} />
                      <span>{type}</span>
                      <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[10px]">{count}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-xl">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-semibold">{formatMonthYear(currentMonth)}</h2>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-xl">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
                {Array.from({ length: 7 }).map((_, index) => {
                  const base = new Date(2026, 0, 5 + index);
                  return (
                    <div key={index} className="py-2">
                      {formatDayLabel(base)}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {monthCells.map(({ date, inCurrentMonth }, index) => {
                  const key = toDateKey(date);
                  const sessions = sessionsByDate[key] ?? [];
                  const isSelected = isSameDay(date, selectedDate);
                  const isToday = isSameDay(date, today);

                  return (
                    <motion.button
                      key={`${key}-${index}`}
                      whileHover={{ y: -2 }}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "min-h-[130px] rounded-2xl border p-2 text-left transition shadow-sm",
                        inCurrentMonth ? "bg-white border-slate-200" : "bg-slate-100/60 border-slate-200 text-slate-400",
                        isSelected && "ring-2 ring-slate-900",
                        isToday && "border-slate-400"
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold">{date.getDate()}</span>
                        {sessions.length > 0 && (
                          <Badge variant="secondary" className="rounded-full">
                            {sessions.length}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        {sessions.slice(0, 3).map((session) => {
                          const audienceMeta = getAudienceMeta(session.audience);
                          const contentMeta = getContentMeta(session.contentType);
                          const deliveryMeta = getDeliveryMeta(session.deliveryMethod);
                          const AudienceIcon = audienceMeta.icon;
                          const ContentIcon = contentMeta.icon;
                          const DeliveryIcon = deliveryMeta.icon;
                          return (
                            <div
                              key={session.id}
                              className={cn(
                                "rounded-lg border px-2 py-1 text-[11px] font-medium",
                                (trainingTypeStyles[session.trainingType] || trainingTypeStyles.Default).badge
                              )}
                            >
                              <div className="flex items-center gap-1 overflow-hidden">
                                <span className="shrink-0">{session.startTime ? `${session.startTime}` : "--:--"}</span>
                                <AudienceIcon className="h-3.5 w-3.5 shrink-0" />
                                <ContentIcon className="h-3.5 w-3.5 shrink-0" />
                                <DeliveryIcon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{session.trainingTopic || session.title}</span>
                              </div>
                            </div>
                          );
                        })}
                        {sessions.length > 3 && (
                          <div className="text-[11px] text-slate-500">+{sessions.length - 3} more</div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className={cn(
            "hidden lg:flex items-start justify-center pt-24",
            isRightPanelCollapsed ? "lg:-ml-2" : "lg:-mx-2"
          )}>
            <button
              type="button"
              onClick={() => setIsRightPanelCollapsed((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
              aria-label={isRightPanelCollapsed ? "Expand side panel" : "Collapse side panel"}
              title={isRightPanelCollapsed ? "Expand side panel" : "Collapse side panel"}
            >
              <span className="text-xl font-semibold leading-none">{isRightPanelCollapsed ? "‹" : "›"}</span>
            </button>
          </div>

          {!isRightPanelCollapsed && <div className="space-y-4">
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">{editingSessionId !== null ? "Edit training session" : "Add training session"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="training-topic">Topic</Label>
                    <select id="training-topic" value={formData.trainingTopic} onChange={(e) => updateFormField("trainingTopic", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                      <option value="">Select or add a topic</option>
                      {trainingTopicOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="custom-topic">Add new topic</Label>
                    <div className="flex gap-2">
                      <Input id="custom-topic" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} placeholder="Type a new training topic" className="rounded-xl" />
                      <Button type="button" variant="outline" onClick={handleUseCustomTopic} className="rounded-xl">Use</Button>
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="entity">Entity</Label>
                    <Input id="entity" value={formData.entity} onChange={(e) => updateFormField("entity", e.target.value)} placeholder="Institution, company, or contractor" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-date">Date</Label>
                    <Input id="session-date" type="date" value={formData.date} onChange={(e) => updateFormField("date", e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="training-type">Training Type</Label>
                    <select id="training-type" value={formData.trainingType} onChange={(e) => updateFormField("trainingType", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                      {TRAINING_TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start time</Label>
                    <Input id="start-time" type="time" value={formData.startTime} onChange={(e) => updateFormField("startTime", e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End time</Label>
                    <Input id="end-time" type="time" value={formData.endTime} onChange={(e) => updateFormField("endTime", e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audience">Audience</Label>
                    <select id="audience" value={formData.audience} onChange={(e) => updateFormField("audience", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                      {AUDIENCE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content-type">Content</Label>
                    <select id="content-type" value={formData.contentType} onChange={(e) => updateFormField("contentType", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                      {CONTENT_TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="delivery-method">Delivery Method</Label>
                    <select id="delivery-method" value={formData.deliveryMethod} onChange={(e) => updateFormField("deliveryMethod", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                      {DELIVERY_METHOD_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={formData.location} onChange={(e) => updateFormField("location", e.target.value)} placeholder="Teams, site, room..." className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facilitator">Facilitator</Label>
                    <select id="facilitator" value={formData.facilitator} onChange={(e) => updateFormField("facilitator", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                      <option value="">Select or add a facilitator</option>
                      {facilitatorOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-facilitator">Add new facilitator</Label>
                    <div className="flex gap-2">
                      <Input id="custom-facilitator" value={customFacilitator} onChange={(e) => setCustomFacilitator(e.target.value)} placeholder="Type a facilitator name" className="rounded-xl" />
                      <Button type="button" variant="outline" onClick={handleUseCustomFacilitator} className="rounded-xl">Use</Button>
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" value={formData.notes} onChange={(e) => updateFormField("notes", e.target.value)} className="min-h-[100px] rounded-2xl" placeholder="Optional notes" />
                  </div>
                </div>
                {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleAddSession} className="rounded-xl">{editingSessionId !== null ? "Save changes" : "Add session"}</Button>
                  <Button variant="outline" onClick={() => setFormData((current) => ({ ...current, date: toDateKey(selectedDate) }))} className="rounded-xl">Use selected date</Button>
                  {editingSessionId !== null && (
                    <Button variant="ghost" onClick={() => resetForm(toDateKey(selectedDate))} className="rounded-xl">Cancel edit</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Training sessions on selected date</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSessions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                    No training sessions match the current filters for this day.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedSessions.map((session) => {
                      const typeStyle = trainingTypeStyles[session.trainingType] || trainingTypeStyles.Default;
                      const audienceMeta = getAudienceMeta(session.audience);
                      const contentMeta = getContentMeta(session.contentType);
                      const deliveryMeta = getDeliveryMeta(session.deliveryMethod);
                      const AudienceIcon = audienceMeta.icon;
                      const ContentIcon = contentMeta.icon;
                      const DeliveryIcon = deliveryMeta.icon;

                      return (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn("overflow-hidden rounded-2xl border bg-white", typeStyle.soft)}
                        >
                          <div className={cn("h-2 w-full", typeStyle.accent)} />
                          <div className="p-4">
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <div>
                                <h3 className={cn("font-semibold", typeStyle.text)}>{session.trainingTopic || session.title}</h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Badge className={cn("border", typeStyle.badge)}>
                                    {session.trainingType}
                                  </Badge>
                                  {session.trainingTopic && <Badge variant="outline">Topic: {session.trainingTopic}</Badge>}
                                  {session.entity && <Badge variant="outline">Entity: {session.entity}</Badge>}
                                  {session.facilitator && <Badge variant="outline">Facilitator: {session.facilitator}</Badge>}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <Clock3 className="h-4 w-4" />
                                <span>
                                  {session.startTime || "--:--"}
                                  {session.endTime ? ` - ${session.endTime}` : ""}
                                </span>
                              </div>
                              {session.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{session.location}</span>
                                </div>
                              )}
                              {session.entity && (
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  <span>Entity: {session.entity}</span>
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2 pt-1">
                                <HierarchyTag icon={audienceMeta.icon} label={audienceMeta.label} />
                                <HierarchyTag icon={contentMeta.icon} label={contentMeta.label} />
                                <HierarchyTag icon={deliveryMeta.icon} label={deliveryMeta.label} />
                              </div>
                              <div className="grid gap-2 pt-1 text-sm sm:grid-cols-2">
                                {session.trainingTopic && (
                                  <div className="flex items-center gap-2 sm:col-span-2">
                                    <BookOpen className="h-4 w-4" />
                                    <span>Topic: {session.trainingTopic}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Layers3 className="h-4 w-4" />
                                  <span>Type: {session.trainingType}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <AudienceIcon className="h-4 w-4" />
                                  <span>Audience: {session.audience}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <ContentIcon className="h-4 w-4" />
                                  <span>Content: {session.contentType}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DeliveryIcon className="h-4 w-4" />
                                  <span>Delivery: {session.deliveryMethod}</span>
                                </div>
                              </div>
                              {session.notes && <p className="pt-1">{session.notes}</p>}
                              <div className="flex flex-wrap gap-2 pt-2">
                                <Button variant="outline" onClick={() => handleEditSession(session)} className="rounded-xl">
                                  Edit session
                                </Button>
                                <Button variant="outline" onClick={() => handleDeleteSession(session.id)} className="rounded-xl">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete session
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Upload className="h-5 w-5" />
                  Import training data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">
                  Paste JSON or CSV. Required field: <code>date</code> in <code>YYYY-MM-DD</code> format. Recommended fields: <code>title</code>, <code>trainingTopic</code>, <code>entity</code>, <code>startTime</code>, <code>endTime</code>, <code>trainingType</code>, <code>audience</code>, <code>contentType</code>, <code>deliveryMethod</code>, <code>location</code>, <code>facilitator</code>, <code>notes</code>.
                </p>
                <Textarea
                  value={rawImport}
                  onChange={(e) => setRawImport(e.target.value)}
                  className="min-h-[220px] rounded-2xl font-mono text-xs"
                />
                {importError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {importError}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleImportJson} className="rounded-xl">
                    Load as JSON
                  </Button>
                  <Button variant="outline" onClick={handleImportCsv} className="rounded-xl">
                    Load as CSV
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setTrainingData(sampleTrainingData);
                      setImportError("");
                    }}
                    className="rounded-xl"
                  >
                    Reset sample data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>}
        </motion.div>
      </div>
    </div>
  );
}
