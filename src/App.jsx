import { supabase } from "./supabaseClient";
import React, { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Upload,
  Dumbbell,
  Clock3,
  MapPin,
  Filter,
  Layers3,
  Users,
  BookOpen,
  Monitor,
  Building2,
  Briefcase,
  GraduationCap,
  Globe,
  Wrench,
  Laptop,
  Trash2,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

const TRAINING_TYPE_OPTIONS = ["Nursery", "Projects", "Special Requests", "GreenLink", "TMO"];
const AUDIENCE_OPTIONS = ["Internal - Team", "Internal - Teacher Training (TT)", "External"];
const CONTENT_TYPE_OPTIONS = ["Theory", "Practical", "Hybrid"];
const DELIVERY_METHOD_OPTIONS = ["Online", "Onsite"];
const DEFAULT_TRAINING_TOPICS = [];
const DEFAULT_FACILITATORS = [];
const sampleTrainingData = [];

const trainingTypeStyles = {
  Nursery: { badge: "bg-emerald-100 text-emerald-800 border-emerald-200", soft: "bg-emerald-50 border-emerald-200", accent: "bg-emerald-500", text: "text-emerald-900" },
  Projects: { badge: "bg-blue-100 text-blue-800 border-blue-200", soft: "bg-blue-50 border-blue-200", accent: "bg-blue-500", text: "text-blue-900" },
  "Special Requests": { badge: "bg-amber-100 text-amber-800 border-amber-200", soft: "bg-amber-50 border-amber-200", accent: "bg-amber-500", text: "text-amber-900" },
  GreenLink: { badge: "bg-cyan-100 text-cyan-800 border-cyan-200", soft: "bg-cyan-50 border-cyan-200", accent: "bg-cyan-500", text: "text-cyan-900" },
  TMO: { badge: "bg-violet-100 text-violet-800 border-violet-200", soft: "bg-violet-50 border-violet-200", accent: "bg-violet-500", text: "text-violet-900" },
  Default: { badge: "bg-slate-100 text-slate-800 border-slate-200", soft: "bg-slate-50 border-slate-200", accent: "bg-slate-400", text: "text-slate-900" },
};

function getAudienceMeta(audience) {
  switch (audience) {
    case "Internal - Team": return { icon: Briefcase, label: "Internal Team" };
    case "Internal - Teacher Training (TT)": return { icon: GraduationCap, label: "Teacher Training" };
    case "External": return { icon: Globe, label: "External" };
    default: return { icon: Users, label: audience || "Audience" };
  }
}

function getContentMeta(contentType) {
  switch (contentType) {
    case "Theory": return { icon: BookOpen, label: "Theory" };
    case "Practical": return { icon: Wrench, label: "Practical" };
    case "Hybrid": return { icon: Star, label: "Hybrid" };
    default: return { icon: Layers3, label: contentType || "Content" };
  }
}

function getDeliveryMeta(deliveryMethod) {
  switch (deliveryMethod) {
    case "Online": return { icon: Laptop, label: "Online" };
    case "Onsite": return { icon: Building2, label: "Onsite" };
    default: return { icon: Monitor, label: deliveryMethod || "Delivery" };
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

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function splitCsvLine(line, delimiter) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values.map((value) => value.replace(/^"(.*)"$/, "$1").trim());
}

function detectCsvDelimiter(lines) {
  const sampleLine = lines.find((line) => line.trim());
  if (!sampleLine) return ",";
  const commaCount = (sampleLine.match(/,/g) || []).length;
  const semicolonCount = (sampleLine.match(/;/g) || []).length;
  return semicolonCount > commaCount ? ";" : ",";
}

function parseCsv(text) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) return [];

  const delimiter = detectCsvDelimiter(lines);
  const headers = splitCsvLine(lines[0], delimiter).map((header) => header.trim());

  return lines
    .slice(1)
    .map((line, index) => {
      const values = splitCsvLine(line, delimiter);
      if (!values.some((value) => value !== "")) return null;

      const entry = { id: Date.now() + index };
      headers.forEach((header, i) => {
        entry[header] = values[i] ?? "";
      });
      return entry;
    })
    .filter(Boolean);
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

  for (let i = 0; i < startDay; i += 1) {
    cells.push({ date: new Date(year, month, -(startDay - 1 - i)), inCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day), inCurrentMonth: true });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      date: new Date(year, month + 1, cells.length - (startDay + daysInMonth) + 1),
      inCurrentMonth: false,
    });
  }

  return cells;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(value) {
  if (!value) return new Date();
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function normalizeTrainingItem(item, index) {
  return {
    id: item.id ?? index + 1,
    title: item.title ?? item.training_topic ?? item.trainingTopic ?? "Training Session",
    trainingTopic: item.trainingTopic ?? item.training_topic ?? item.title ?? "",
    entity: item.entity ?? "",
    date: item.date ?? item.session_date ?? "",
    startTime: item.startTime ?? item.start_time ?? "",
    endTime: item.endTime ?? item.end_time ?? "",
    trainingType: item.trainingType ?? item.training_type ?? item.type ?? "Nursery",
    audience: item.audience ?? "Internal - Team",
    contentType: item.contentType ?? item.content_type ?? item.content ?? "Theory",
    deliveryMethod: item.deliveryMethod ?? item.delivery_method ?? "Online",
    location: item.location ?? "",
    facilitator: item.facilitator ?? item.coach ?? "",
    notes: item.notes ?? "",
  };
}

function CustomDropdown({ value, placeholder, options, onSelect, onRemove }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
      >
        <span className="truncate">{value || placeholder}</span>
        <span className={cn("text-slate-400 transition", isOpen && "rotate-180")}>⌄</span>
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="max-h-48 overflow-y-auto py-1">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500">No items yet. Add one below.</div>
            ) : (
              options.map((option) => (
                <div key={option} className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-slate-50">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(option);
                      setIsOpen(false);
                    }}
                    className="flex-1 text-left text-sm text-slate-700"
                  >
                    {option}
                  </button>

                  {onRemove && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(option);
                      }}
                      className="rounded-full px-1 text-slate-400 hover:text-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ icon: Icon, label, value, onChange, options }) {
  return (
    <div className="flex min-w-[180px] items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm text-slate-600">
      <Icon className="h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
        <select value={value} onChange={onChange} className="w-full min-w-0 bg-transparent text-sm outline-none">
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function TrainingCalendarApp() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [trainingData, setTrainingData] = useState(sampleTrainingData);
  const [selectedTrainingType, setSelectedTrainingType] = useState("All");
  const [selectedAudience, setSelectedAudience] = useState("All");
  const [selectedContentType, setSelectedContentType] = useState("All");
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState("All");
  const [selectedFacilitator, setSelectedFacilitator] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [rawImport, setRawImport] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    trainingTopic: "",
    entity: "",
    date: toDateKey(new Date()),
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
  const [customTopicOptions, setCustomTopicOptions] = useState([]);
  const [customFacilitatorOptions, setCustomFacilitatorOptions] = useState([]);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  const normalizedData = useMemo(() => trainingData.map((item, index) => normalizeTrainingItem(item, index)), [trainingData]);

  const trainingTypes = useMemo(() => ["All", ...new Set([...TRAINING_TYPE_OPTIONS, ...normalizedData.map((item) => item.trainingType)])], [normalizedData]);
  const audienceOptions = useMemo(() => ["All", ...new Set([...AUDIENCE_OPTIONS, ...normalizedData.map((item) => item.audience)])], [normalizedData]);
  const contentTypeOptions = useMemo(() => ["All", ...new Set([...CONTENT_TYPE_OPTIONS, ...normalizedData.map((item) => item.contentType)])], [normalizedData]);
  const deliveryMethodOptions = useMemo(() => ["All", ...new Set([...DELIVERY_METHOD_OPTIONS, ...normalizedData.map((item) => item.deliveryMethod)])], [normalizedData]);
  const facilitatorFilterOptions = useMemo(() => ["All", ...new Set(normalizedData.map((item) => item.facilitator).filter(Boolean))].sort(), [normalizedData]);

  const trainingTopicOptions = useMemo(() => {
    return [...new Set([...DEFAULT_TRAINING_TOPICS, ...customTopicOptions, ...normalizedData.map((item) => item.trainingTopic).filter(Boolean)])].sort();
  }, [normalizedData, customTopicOptions]);

  const facilitatorOptions = useMemo(() => {
    return [...new Set([...DEFAULT_FACILITATORS, ...customFacilitatorOptions, ...normalizedData.map((item) => item.facilitator).filter(Boolean)])].sort();
  }, [normalizedData, customFacilitatorOptions]);

  const filteredData = useMemo(() => {
    return normalizedData.filter((item) => {
      const matchesTrainingType = selectedTrainingType === "All" || item.trainingType === selectedTrainingType;
      const matchesAudience = selectedAudience === "All" || item.audience === selectedAudience;
      const matchesContentType = selectedContentType === "All" || item.contentType === selectedContentType;
      const matchesDeliveryMethod = selectedDeliveryMethod === "All" || item.deliveryMethod === selectedDeliveryMethod;
      const matchesFacilitator = selectedFacilitator === "All" || item.facilitator === selectedFacilitator;
      const haystack = `${item.title} ${item.trainingTopic} ${item.entity} ${item.trainingType} ${item.audience} ${item.contentType} ${item.deliveryMethod} ${item.location} ${item.facilitator} ${item.notes}`.toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());

      return matchesTrainingType && matchesAudience && matchesContentType && matchesDeliveryMethod && matchesFacilitator && matchesSearch;
    });
  }, [normalizedData, selectedTrainingType, selectedAudience, selectedContentType, selectedDeliveryMethod, selectedFacilitator, searchTerm]);

  const sessionsByDate = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      acc[item.date].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
      return acc;
    }, {});
  }, [filteredData]);

  const selectedSessions = useMemo(() => sessionsByDate[toDateKey(selectedDate)] ?? [], [sessionsByDate, selectedDate]);
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

  async function fetchSessions() {
    const { data, error } = await supabase.from("training_sessions").select("*").order("session_date", { ascending: true });

    if (error) {
      console.error("Error fetching sessions:", error);
      return;
    }

    setTrainingData(data || []);
  }

  function makePreparedSession(item) {
    const normalized = normalizeTrainingItem(item, 0);

    return {
      title: (normalized.trainingTopic || normalized.title || "").trim(),
      training_topic: (normalized.trainingTopic || normalized.title || "").trim(),
      entity: (normalized.entity || "").trim(),
      session_date: normalized.date || "",
      start_time: normalized.startTime || "",
      end_time: normalized.endTime || "",
      training_type: normalized.trainingType || "Nursery",
      audience: normalized.audience || "Internal - Team",
      content_type: normalized.contentType || "Theory",
      delivery_method: normalized.deliveryMethod || "Online",
      location: (normalized.location || "").trim(),
      facilitator: (normalized.facilitator || "").trim(),
      notes: (normalized.notes || "").trim(),
    };
  }

  async function replaceAllSessionsFromImport(importedRows) {
    const cleanedRows = importedRows.map(makePreparedSession).filter((row) => row.training_topic && row.session_date);

    if (!cleanedRows.length) {
      throw new Error("No valid rows found to import.");
    }

    const { error: deleteError } = await supabase
      .from("training_sessions")
      .delete()
      .not("id", "is", null);

    if (deleteError) {
      throw deleteError;
    }

    const { error: insertError } = await supabase
      .from("training_sessions")
      .insert(cleanedRows);

    if (insertError) {
      throw insertError;
    }

    return { total: cleanedRows.length };
  }

  async function processImportedRows(rows) {
    setImportError("");
    setImportSuccess("");
    setIsImporting(true);

    try {
      const result = await replaceAllSessionsFromImport(rows);
      await fetchSessions();

      const firstDate = rows[0]?.date ?? rows[0]?.session_date ?? normalizeTrainingItem(rows[0] || {}, 0).date;
      if (firstDate) {
        setSelectedDate(fromDateKey(firstDate));
        setCurrentMonth(fromDateKey(firstDate));
      }

      setImportSuccess(`Import complete: calendar replaced with ${result.total} sessions from the CSV.`);
    } catch (error) {
      console.error("Import error:", error);
      setImportError(error.message || "Could not import the data.");
    } finally {
      setIsImporting(false);
    }
  }

  function handlePrevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }

  React.useEffect(() => {
    setFormData((current) => ({ ...current, date: toDateKey(selectedDate) }));
  }, [selectedDate]);

  React.useEffect(() => {
    fetchSessions();
  }, []);

  async function handleImportJson() {
    try {
      const parsed = JSON.parse(rawImport);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of session objects.");
      await processImportedRows(parsed);
    } catch (error) {
      setImportError(error.message || "Could not parse JSON.");
    }
  }

  async function handleImportCsv() {
    try {
      const parsed = parseCsv(rawImport);
      if (!parsed.length) throw new Error("CSV appears empty or invalid.");
      await processImportedRows(parsed);
    } catch (error) {
      setImportError(error.message || "Could not parse CSV.");
    }
  }

  function handleCsvFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError("");
    setImportSuccess("");

    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") {
        setImportError("Could not read the CSV file.");
        return;
      }

      setRawImport(text);

      try {
        const parsed = parseCsv(text);
        if (!parsed.length) throw new Error("CSV appears empty or invalid.");
        await processImportedRows(parsed);
      } catch (error) {
        setImportError(error.message || "Could not parse or import the CSV file.");
      }
    };

    reader.onerror = () => setImportError("Could not read the CSV file.");
    reader.readAsText(file);
    event.target.value = "";
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

  async function handleAddSession() {
    if (!formData.trainingTopic.trim()) {
      setFormError("Please select or add a training topic.");
      return;
    }

    if (!formData.date) {
      setFormError("Please choose a date.");
      return;
    }

    const preparedSession = {
      title: formData.trainingTopic.trim(),
      training_topic: formData.trainingTopic.trim(),
      entity: formData.entity.trim(),
      session_date: formData.date,
      start_time: formData.startTime,
      end_time: formData.endTime,
      training_type: formData.trainingType,
      audience: formData.audience,
      content_type: formData.contentType,
      delivery_method: formData.deliveryMethod,
      location: formData.location.trim(),
      facilitator: formData.facilitator.trim(),
      notes: formData.notes.trim(),
    };

    const result = editingSessionId !== null
      ? await supabase.from("training_sessions").update(preparedSession).eq("id", editingSessionId)
      : await supabase.from("training_sessions").insert([preparedSession]);

    if (result.error) {
      console.error("Error saving session:", result.error);
      setFormError(result.error.message || "Error saving session.");
      return;
    }

    await fetchSessions();
    setSelectedDate(fromDateKey(formData.date));
    setCurrentMonth(fromDateKey(formData.date));
    resetForm(formData.date);
  }

  async function handleDeleteSession(sessionId) {
    const { error } = await supabase.from("training_sessions").delete().eq("id", sessionId);

    if (error) {
      console.error("Error deleting session:", error);
      return;
    }

    await fetchSessions();

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
    const topic = customTopic.trim();
    if (!topic) return;
    setCustomTopicOptions((current) => (current.includes(topic) ? current : [...current, topic]));
    updateFormField("trainingTopic", topic);
    setCustomTopic("");
  }

  function handleRemoveTopicOption(topicToRemove) {
    setCustomTopicOptions((current) => current.filter((topic) => topic !== topicToRemove));
    if (formData.trainingTopic === topicToRemove) updateFormField("trainingTopic", "");
  }

  function handleUseCustomFacilitator() {
    const facilitator = customFacilitator.trim();
    if (!facilitator) return;
    setCustomFacilitatorOptions((current) => current.includes(facilitator) ? current : [...current, facilitator]);
    updateFormField("facilitator", facilitator);
    setCustomFacilitator("");
  }

  function handleRemoveFacilitatorOption(facilitatorToRemove) {
    setCustomFacilitatorOptions((current) => current.filter((facilitator) => facilitator !== facilitatorToRemove));
    if (formData.facilitator === facilitatorToRemove) updateFormField("facilitator", "");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("grid gap-4", isRightPanelCollapsed ? "lg:grid-cols-[1fr_auto]" : "lg:grid-cols-[1.4fr_auto_0.9fr]")}
        >
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Calendar className="h-6 w-6" />
                    Green Academy Training Calendar
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-600">Display, filter, and review training sessions by day.</p>
                </div>

                <div className="flex w-full max-w-[760px] flex-col gap-3">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search title, topic, entity, audience, facilitator..."
                    className="rounded-xl bg-white"
                  />

                  <div className="flex flex-wrap gap-2">
                    <FilterSelect icon={Filter} label="Type" value={selectedTrainingType} onChange={(e) => setSelectedTrainingType(e.target.value)} options={trainingTypes} />
                    <FilterSelect icon={Users} label="Audience" value={selectedAudience} onChange={(e) => setSelectedAudience(e.target.value)} options={audienceOptions} />
                    <FilterSelect icon={BookOpen} label="Content" value={selectedContentType} onChange={(e) => setSelectedContentType(e.target.value)} options={contentTypeOptions} />
                    <FilterSelect icon={Monitor} label="Delivery" value={selectedDeliveryMethod} onChange={(e) => setSelectedDeliveryMethod(e.target.value)} options={deliveryMethodOptions} />
                    <FilterSelect icon={Briefcase} label="Facilitator" value={selectedFacilitator} onChange={(e) => setSelectedFacilitator(e.target.value)} options={facilitatorFilterOptions} />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="rounded-2xl border-slate-200 shadow-none">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="rounded-2xl bg-slate-100 p-3"><Dumbbell className="h-5 w-5" /></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Sessions</p><p className="text-2xl font-semibold">{totalSessions}</p></div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-slate-200 shadow-none">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="rounded-2xl bg-slate-100 p-3"><Clock3 className="h-5 w-5" /></div>
                    <div><p className="text-xs uppercase tracking-wide text-slate-500">Hours Scheduled</p><p className="text-2xl font-semibold">{totalHours.toFixed(1)}</p></div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-slate-200 shadow-none">
                  <CardContent className="p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Selected Date</p>
                    <p className="text-lg font-semibold">
                      {selectedDate.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(trainingTypeCounts).map(([type, count]) => {
                  const style = trainingTypeStyles[type] || trainingTypeStyles.Default;
                  return (
                    <div key={type} className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold", style.badge)}>
                      <span className={cn("h-2.5 w-2.5 rounded-full", style.accent)} />
                      <span>{type}</span>
                      <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[10px]">{count}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-xl"><ChevronLeft className="h-5 w-5" /></Button>
                <h2 className="text-lg font-semibold">{formatMonthYear(currentMonth)}</h2>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-xl"><ChevronRight className="h-5 w-5" /></Button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
                {Array.from({ length: 7 }).map((_, index) => {
                  const base = new Date(2026, 0, 5 + index);
                  return <div key={index} className="py-2">{formatDayLabel(base)}</div>;
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
                        "min-h-[130px] rounded-2xl border p-2 text-left shadow-sm transition",
                        inCurrentMonth ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-100/60 text-slate-400",
                        isSelected && "ring-2 ring-slate-900",
                        isToday && "border-slate-400"
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold">{date.getDate()}</span>
                        {sessions.length > 0 && <Badge variant="secondary" className="rounded-full">{sessions.length}</Badge>}
                      </div>

                      <div className="space-y-1">
                        {sessions.slice(0, 3).map((session) => {
                          const AudienceIcon = getAudienceMeta(session.audience).icon;
                          const ContentIcon = getContentMeta(session.contentType).icon;
                          const DeliveryIcon = getDeliveryMeta(session.deliveryMethod).icon;

                          return (
                            <div key={session.id} className={cn("rounded-lg border px-2 py-1 text-[11px] font-medium", (trainingTypeStyles[session.trainingType] || trainingTypeStyles.Default).badge)}>
                              <div className="flex items-center gap-1 overflow-hidden">
                                <span className="shrink-0">{session.startTime || "--:--"}</span>
                                <AudienceIcon className="h-3.5 w-3.5 shrink-0" />
                                <ContentIcon className="h-3.5 w-3.5 shrink-0" />
                                <DeliveryIcon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{session.trainingTopic || session.title}</span>
                              </div>
                            </div>
                          );
                        })}
                        {sessions.length > 3 && <div className="text-[11px] text-slate-500">+{sessions.length - 3} more</div>}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className={cn("hidden lg:flex items-start justify-center pt-24", isRightPanelCollapsed ? "lg:-ml-2" : "lg:-mx-2")}>
            <button
              type="button"
              onClick={() => setIsRightPanelCollapsed((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <span className="text-xl font-semibold leading-none">{isRightPanelCollapsed ? "‹" : "›"}</span>
            </button>
          </div>

          {!isRightPanelCollapsed && (
            <div className="space-y-4">
              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">{editingSessionId !== null ? "Edit training session" : "Add training session"}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Topic</Label>
                      <CustomDropdown value={formData.trainingTopic} placeholder="Select or add a topic" options={trainingTopicOptions} onSelect={(option) => updateFormField("trainingTopic", option)} onRemove={handleRemoveTopicOption} />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label>Add new topic</Label>
                      <div className="flex gap-2">
                        <Input value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} placeholder="Type a new training topic" className="rounded-xl" />
                        <Button type="button" variant="outline" onClick={handleUseCustomTopic} className="rounded-xl">Use</Button>
                      </div>
                    </div>

                    <div className="space-y-2 sm:col-span-2"><Label>Entity</Label><Input value={formData.entity} onChange={(e) => updateFormField("entity", e.target.value)} className="rounded-xl" /></div>
                    <div className="space-y-2"><Label>Date</Label><Input type="date" value={formData.date} onChange={(e) => updateFormField("date", e.target.value)} className="rounded-xl" /></div>

                    <div className="space-y-2">
                      <Label>Training Type</Label>
                      <select value={formData.trainingType} onChange={(e) => updateFormField("trainingType", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                        {TRAINING_TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2"><Label>Start time</Label><Input type="time" value={formData.startTime} onChange={(e) => updateFormField("startTime", e.target.value)} className="rounded-xl" /></div>
                    <div className="space-y-2"><Label>End time</Label><Input type="time" value={formData.endTime} onChange={(e) => updateFormField("endTime", e.target.value)} className="rounded-xl" /></div>

                    <div className="space-y-2">
                      <Label>Audience</Label>
                      <select value={formData.audience} onChange={(e) => updateFormField("audience", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                        {AUDIENCE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Content</Label>
                      <select value={formData.contentType} onChange={(e) => updateFormField("contentType", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                        {CONTENT_TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label>Delivery Method</Label>
                      <select value={formData.deliveryMethod} onChange={(e) => updateFormField("deliveryMethod", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                        {DELIVERY_METHOD_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2"><Label>Location</Label><Input value={formData.location} onChange={(e) => updateFormField("location", e.target.value)} className="rounded-xl" /></div>

                    <div className="space-y-2">
                      <Label>Facilitator</Label>
                      <CustomDropdown value={formData.facilitator} placeholder="Select or add a facilitator" options={facilitatorOptions} onSelect={(option) => updateFormField("facilitator", option)} onRemove={handleRemoveFacilitatorOption} />
                    </div>

                    <div className="space-y-2">
                      <Label>Add new facilitator</Label>
                      <div className="flex gap-2">
                        <Input value={customFacilitator} onChange={(e) => setCustomFacilitator(e.target.value)} placeholder="Type a facilitator name" className="rounded-xl" />
                        <Button type="button" variant="outline" onClick={handleUseCustomFacilitator} className="rounded-xl">Use</Button>
                      </div>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label>Notes</Label>
                      <Textarea value={formData.notes} onChange={(e) => updateFormField("notes", e.target.value)} className="min-h-[100px] rounded-2xl" />
                    </div>
                  </div>

                  {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleAddSession} className="rounded-xl">{editingSessionId !== null ? "Save changes" : "Add session"}</Button>
                    <Button variant="outline" onClick={() => setFormData((current) => ({ ...current, date: toDateKey(selectedDate) }))} className="rounded-xl">Use selected date</Button>
                    {editingSessionId !== null && <Button variant="ghost" onClick={() => resetForm(toDateKey(selectedDate))} className="rounded-xl">Cancel edit</Button>}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader><CardTitle className="text-xl">Training sessions on selected date</CardTitle></CardHeader>
                <CardContent>
                  {selectedSessions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">No training sessions match the current filters for this day.</div>
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
                          <motion.div key={session.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("overflow-hidden rounded-2xl border bg-white", typeStyle.soft)}>
                            <div className={cn("h-2 w-full", typeStyle.accent)} />
                            <div className="p-4">
                              <h3 className={cn("font-semibold", typeStyle.text)}>{session.trainingTopic || session.title}</h3>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Badge className={cn("border", typeStyle.badge)}>{session.trainingType}</Badge>
                                {session.entity && <Badge variant="outline">Entity: {session.entity}</Badge>}
                                {session.facilitator && <Badge variant="outline">Facilitator: {session.facilitator}</Badge>}
                              </div>

                              <div className="mt-3 space-y-3 text-sm text-slate-600">
                                <div className="flex items-center gap-2"><Clock3 className="h-4 w-4" /><span>{session.startTime || "--:--"}{session.endTime ? ` - ${session.endTime}` : ""}</span></div>
                                {session.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{session.location}</span></div>}
                                <div className="flex flex-wrap gap-2 pt-1">
                                  <HierarchyTag icon={audienceMeta.icon} label={audienceMeta.label} />
                                  <HierarchyTag icon={contentMeta.icon} label={contentMeta.label} />
                                  <HierarchyTag icon={deliveryMeta.icon} label={deliveryMeta.label} />
                                </div>

                                <div className="grid gap-2 pt-1 text-sm sm:grid-cols-2">
                                  <div className="flex items-center gap-2 sm:col-span-2"><BookOpen className="h-4 w-4" /><span>Topic: {session.trainingTopic}</span></div>
                                  <div className="flex items-center gap-2"><Layers3 className="h-4 w-4" /><span>Type: {session.trainingType}</span></div>
                                  <div className="flex items-center gap-2"><AudienceIcon className="h-4 w-4" /><span>Audience: {session.audience}</span></div>
                                  <div className="flex items-center gap-2"><ContentIcon className="h-4 w-4" /><span>Content: {session.contentType}</span></div>
                                  <div className="flex items-center gap-2"><DeliveryIcon className="h-4 w-4" /><span>Delivery: {session.deliveryMethod}</span></div>
                                </div>

                                {session.notes && <p className="pt-1">{session.notes}</p>}

                                <div className="flex flex-wrap gap-2 pt-2">
                                  <Button variant="outline" onClick={() => handleEditSession(session)} className="rounded-xl">Edit session</Button>
                                  <Button variant="outline" onClick={() => handleDeleteSession(session.id)} className="rounded-xl"><Trash2 className="mr-2 h-4 w-4" />Delete session</Button>
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
                  <CardTitle className="flex items-center gap-2 text-xl"><Upload className="h-5 w-5" />Import training data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Upload a CSV file directly, or paste CSV / JSON below. Each import replaces the whole calendar with the uploaded file.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="csv-file">Upload CSV file</Label>
                    <Input id="csv-file" type="file" accept=".csv,text/csv" onChange={handleCsvFileUpload} className="rounded-xl" />
                  </div>

                  <Textarea value={rawImport} onChange={(e) => setRawImport(e.target.value)} className="min-h-[220px] rounded-2xl font-mono text-xs" placeholder="Paste CSV or JSON here if you do not want to upload a file" />

                  {importError && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{importError}</div>}
                  {importSuccess && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{importSuccess}</div>}

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleImportJson} className="rounded-xl" disabled={isImporting}>{isImporting ? "Importing..." : "Load as JSON"}</Button>
                    <Button variant="outline" onClick={handleImportCsv} className="rounded-xl" disabled={isImporting}>{isImporting ? "Importing..." : "Load as CSV"}</Button>
                    <Button variant="ghost" onClick={() => { setTrainingData(sampleTrainingData); setImportError(""); setImportSuccess(""); }} className="rounded-xl">Reset sample data</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}