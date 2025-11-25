//app/dashboard/%28role%29/%28maintenance%29/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";

const initialRequests = [
  {
    id: "req-001",
    driver: "Ahmed Driver",
    vehicle: "Hilux — ABC-1234",
    date: "2024-09-14",
    mileage: "52300",
    type: "repair",
    submittedAt: "2024-09-14T09:15:00Z",
    status: "pending",
    notes: "Engine oil light turned on during delivery route.",
    attachments: [{ id: "att-001", name: "odometer.jpg" }],
  },
  {
    id: "req-002",
    driver: "Omar Khalid",
    vehicle: "Isuzu D-Max — XYZ-5678",
    date: "2024-09-12",
    mileage: "68740",
    type: "preventive_maintenance",
    submittedAt: "2024-09-12T17:45:00Z",
    status: "pending",
    notes: "Scheduled preventive maintenance requested per service plan.",
    attachments: [],
  },
  {
    id: "req-003",
    driver: "Ali Hassan",
    vehicle: "Hino 300 — LMN-9101",
    date: "2024-08-20",
    mileage: "84210",
    type: "inspection",
    submittedAt: "2024-08-20T08:30:00Z",
    status: "approved",
    workshop: "Hino Service Center",
    cost: "950",
    nextDueDate: "2024-11-20",
    resolvedAt: "2024-08-21T10:00:00Z",
    notes: "Brake inspection completed and pads replaced.",
  },
];

const SPARE_PART_TYPES = new Set(["repair", "oil_change"]);

const createEmptyPart = () => ({
  id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `part-${Math.random()}`,
  name: "",
  quantity: "",
  cost: "",
  image: null,
});

export default function MaintenanceDashboard() {
  const [lang, setLang] = useState("en");
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState(initialRequests);
  const initialSelectedId = useMemo(
    () => requests.find((req) => req.status === "pending")?.id ?? null,
    [requests]
  );
  const [selectedRequestId, setSelectedRequestId] = useState(initialSelectedId);
  const [formData, setFormData] = useState({
    date: "",
    mileage: "",
    type: "",
    workshop: "",
    details: "",
    cost: "",
    nextDueDate: "",
  });
  const [spareParts, setSpareParts] = useState([createEmptyPart()]);
  const [attachments, setAttachments] = useState([]);
  const [mileagePhoto, setMileagePhoto] = useState(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);
  const [history, setHistory] = useState(() =>
    initialRequests
      .filter((req) => req.status !== "pending")
      .map((req) => ({
        id: req.id,
        driver: req.driver,
        vehicle: req.vehicle,
        date: req.date,
        mileage: req.mileage,
        type: req.type,
        workshop: req.workshop || "",
        cost: req.cost || "",
        nextDueDate: req.nextDueDate || "",
        status: req.status,
        resolvedAt: req.resolvedAt || req.date,
        notes: req.notes || "",
      }))
  );

  useEffect(() => {
    setSelectedRequestId((prev) => {
      if (prev) return prev;
      return requests.find((req) => req.status === "pending")?.id ?? null;
    });
  }, [requests]);

  const t = useMemo(
    () => ({
      en: {
        title: "Maintenance Control Center",
        subtitle: "Review driver submissions and finalise workshop details.",
        requestsTab: "Requests",
        historyTab: "History",
        noSelection: "Select a maintenance request to begin.",
        pendingRequests: "Pending Maintenance Requests",
        historyHeader: "Completed or Rejected Records",
        status: "Status",
        statusPending: "Pending",
        statusApproved: "Approved",
        statusRejected: "Rejected",
        driver: "Driver",
        vehicle: "Vehicle",
        submittedAt: "Submitted",
        notes: "Driver Notes",
        attachments: "Attachments",
        date: "Maintenance Date",
        mileage: "Mileage (km)",
        type: "Maintenance Type",
        workshop: "Workshop / Technician",
        cost: "Cost (SAR)",
        nextDue: "Next Service Due",
        detailNotes: "Notes / Details",
        placeholderNotes: "Enter service details or observations...",
        sparePartsTitle: "Spare Parts Used",
        addPart: "Add Part",
        removePart: "Remove",
        partName: "Part name",
        partQuantity: "Quantity",
        partCost: "Cost",
        partImage: "Part image",
        removeImage: "Remove image",
        mileagePhoto: "Odometer / Mileage Photo",
        uploadFiles: "Upload Receipts or Attachments",
        submit: "Save Update",
        approve: "Approve",
        reject: "Reject",
        rejectionNote: "Decision note",
        rejectionPlaceholder: "Optional: explain why the request was rejected",
        messageSaved: "Request details updated.",
        messageApproved: "Request approved and added to history.",
        messageRejected: "Request rejected.",
        validationMissing:
          "Please complete date, mileage, type, workshop, cost, and next service date before approving.",
        emptyRequests: "No maintenance requests awaiting review.",
        attachmentNone: "No attachments provided.",
        historyEmpty: "No maintenance history yet.",
        historyResolvedAt: "Resolved",
        kmUnit: "km",
        oilChange: "Oil Change",
        preventiveMaintenance: "PPM",
        inspection: "General Inspection",
        repair: "Repair",
        driverRequestCard: "Driver Submission",
        workshopCard: "Workshop Details",
        approveDisabled: "This request has already been processed.",
        sparePartsHint: "Document any replacement parts or consumables.",
      },
      ar: {
        title: "مركز التحكم بالصيانة",
        subtitle: "مراجعة طلبات السائقين واستكمال تفاصيل الورشة.",
        requestsTab: "الطلبات",
        historyTab: "السجل",
        noSelection: "اختر طلب صيانة للبدء.",
        pendingRequests: "طلبات صيانة قيد المراجعة",
        historyHeader: "السجلات المكتملة أو المرفوضة",
        status: "الحالة",
        statusPending: "قيد المراجعة",
        statusApproved: "مقبول",
        statusRejected: "مرفوض",
        driver: "السائق",
        vehicle: "المركبة",
        submittedAt: "تاريخ الإرسال",
        notes: "ملاحظات السائق",
        attachments: "المرفقات",
        date: "تاريخ الصيانة",
        mileage: "قراءة العداد (كم)",
        type: "نوع الصيانة",
        workshop: "الورشة / الفني",
        cost: "التكلفة (ر.س)",
        nextDue: "موعد الخدمة القادمة",
        detailNotes: "ملاحظات / تفاصيل",
        placeholderNotes: "أدخل تفاصيل أو ملاحظات حول الصيانة...",
        sparePartsTitle: "قطع الغيار المستخدمة",
        addPart: "إضافة قطعة",
        removePart: "إزالة",
        partName: "اسم القطعة",
        partQuantity: "الكمية",
        partCost: "التكلفة",
        partImage: "صورة القطعة",
        removeImage: "إزالة الصورة",
        mileagePhoto: "صورة عداد الكيلومترات",
        uploadFiles: "تحميل الفواتير أو المرفقات",
        submit: "حفظ التحديث",
        approve: "اعتماد",
        reject: "رفض",
        rejectionNote: "ملاحظة القرار",
        rejectionPlaceholder: "اختياري: وضح سبب الرفض",
        messageSaved: "تم تحديث تفاصيل الطلب.",
        messageApproved: "تم اعتماد الطلب وإضافته إلى السجل.",
        messageRejected: "تم رفض الطلب.",
        validationMissing: "يرجى استكمال التاريخ والعداد والنوع والورشة والتكلفة وموعد الخدمة التالية قبل الاعتماد.",
        emptyRequests: "لا توجد طلبات صيانة بانتظار المراجعة.",
        attachmentNone: "لا توجد مرفقات.",
        historyEmpty: "لا يوجد سجل صيانة حتى الآن.",
        historyResolvedAt: "تاريخ الإجراء",
        kmUnit: "كم",
        oilChange: "تغيير الزيت",
        preventiveMaintenance: "صيانة وقائية",
        inspection: "فحص عام",
        repair: "تصليح",
        driverRequestCard: "طلب السائق",
        workshopCard: "تفاصيل الورشة",
        approveDisabled: "تمت معالجة هذا الطلب مسبقاً.",
        sparePartsHint: "قم بتوثيق أي قطع تم استبدالها أو استهلاكها.",
      },
      ur: {
        title: "مینٹیننس کنٹرول سینٹر",
        subtitle: "ڈرائیور کی درخواستوں کا جائزہ لیں اور ورکشاپ تفصیلات مکمل کریں۔",
        requestsTab: "درخواستیں",
        historyTab: "ہسٹری",
        noSelection: "براہ کرم جائزہ شروع کرنے کیلئے ایک درخواست منتخب کریں۔",
        pendingRequests: "زیرِ جائزہ مینٹیننس درخواستیں",
        historyHeader: "مکمل یا مسترد شدہ ریکارڈ",
        status: "حالت",
        statusPending: "زیرِ جائزہ",
        statusApproved: "منظور شدہ",
        statusRejected: "مسترد",
        driver: "ڈرائیور",
        vehicle: "گاڑی",
        submittedAt: "جمع ہونے کا وقت",
        notes: "ڈرائیور نوٹس",
        attachments: "اٹیچمنٹس",
        date: "مینٹیننس کی تاریخ",
        mileage: "مائلیج (کلومیٹر)",
        type: "مینٹیننس کی قسم",
        workshop: "ورکشاپ / ٹیکنیشن",
        cost: "لاگت (ریال)",
        nextDue: "اگلی سروس کی تاریخ",
        detailNotes: "نوٹس / تفصیل",
        placeholderNotes: "تفصیل یا مشاہدات درج کریں...",
        sparePartsTitle: "استعمال شدہ اسپئیر پارٹس",
        addPart: "پارٹ شامل کریں",
        removePart: "ہٹائیں",
        partName: "پارٹ کا نام",
        partQuantity: "تعداد",
        partCost: "لاگت",
        partImage: "پارٹ کی تصویر",
        removeImage: "تصویر ہٹائیں",
        mileagePhoto: "اوڈومیٹر / مائلیج تصویر",
        uploadFiles: "رسیدیں یا اٹیچمنٹس اپ لوڈ کریں",
        submit: "اپ ڈیٹ محفوظ کریں",
        approve: "منظور کریں",
        reject: "مسترد کریں",
        rejectionNote: "فیصلہ نوٹ",
        rejectionPlaceholder: "اختیاری: مسترد کرنے کی وجہ بتائیں",
        messageSaved: "درخواست کی تفصیلات اپ ڈیٹ ہو گئیں۔",
        messageApproved: "درخواست منظور ہو گئی اور ہسٹری میں شامل کی گئی۔",
        messageRejected: "درخواست مسترد ہو گئی۔",
        validationMissing: "براہ کرم تاریخ، مائلیج، قسم، ورکشاپ، لاگت اور اگلی سروس کی تاریخ مکمل کریں۔",
        emptyRequests: "کوئی درخواستیں زیرِ جائزہ نہیں ہیں۔",
        attachmentNone: "کوئی اٹیچمنٹ نہیں۔",
        historyEmpty: "ابھی تک کوئی مینٹیننس ہسٹری نہیں۔",
        historyResolvedAt: "فیصلہ",
        kmUnit: "کلومیٹر",
        oilChange: "آئل چینج",
        preventiveMaintenance: "پریوینٹو مینٹیننس",
        inspection: "جنرل انسپیکشن",
        repair: "مرمت",
        driverRequestCard: "ڈرائیور کی درخواست",
        workshopCard: "ورکشاپ تفصیلات",
        approveDisabled: "یہ درخواست پہلے ہی پروسیس ہو چکی ہے۔",
        sparePartsHint: "استعمال شدہ پارٹس یا کنزیوم ایبلز درج کریں۔",
      },
    }),
    []
  );

  const locale = lang === "ar" ? "ar-SA" : lang === "ur" ? "ur-PK" : "en-GB";
  const strings = t[lang];
  const isRTL = lang === "ar" || lang === "ur";

  const maintenanceTypes = useMemo(
    () => [
      { value: "oil_change", label: strings.oilChange },
      { value: "preventive_maintenance", label: strings.preventiveMaintenance },
      { value: "inspection", label: strings.inspection },
      { value: "repair", label: strings.repair },
    ],
    [strings]
  );

  const selectedRequest = useMemo(
    () => requests.find((req) => req.id === selectedRequestId) || null,
    [requests, selectedRequestId]
  );

  const showSpareParts = SPARE_PART_TYPES.has(formData.type);
  useEffect(() => {
    if (!selectedRequest) {
      setFormData({
        date: "",
        mileage: "",
        type: "",
        workshop: "",
        details: "",
        cost: "",
        nextDueDate: "",
      });
      setSpareParts([createEmptyPart()]);
      setAttachments([]);
      setMileagePhoto(null);
      setDecisionNote("");
      setStatusMessage(null);
      return;
    }

    setFormData({
      date: selectedRequest.date || "",
      mileage: selectedRequest.mileage || "",
      type: selectedRequest.type || "",
      workshop: selectedRequest.workshop || "",
      details: selectedRequest.details || "",
      cost: selectedRequest.cost || "",
      nextDueDate: selectedRequest.nextDueDate || "",
    });

    setSpareParts(() => {
      const parts = selectedRequest.spareParts || [];
      if (!parts.length) return [createEmptyPart()];
      return parts.map((part) => ({
        id: part.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `part-${Math.random()}`),
        name: part.name || "",
        quantity: part.quantity || "",
        cost: part.cost || "",
        image: part.image || null,
      }));
    });

    setAttachments(selectedRequest.attachments || []);
    setMileagePhoto(selectedRequest.mileagePhoto || null);
    setDecisionNote("");
    setStatusMessage(null);
  }, [selectedRequest]);

  useEffect(() => {
    setStatusMessage(null);
  }, [lang]);

  const statusStyles = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const formatDate = (value, options) => {
    if (!value) return "--";
    try {
      return new Intl.DateTimeFormat(locale, options || { dateStyle: "medium" }).format(new Date(value));
    } catch (error) {
      return value;
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "type" && !SPARE_PART_TYPES.has(value)) {
      setSpareParts([createEmptyPart()]);
    }
  };

  const handleAttachmentUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setAttachments((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const handleMileagePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMileagePhoto(file);
  };

  const handlePartChange = (id, field, value) => {
    setSpareParts((prev) => prev.map((part) => (part.id === id ? { ...part, [field]: value } : part)));
  };

  const handlePartImageChange = (id, file) => {
    setSpareParts((prev) =>
      prev.map((part) => (part.id === id ? { ...part, image: file ?? null } : part))
    );
  };

  const addSparePart = () => {
    setSpareParts((prev) => [...prev, createEmptyPart()]);
  };

  const removeSparePart = (id) => {
    setSpareParts((prev) => {
      const filtered = prev.filter((part) => part.id !== id);
      return filtered.length ? filtered : [createEmptyPart()];
    });
  };

  const handleMaintenanceSubmit = (event) => {
    event.preventDefault();
    if (!selectedRequest) return;

    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id
          ? {
              ...req,
              ...formData,
              spareParts,
              attachments,
              mileagePhoto,
            }
          : req
      )
    );

    setStatusMessage({ type: "success", text: strings.messageSaved });
  };

  const handleDecision = (decision) => {
    if (!selectedRequest) return;

    if (decision === "approve") {
      const requiredFields = ["date", "mileage", "type", "workshop", "cost", "nextDueDate"];
      const hasMissing = requiredFields.some((field) => !formData[field]);
      if (hasMissing) {
        setStatusMessage({ type: "error", text: strings.validationMissing });
        return;
      }
    }

    const resolvedAt = new Date().toISOString();
    const nextStatus = decision === "approve" ? "approved" : "rejected";

    setRequests((prev) => {
      const updated = prev.map((req) =>
        req.id === selectedRequest.id
          ? {
              ...req,
              ...formData,
              spareParts,
              attachments,
              mileagePhoto,
              status: nextStatus,
              resolvedAt,
              decisionNote: decisionNote || undefined,
            }
          : req
      );

      const pendingIds = updated.filter((req) => req.status === "pending").map((req) => req.id);
      setSelectedRequestId(pendingIds[0] ?? null);
      return updated;
    });

    setHistory((prev) => [
      {
        id: selectedRequest.id,
        driver: selectedRequest.driver,
        vehicle: selectedRequest.vehicle,
        date: formData.date,
        mileage: formData.mileage,
        type: formData.type,
        workshop: formData.workshop,
        cost: formData.cost,
        nextDueDate: formData.nextDueDate,
        status: nextStatus,
        resolvedAt,
        notes: decisionNote,
      },
      ...prev.filter((item) => item.id !== selectedRequest.id),
    ]);

    setStatusMessage({
      type: decision === "approve" ? "success" : "warning",
      text: decision === "approve" ? strings.messageApproved : strings.messageRejected,
    });
    setDecisionNote("");
  };

  const formatTypeLabel = (value) => {
    const match = maintenanceTypes.find((option) => option.value === value);
    return match ? match.label : value || "--";
  };

  const renderAttachmentName = (item, index) => {
    if (!item) return `Attachment ${index + 1}`;
    if (typeof item === "string") return item;
    if (item.name) return item.name;
    if (item.fileName) return item.fileName;
    return `Attachment ${index + 1}`;
  };

  return (
    <div
      className={`min-h-screen flex bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-900 ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <aside className="hidden md:flex w-64 bg-black text-white flex-col p-6 shadow-2xl rounded-r-3xl">
        <div className="mb-8">
          <h2 className="text-xl font-semibold">{strings.title}</h2>
          <p className="text-sm text-gray-400">{strings.subtitle}</p>
        </div>

        <select
          value={lang}
          onChange={(event) => setLang(event.target.value)}
          className="mb-6 border border-gray-600 bg-black text-gray-200 rounded-lg text-sm py-1.5 px-2 focus:ring-2 focus:ring-gray-400"
        >
          <option value="en">🇬🇧 English</option>
          <option value="ar">🇸🇦 العربية</option>
          <option value="ur">🇵🇰 اردو</option>
        </select>

        <nav className="flex-1 space-y-2">
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition ${
              activeTab === "requests"
                ? "bg-white text-black shadow-inner"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {strings.requestsTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition ${
              activeTab === "history"
                ? "bg-white text-black shadow-inner"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {strings.historyTab}
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 mt-16 md:mt-0">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-black">{strings.title}</h1>
            <p className="text-gray-600 mt-1">{strings.subtitle}</p>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <select
              value={lang}
              onChange={(event) => setLang(event.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
            >
              <option value="en">EN</option>
              <option value="ar">AR</option>
              <option value="ur">UR</option>
            </select>
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className={`px-3 py-1 text-sm rounded-md ${
                  activeTab === "requests" ? "bg-black text-white" : "text-gray-600"
                }`}
              >
                {strings.requestsTab}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1 text-sm rounded-md ${
                  activeTab === "history" ? "bg-black text-white" : "text-gray-600"
                }`}
              >
                {strings.historyTab}
              </button>
            </div>
          </div>
        </header>

        {activeTab === "requests" && (
          <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-6">
            <Card title={strings.pendingRequests}>
              {requests.length === 0 || requests.every((req) => req.status !== "pending") ? (
                <p className="text-sm text-gray-500">{strings.emptyRequests}</p>
              ) : (
                <ul className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
                  {requests
                    .filter((req) => req.status === "pending")
                    .map((req) => (
                      <li key={req.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedRequestId(req.id)}
                          className={`w-full text-left border rounded-xl px-4 py-3 transition shadow-sm ${
                            selectedRequestId === req.id
                              ? "border-black bg-gray-900 text-white"
                              : "border-gray-200 bg-white hover:border-black/60"
                          }`}
                        >
                          <div className="flex items-center justify-between text-sm font-semibold">
                            <span>{req.driver}</span>
                            <span
                              className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                statusStyles[req.status] || "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {strings.statusPending}
                            </span>
                          </div>
                          <p className="text-xs mt-1 text-gray-500">
                            {req.vehicle}
                          </p>
                          <p className="text-xs mt-1 text-gray-400">
                            {formatDate(req.submittedAt, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </Card>

            <div className="space-y-6">
              {statusMessage && (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    statusMessage.type === "success"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : statusMessage.type === "warning"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}

              {selectedRequest ? (
                <>
                  <Card title={strings.driverRequestCard}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-800">
                      <Field label={strings.driver} value={selectedRequest.driver} />
                      <Field label={strings.vehicle} value={selectedRequest.vehicle} />
                      <Field label={strings.date} value={formatDate(selectedRequest.date)} />
                      <Field label={strings.mileage} value={`${selectedRequest.mileage || "--"} ${strings.kmUnit}`} />
                      <Field label={strings.type} value={formatTypeLabel(selectedRequest.type)} />
                      <Field
                        label={strings.submittedAt}
                        value={formatDate(selectedRequest.submittedAt, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      />
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-black mb-1">{strings.notes}</h3>
                      <p className="text-sm text-gray-600">
                        {selectedRequest.notes || "—"}
                      </p>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-black mb-2">{strings.attachments}</h3>
                      {attachments.length ? (
                        <ul className="space-y-1 text-sm text-gray-600">
                          {attachments.map((item, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                                {index + 1}
                              </span>
                              {renderAttachmentName(item, index)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">{strings.attachmentNone}</p>
                      )}
                    </div>
                  </Card>

                  <Card title={strings.workshopCard}>
                    <form onSubmit={handleMaintenanceSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label={strings.date}
                          name="date"
                          type="date"
                          formData={formData}
                          handleChange={handleChange}
                          disabled
                        />
                        <FormField
                          label={strings.mileage}
                          name="mileage"
                          type="number"
                          placeholder={`e.g. 52,300 ${strings.kmUnit}`}
                          formData={formData}
                          handleChange={handleChange}
                          disabled
                        />
                        <FormField
                          label={strings.type}
                          name="type"
                          type="select"
                          options={maintenanceTypes}
                          formData={formData}
                          handleChange={handleChange}
                          disabled
                        />
                        <FormField
                          label={strings.workshop}
                          name="workshop"
                          placeholder="e.g. Al-Futtaim Service Center"
                          formData={formData}
                          handleChange={handleChange}
                        />
                        <FormField
                          label={strings.cost}
                          name="cost"
                          type="number"
                          placeholder="e.g. 450"
                          formData={formData}
                          handleChange={handleChange}
                        />
                        <FormField
                          label={strings.nextDue}
                          name="nextDueDate"
                          type="date"
                          formData={formData}
                          handleChange={handleChange}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">
                          {strings.detailNotes}
                        </label>
                        <textarea
                          value={formData.details}
                          onChange={(event) => handleChange("details", event.target.value)}
                          rows={4}
                          placeholder={strings.placeholderNotes}
                          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                        />
                      </div>

                      {showSpareParts && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-black">{strings.sparePartsTitle}</h3>
                            <button
                              type="button"
                              onClick={addSparePart}
                              className="text-sm font-semibold text-black hover:underline"
                            >
                              + {strings.addPart}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">{strings.sparePartsHint}</p>
                          <div className="space-y-3">
                            {spareParts.map((part) => (
                              <SparePartRow
                                key={part.id}
                                part={part}
                                strings={strings}
                                isRTL={isRTL}
                                onChange={handlePartChange}
                                onImageChange={handlePartImageChange}
                                onRemove={removeSparePart}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {formData.type === "preventive_maintenance" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            {strings.mileagePhoto}
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMileagePhoto}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                          />
                          {mileagePhoto && (
                            <p className="text-xs text-gray-500 mt-2">{mileagePhoto.name}</p>
                          )}
                        </div>
                      )}

                      {(formData.type === "repair" || formData.type === "oil_change") && (
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            {strings.uploadFiles}
                          </label>
                          <div className="border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-center transition">
                            <input
                              id="attachment-upload"
                              type="file"
                              multiple
                              accept="image/*,.pdf"
                              onChange={handleAttachmentUpload}
                              className="hidden"
                            />
                            <label htmlFor="attachment-upload" className="cursor-pointer text-sm font-semibold text-black">
                              {strings.uploadFiles}
                            </label>
                            {attachments.length > 0 && (
                              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                                {attachments.map((item, index) => (
                                  <li key={index}>{renderAttachmentName(item, index)}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4">
                        <button
                          type="submit"
                          className="bg-black hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition"
                        >
                          {strings.submit}
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDecision("approve")}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition disabled:opacity-50"
                            disabled={selectedRequest.status !== "pending"}
                          >
                            {strings.approve}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecision("reject")}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition disabled:opacity-50"
                            disabled={selectedRequest.status !== "pending"}
                          >
                            {strings.reject}
                          </button>
                        </div>
                      </div>

                      {selectedRequest.status !== "pending" && (
                        <p className="text-xs text-gray-500">{strings.approveDisabled}</p>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">
                          {strings.rejectionNote}
                        </label>
                        <textarea
                          value={decisionNote}
                          onChange={(event) => setDecisionNote(event.target.value)}
                          rows={3}
                          placeholder={strings.rejectionPlaceholder}
                          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                        />
                      </div>
                    </form>
                  </Card>
                </>
              ) : (
                <Card title={strings.workshopCard}>
                  <p className="text-sm text-gray-500">{strings.noSelection}</p>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <Card title={strings.historyHeader}>
            {history.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-800 border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-gray-900">
                    <tr>
                      <th className="py-3 px-4 font-medium">{strings.driver}</th>
                      <th className="py-3 px-4 font-medium">{strings.vehicle}</th>
                      <th className="py-3 px-4 font-medium">{strings.date}</th>
                      <th className="py-3 px-4 font-medium">{strings.type}</th>
                      <th className="py-3 px-4 font-medium">{strings.status}</th>
                      <th className="py-3 px-4 font-medium">{strings.historyResolvedAt}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record) => (
                      <tr key={record.id} className="border-t hover:bg-gray-50 transition">
                        <td className="py-2.5 px-4 whitespace-nowrap">{record.driver}</td>
                        <td className="py-2.5 px-4 whitespace-nowrap">{record.vehicle}</td>
                        <td className="py-2.5 px-4 whitespace-nowrap">{formatDate(record.date)}</td>
                        <td className="py-2.5 px-4 whitespace-nowrap">{formatTypeLabel(record.type)}</td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              statusStyles[record.status] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {record.status === "approved"
                              ? strings.statusApproved
                              : record.status === "rejected"
                              ? strings.statusRejected
                              : strings.statusPending}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">{formatDate(record.resolvedAt, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">{strings.historyEmpty}</p>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
      <h2 className="text-lg font-semibold mb-4 text-black border-b border-gray-100 pb-2">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value }) {
  return (
    <p className="text-sm text-gray-700">
      <span className="font-medium text-black">{label}:</span> {value}
    </p>
  );
}

function FormField({
  label,
  name,
  type = "text",
  placeholder,
  options = [],
  formData,
  handleChange,
  disabled = false,
}) {
  const value = formData[name] || "";
  const baseClasses =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none";
  const disabledClasses = disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed focus:ring-0" : "";

  if (type === "select") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
        <select
          value={value}
          onChange={(event) => !disabled && handleChange(name, event.target.value)}
          disabled={disabled}
          aria-disabled={disabled}
          className={`${baseClasses} ${disabledClasses}`}
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => !disabled && handleChange(name, event.target.value)}
        readOnly={disabled}
        disabled={disabled}
        aria-readonly={disabled}
        aria-disabled={disabled}
        className={`${baseClasses} ${disabledClasses}`}
      />
    </div>
  );
}

function SparePartRow({ part, strings, isRTL, onChange, onImageChange, onRemove }) {
  const imageLabel = part.image
    ? typeof part.image === "string"
      ? part.image
      : part.image.name
    : "";

  return (
    <div className="border border-gray-200 bg-gray-50 rounded-xl p-4 shadow-sm">
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${isRTL ? "text-right" : "text-left"}`}>
        <input
          type="text"
          value={part.name}
          onChange={(event) => onChange(part.id, "name", event.target.value)}
          placeholder={strings.partName}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
        />
        <input
          type="number"
          value={part.quantity}
          onChange={(event) => onChange(part.id, "quantity", event.target.value)}
          placeholder={strings.partQuantity}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
        />
        <input
          type="number"
          value={part.cost}
          onChange={(event) => onChange(part.id, "cost", event.target.value)}
          placeholder={strings.partCost}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
        />
      </div>
      <div className={`mt-3 flex flex-col gap-2 ${isRTL ? "items-end" : "items-start"}`}>
        <label className="text-xs font-medium text-gray-700">{strings.partImage}</label>
        <div
          className={`flex flex-col sm:flex-row sm:items-center gap-2 ${
            isRTL ? "sm:flex-row-reverse" : ""
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              onImageChange && onImageChange(part.id, event.target.files?.[0] ?? null)
            }
            className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
          />
          {imageLabel && <span className="text-xs text-gray-600">{imageLabel}</span>}
        </div>
        {imageLabel && onImageChange && (
          <button
            type="button"
            onClick={() => onImageChange(part.id, null)}
            className="text-xs text-red-600 hover:underline"
          >
            {strings.removeImage}
          </button>
        )}
      </div>
      <div className={`mt-2 flex ${isRTL ? "justify-start" : "justify-end"}`}>
        <button
          type="button"
          onClick={() => onRemove(part.id)}
          className="text-sm text-red-600 hover:underline"
        >
          {strings.removePart}
        </button>
      </div>
    </div>
  );
}
