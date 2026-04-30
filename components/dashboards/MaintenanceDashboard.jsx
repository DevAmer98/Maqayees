//app/dashboard/%28role%29/%28maintenance%29/page.jsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

const generateJobCardNumber = () => {
  const now = new Date();
  const datePart = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  const timePart = [String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0")].join("");
  return `JC-${datePart}-${timePart}`;
};

const createJobCardRepairRow = () => ({
  id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `repair-${Math.random()}`,
  service: "",
  repTag: "",
  qty: "",
  itemCode: "",
  unitPrice: "",
  totalPrice: "",
});

const mapSparePartsToJobCardRepairs = (parts) => {
  const populated = (parts || []).filter((part) =>
    [part?.name, part?.quantity, part?.cost].some((value) => value && String(value).trim())
  );

  if (!populated.length) return [createJobCardRepairRow()];

  return populated.map((part) => {
    const qtyText = String(part.quantity || "").trim();
    const costText = String(part.cost || "").trim();
    const qtyNum = Number(qtyText);
    const costNum = Number(costText);
    const hasNumbers = Number.isFinite(qtyNum) && Number.isFinite(costNum) && qtyText !== "" && costText !== "";
    const total = hasNumbers ? String(qtyNum * costNum) : "";

    return {
      id: part.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `repair-${Math.random()}`),
      service: part.name || "",
      repTag: "",
      qty: qtyText,
      itemCode: "",
      unitPrice: costText,
      totalPrice: total,
    };
  });
};

const parseVehicleLabel = (label) => {
  if (!label) return { model: "", plate: "" };
  const parts = label.split("—").map((part) => part.trim());
  return {
    model: parts[0] || label,
    plate: parts[1] || label,
  };
};

const buildJobCardDefaults = (request) => {
  const { model, plate } = parseVehicleLabel(request?.vehicle);
  return {
    jobNo: generateJobCardNumber(),
    plateNo: plate,
    driverName: request?.driver || "",
    assetCode: "",
    project: "",
    application: "",
    vehicleType: model,
    kms: request?.mileage || "",
    model,
    dateIn: request?.date || "",
    dateOut: "",
    complaint: request?.notes || "",
    repairType: request?.type || "",
    mainPower: "",
    totalAmount: "",
    preparedBy: "",
    approvedBy: "",
  };
};

const escapeHtml = (value) => {
  if (!value) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHistoryRefreshing, setIsHistoryRefreshing] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [jobCardInfo, setJobCardInfo] = useState(() => buildJobCardDefaults(null));
  const [jobCardRepairs, setJobCardRepairs] = useState([createJobCardRepairRow()]);
  const [jobCardSnapshots, setJobCardSnapshots] = useState({});

  useEffect(() => {
    setSelectedRequestId((prev) => {
      if (prev) return prev;
      return requests.find((req) => req.status === "pending")?.id ?? null;
    });
  }, [requests]);

  const loadHistoryFromDb = useCallback(async () => {
    try {
      const response = await fetch("/api/maintenance/history", {
        method: "GET",
        cache: "no-store",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success || !Array.isArray(data.history)) return false;
      setHistory(data.history);
      return true;
    } catch (error) {
      console.error("Failed to fetch maintenance history:", error);
      return false;
    }
  }, []);

  const loadRequestsFromDb = useCallback(async () => {
    try {
      const response = await fetch("/api/maintenance?status=pending", {
        method: "GET",
        cache: "no-store",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success || !Array.isArray(data.requests)) return false;
      setRequests(data.requests);
      return true;
    } catch (error) {
      console.error("Failed to fetch maintenance requests:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    void loadHistoryFromDb();
    void loadRequestsFromDb();
  }, [loadHistoryFromDb, loadRequestsFromDb]);

  useEffect(() => {
    setSelectedHistoryId((prev) => {
      if (prev && history.some((record) => record.id === prev)) return prev;
      return history[0]?.id ?? null;
    });
  }, [history]);

  const handleRefreshHistory = async () => {
    if (isHistoryRefreshing) return;
    setIsHistoryRefreshing(true);
    try {
      await loadHistoryFromDb();
    } finally {
      setIsHistoryRefreshing(false);
    }
  };

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
        refreshHistory: "Refresh",
        historyDetails: "Record Details",
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
        saveJobCard: "Save Job Card",
        completeProcess: "Complete Process",
        completeHelp: "Use Complete Process to save the job card and send this request as approved.",
        approve: "Approve",
        reject: "Reject",
        rejectionNote: "Decision note",
        rejectionPlaceholder: "Optional: explain why the request was rejected",
        messageSaved: "Request details updated.",
        messageSavedDb: "Request and job card saved to database.",
        messageSavedLocalOnly: "Request saved locally, but job card database save failed.",
        messageApproved: "Request approved and added to history.",
        messageApprovePersistFailed: "Could not complete process because maintenance record was not saved to database.",
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
        pdfWindowBlocked: "Pop-up blocked. Allow pop-ups to download the job card.",
        jobCardPreviewTitle: "Saved Job Card",
        jobCardPreviewEmpty: "No job card saved yet. Submit the maintenance update to capture one.",
        jobCard: {
          title: "Maintenance Job Card",
          subtitle: "Complete this form and share it with the workshop team.",
          instructions: "All fields appear inside the exported PDF.",
          jobNo: "Job No.",
          plateNo: "Plate No.",
          driverName: "Driver",
          assetCode: "Asset Code",
          project: "Project",
          application: "Application",
          vehicleType: "Vehicle Type",
          kms: "KMS/HRS",
          model: "Model",
          dateIn: "Date, Time IN",
          dateOut: "Date, Time Out",
          complaint: "Complaint",
          repairType: "Type of Repair",
          mainPower: "Main Power",
          totalAmount: "Total Amount",
          preparedBy: "Prepared & Verified by",
          approvedBy: "Approved by",
          nameSignature: "Name & Signature",
          fleetManagerTitle: "Fleet & Logistics Manager",
          workshopSection: "Workshop Repairs",
          repairService: "Repair & Service",
          repTag: "Rep Tag",
          qty: "Qty",
          itemCode: "Item Code",
          unitPrice: "Unit Price",
          totalPrice: "Total Price",
          addRepairRow: "Add Repair Line",
          remove: "Remove",
          downloadButton: "Download Job Card PDF",
          resetButton: "Reset Job Card",
          docNumber: "Doc No. MQAYES/WS/F/02",
          jobCardHeader: "JOB CARD / نموذج إصلاح",
          brandLine1: "MQAYES",
          brandLine2: "شركة مقاييس الدقة",
          noData: "No data",
        },
      },
      ar: {
        title: "مركز التحكم بالصيانة",
        subtitle: "مراجعة طلبات السائقين واستكمال تفاصيل الورشة.",
        requestsTab: "الطلبات",
        historyTab: "السجل",
        noSelection: "اختر طلب صيانة للبدء.",
        pendingRequests: "طلبات صيانة قيد المراجعة",
        historyHeader: "السجلات المكتملة أو المرفوضة",
        refreshHistory: "تحديث",
        historyDetails: "تفاصيل السجل",
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
        saveJobCard: "حفظ نموذج الإصلاح",
        completeProcess: "إكمال الإجراء",
        completeHelp: "استخدم إكمال الإجراء لحفظ نموذج الإصلاح واعتماد الطلب.",
        approve: "اعتماد",
        reject: "رفض",
        rejectionNote: "ملاحظة القرار",
        rejectionPlaceholder: "اختياري: وضح سبب الرفض",
        messageSaved: "تم تحديث تفاصيل الطلب.",
        messageSavedDb: "تم حفظ الطلب ونموذج الإصلاح في قاعدة البيانات.",
        messageSavedLocalOnly: "تم حفظ الطلب محلياً، لكن فشل حفظ نموذج الإصلاح في قاعدة البيانات.",
        messageApproved: "تم اعتماد الطلب وإضافته إلى السجل.",
        messageApprovePersistFailed: "تعذر إكمال الإجراء لأن سجل الصيانة لم يُحفظ في قاعدة البيانات.",
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
        pdfWindowBlocked: "تم حظر النافذة المنبثقة. يرجى السماح بتنزيل نموذج الإصلاح.",
        jobCardPreviewTitle: "أحدث نموذج إصلاح",
        jobCardPreviewEmpty: "لم يتم حفظ نموذج إصلاح لهذا الطلب بعد. احفظ التحديث لتوليد واحد.",
        jobCard: {
          title: "نموذج إصلاح",
          subtitle: "أكمل التفاصيل التالية وشاركها مع فريق الصيانة.",
          instructions: "ستظهر جميع الحقول في ملف PDF.",
          jobNo: "رقم المهمة",
          plateNo: "رقم اللوحة",
          driverName: "السائق",
          assetCode: "كود الأصل",
          project: "المشروع",
          application: "تصنيف المركبة",
          vehicleType: "نوع المركبة",
          kms: "عداد المسافة / الساعة",
          model: "الطراز",
          dateIn: "تاريخ ووقت الدخول",
          dateOut: "تاريخ ووقت الخروج",
          complaint: "الشكوى",
          repairType: "نوع الإصلاح",
          mainPower: "القوة العاملة",
          totalAmount: "المبلغ الإجمالي",
          preparedBy: "تم الإعداد والمراجعة بواسطة",
          approvedBy: "تمت الموافقة بواسطة",
          nameSignature: "الاسم والتوقيع",
          fleetManagerTitle: "مدير الأسطول واللوجستيات",
          workshopSection: "إصلاحات الورشة",
          repairService: "الخدمة / الإصلاح",
          repTag: "الرقم المرجعي",
          qty: "الكمية",
          itemCode: "رمز الصنف",
          unitPrice: "سعر الوحدة",
          totalPrice: "السعر الإجمالي",
          addRepairRow: "إضافة بند إصلاح",
          remove: "حذف",
          downloadButton: "تنزيل نموذج الإصلاح PDF",
          resetButton: "إعادة ضبط النموذج",
          docNumber: "رقم الوثيقة MQAYES/WS/F/02",
          jobCardHeader: "JOB CARD / نموذج إصلاح",
          brandLine1: "MQAYES",
          brandLine2: "شركة مقاييس الدقة",
          noData: "لا توجد بيانات",
        },
      },
      ur: {
        title: "مینٹیننس کنٹرول سینٹر",
        subtitle: "ڈرائیور کی درخواستوں کا جائزہ لیں اور ورکشاپ تفصیلات مکمل کریں۔",
        requestsTab: "درخواستیں",
        historyTab: "ہسٹری",
        noSelection: "براہ کرم جائزہ شروع کرنے کیلئے ایک درخواست منتخب کریں۔",
        pendingRequests: "زیرِ جائزہ مینٹیننس درخواستیں",
        historyHeader: "مکمل یا مسترد شدہ ریکارڈ",
        refreshHistory: "ریفریش",
        historyDetails: "ریکارڈ کی تفصیل",
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
        saveJobCard: "جاب کارڈ محفوظ کریں",
        completeProcess: "عمل مکمل کریں",
        completeHelp: "عمل مکمل کریں بٹن جاب کارڈ محفوظ کر کے درخواست منظور کر دیتا ہے۔",
        approve: "منظور کریں",
        reject: "مسترد کریں",
        rejectionNote: "فیصلہ نوٹ",
        rejectionPlaceholder: "اختیاری: مسترد کرنے کی وجہ بتائیں",
        messageSaved: "درخواست کی تفصیلات اپ ڈیٹ ہو گئیں۔",
        messageSavedDb: "درخواست اور جاب کارڈ ڈیٹابیس میں محفوظ ہو گئے۔",
        messageSavedLocalOnly: "درخواست مقامی طور پر محفوظ ہوئی، لیکن جاب کارڈ ڈیٹابیس میں محفوظ نہیں ہو سکا۔",
        messageApproved: "درخواست منظور ہو گئی اور ہسٹری میں شامل کی گئی۔",
        messageApprovePersistFailed: "عمل مکمل نہ ہو سکا کیونکہ مینٹیننس ریکارڈ ڈیٹابیس میں محفوظ نہیں ہوا۔",
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
        pdfWindowBlocked: "پاپ اپ بلاک ہو گیا۔ براہ کرم جاب کارڈ ڈاؤن لوڈ کرنے کی اجازت دیں۔",
        jobCardPreviewTitle: "حفوظ شدہ جاب کارڈ",
        jobCardPreviewEmpty: "اس درخواست کے لیے ابھی تک کوئی جاب کارڈ محفوظ نہیں ہوا۔ اپ ڈیٹ محفوظ کریں تاکہ تیار ہو۔",
        jobCard: {
          title: "جاب کارڈ",
          subtitle: "یہ فارم پُر کریں اور ورکشاپ کے ساتھ شیئر کریں۔",
          instructions: "تمام معلومات PDF میں شامل ہوں گی۔",
          jobNo: "جاب نمبر",
          plateNo: "پلیٹ نمبر",
          driverName: "ڈرائیور",
          assetCode: "ایسٹ کوڈ",
          project: "پروجیکٹ",
          application: "مکینیکل کیٹیگری",
          vehicleType: "گاڑی کی قسم",
          kms: "کلومیٹر / گھنٹے",
          model: "ماڈل",
          dateIn: "انٹری کی تاریخ اور وقت",
          dateOut: "خروج کی تاریخ اور وقت",
          complaint: "شکایت",
          repairType: "مرمت کی قسم",
          mainPower: "مین پاور",
          totalAmount: "کل رقم",
          preparedBy: "تیار اور تصدیق کردہ",
          approvedBy: "منظور کردہ",
          nameSignature: "نام اور دستخط",
          fleetManagerTitle: "فلیٹ اور لاجسٹکس منیجر",
          workshopSection: "ورکشاپ مرمت",
          repairService: "مرمت / سروس",
          repTag: "ریپ ٹیگ",
          qty: "تعداد",
          itemCode: "آئٹم کوڈ",
          unitPrice: "یونٹ قیمت",
          totalPrice: "کل قیمت",
          addRepairRow: "مرمت آئٹم شامل کریں",
          remove: "حذف کریں",
          downloadButton: "جاب کارڈ PDF ڈاؤن لوڈ کریں",
          resetButton: "جاب کارڈ ری سیٹ کریں",
          docNumber: "Doc No. MQAYES/WS/F/02",
          jobCardHeader: "JOB CARD / نموذج إصلاح",
          brandLine1: "MQAYES",
          brandLine2: "شركة مقاييس الدقة",
          noData: "کوئی ڈیٹا نہیں",
        },
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

  const formatTypeLabel = useCallback(
    (value) => {
      const match = maintenanceTypes.find((option) => option.value === value);
      return match ? match.label : value || "--";
    },
    [maintenanceTypes]
  );

  const selectedRequest = useMemo(
    () => requests.find((req) => req.id === selectedRequestId) || null,
    [requests, selectedRequestId]
  );
  const selectedHistoryRecord = useMemo(
    () => history.find((record) => record.id === selectedHistoryId) || null,
    [history, selectedHistoryId]
  );

  const showSpareParts = SPARE_PART_TYPES.has(formData.type);

  const workshopFieldConfigs = [
    { name: "date", label: strings.date, type: "date", disabled: true },
    {
      name: "mileage",
      label: strings.mileage,
      type: "number",
      placeholder: `e.g. 52,300 ${strings.kmUnit}`,
      disabled: true,
    },
    { name: "type", label: strings.type, type: "select", options: maintenanceTypes, disabled: true },
    {
      name: "workshop",
      label: strings.workshop,
      placeholder: "e.g. Al-Futtaim Service Center",
    },
    {
      name: "cost",
      label: strings.cost,
      type: "number",
      placeholder: "e.g. 450",
    },
    { name: "nextDueDate", label: strings.nextDue, type: "date" },
  ];

  const jobCardMainFields = [
    { key: "jobNo", label: strings.jobCard.jobNo },
    { key: "plateNo", label: strings.jobCard.plateNo },
    { key: "driverName", label: strings.jobCard.driverName },
    { key: "assetCode", label: strings.jobCard.assetCode },
    { key: "project", label: strings.jobCard.project },
    { key: "application", label: strings.jobCard.application },
    { key: "vehicleType", label: strings.jobCard.vehicleType },
    { key: "kms", label: strings.jobCard.kms },
    { key: "model", label: strings.jobCard.model },
    { key: "dateIn", label: strings.jobCard.dateIn, type: "datetime-local" },
    { key: "dateOut", label: strings.jobCard.dateOut, type: "datetime-local" },
    { key: "mainPower", label: strings.jobCard.mainPower },
    { key: "totalAmount", label: strings.jobCard.totalAmount },
  ];

  const jobCardTextareaFields = [
    { key: "complaint", label: strings.jobCard.complaint },
    { key: "repairType", label: strings.jobCard.repairType },
  ];

  const jobCardSignatureFields = [
    { key: "preparedBy", label: strings.jobCard.preparedBy },
    { key: "approvedBy", label: strings.jobCard.approvedBy },
  ];

  const workshopDuplicateJobCardKeys = new Set(["kms", "dateIn", "repairType"]);
  const visibleJobCardMainFields = jobCardMainFields.filter(
    (field) => !workshopDuplicateJobCardKeys.has(field.key)
  );
  const visibleJobCardTextareaFields = jobCardTextareaFields.filter(
    (field) => !workshopDuplicateJobCardKeys.has(field.key)
  );

  useEffect(() => {
    if (!showSpareParts) return;
    setJobCardRepairs(mapSparePartsToJobCardRepairs(spareParts));
  }, [showSpareParts, spareParts]);

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
    if (!selectedRequest) {
      setJobCardInfo(buildJobCardDefaults(null));
      setJobCardRepairs([createJobCardRepairRow()]);
      return;
    }

    const snapshot = jobCardSnapshots[selectedRequest.id];
    if (snapshot) {
      setJobCardInfo({ ...snapshot.info });
      setJobCardRepairs(snapshot.repairs.map((row) => ({ ...row })));
      return;
    }

    const defaults = buildJobCardDefaults(selectedRequest);
    defaults.repairType = formatTypeLabel(selectedRequest.type);
    setJobCardInfo(defaults);
    setJobCardRepairs([createJobCardRepairRow()]);
  }, [selectedRequest, jobCardSnapshots, formatTypeLabel]);

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

  const handleJobCardInfoChange = (field, value) => {
    setJobCardInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleJobCardRepairChange = (id, field, value) => {
    setJobCardRepairs((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addJobCardRepairRow = () => {
    setJobCardRepairs((prev) => [...prev, createJobCardRepairRow()]);
  };

  const removeJobCardRepairRow = (id) => {
    setJobCardRepairs((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.id !== id)));
  };

  const resetJobCard = () => {
    const defaults = buildJobCardDefaults(selectedRequest);
    defaults.repairType = selectedRequest ? formatTypeLabel(selectedRequest.type) : "";
    setJobCardInfo(defaults);
    setJobCardRepairs([createJobCardRepairRow()]);
    if (selectedRequest) {
      setJobCardSnapshots((prev) => {
        const next = { ...prev };
        delete next[selectedRequest.id];
        return next;
      });
    }
  };

  const handleJobCardPdf = () => {
    if (typeof window === "undefined") return;
    const popup = window.open("", "jobCardWindow", "width=900,height=1200");
    if (!popup) {
      alert(strings.pdfWindowBlocked);
      return;
    }
    popup.opener = null;

    const jc = strings.jobCard;
    const normalize = (value) => (value === undefined || value === null ? "" : String(value));
    const safeValue = (value) => {
      const text = normalize(value);
      return text.trim() ? escapeHtml(text) : escapeHtml(jc.noData);
    };
    const safeMultiline = (value) => {
      const text = normalize(value);
      return text.trim() ? escapeHtml(text).replace(/\n/g, "<br/>") : escapeHtml(jc.noData);
    };

    const infoRows = [
      [
        { label: jc.plateNo, value: jobCardInfo.plateNo },
        { label: jc.driverName, value: jobCardInfo.driverName },
        { label: jc.application, value: jobCardInfo.application },
      ],
      [
        { label: jc.assetCode, value: jobCardInfo.assetCode },
        { label: jc.vehicleType, value: jobCardInfo.vehicleType },
        { label: jc.project, value: jobCardInfo.project },
      ],
      [
        { label: jc.kms, value: jobCardInfo.kms },
        { label: jc.model, value: jobCardInfo.model },
        { label: jc.complaint, value: jobCardInfo.complaint },
      ],
      [
        { label: jc.dateIn, value: jobCardInfo.dateIn },
        { label: jc.dateOut, value: jobCardInfo.dateOut },
        { label: jc.repairType, value: jobCardInfo.repairType },
      ],
    ];

    const infoTableRows = infoRows
      .map(
        (row) => `
          <tr>
            ${row
              .map(
                (cell) => `
                  <td>
                    <div class="label">${escapeHtml(cell.label)}</div>
                    <div class="value">${safeMultiline(cell.value)}</div>
                  </td>
                `
              )
              .join("")}
          </tr>
        `
      )
      .join("");

    const populatedRepairs = jobCardRepairs.filter((row) =>
      [row.service, row.repTag, row.qty, row.itemCode, row.unitPrice, row.totalPrice].some((value) =>
        value && String(value).trim()
      )
    );
    const workshopRows = [
      { label: strings.date, value: formData.date },
      { label: strings.mileage, value: formData.mileage ? `${formData.mileage} ${strings.kmUnit}` : "" },
      { label: strings.type, value: formatTypeLabel(formData.type) },
      { label: strings.workshop, value: formData.workshop },
      { label: strings.cost, value: formData.cost },
      { label: strings.nextDue, value: formData.nextDueDate },
      { label: strings.detailNotes, value: formData.details },
    ];
    const workshopTableRows = workshopRows
      .map(
        (row) => `
          <tr>
            <td class="label-cell">${escapeHtml(row.label)}</td>
            <td>${safeMultiline(row.value)}</td>
          </tr>
        `
      )
      .join("");

    const repairsTableRows = populatedRepairs.length
      ? populatedRepairs
          .map(
            (row) => `
              <tr>
                <td>${safeValue(row.service)}</td>
                <td>${safeValue(row.repTag)}</td>
                <td>${safeValue(row.qty)}</td>
                <td>${safeValue(row.itemCode)}</td>
                <td>${safeValue(row.unitPrice)}</td>
                <td>${safeValue(row.totalPrice)}</td>
              </tr>
            `
          )
          .join("")
      : `<tr><td colspan="6" class="empty">${escapeHtml(jc.noData)}</td></tr>`;

    const popupHtml = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(jc.jobCardHeader)}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 32px; color: #0f172a; }
            h1 { margin: 8px 0; color: #2563eb; }
            .brand { display: flex; justify-content: space-between; align-items: center; }
            .brand h2 { margin: 0; font-size: 20px; letter-spacing: 1px; }
            .tagline { font-size: 12px; color: #94a3b8; }
            .doc-number { text-align: right; font-size: 12px; color: #475569; }
            .job-number { border: 1px solid #cbd5f5; padding: 6px 12px; width: 220px; margin: 12px 0; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; }
            table.info td { border: 1px solid #e2e8f0; padding: 8px; vertical-align: top; width: 33%; }
            table.info .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
            table.info .value { font-size: 13px; margin-top: 4px; }
            table.repairs th { background: #f8fafc; text-align: left; font-size: 12px; }
            table.repairs th, table.repairs td { border: 1px solid #e2e8f0; padding: 8px; }
            table.repairs td.empty { text-align: center; color: #94a3b8; }
            table.workshop td { border: 1px solid #e2e8f0; padding: 8px; vertical-align: top; }
            table.workshop .label-cell { width: 220px; font-size: 12px; color: #334155; background: #f8fafc; font-weight: 600; }
            .notes { display: grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 16px; margin-top: 20px; }
            .notes div { border: 1px solid #e2e8f0; padding: 12px; min-height: 90px; }
            .notes strong { display: block; font-size: 13px; color: #0f172a; margin-bottom: 6px; }
            .summary { display: flex; gap: 24px; margin-top: 24px; font-size: 13px; }
            .summary span { font-weight: 600; margin-right: 8px; }
            .signatures { display: grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 24px; margin-top: 32px; }
            .signature-card { border-top: 2px solid #0f172a; padding-top: 12px; font-size: 13px; }
            .signature-card .label { font-weight: 600; margin-bottom: 6px; }
            .signature-line { margin-top: 16px; font-size: 12px; color: #475569; letter-spacing: 0.1em; }
          </style>
        </head>
        <body>
          <div class="brand">
            <div>
              <h2>${escapeHtml(jc.brandLine1)}</h2>
              <p class="tagline">${escapeHtml(jc.brandLine2)}</p>
            </div>
            <div class="doc-number">${escapeHtml(jc.docNumber)}</div>
          </div>
          <h1>${escapeHtml(jc.jobCardHeader)}</h1>
          <div class="job-number">${escapeHtml(jc.jobNo)}: ${safeValue(jobCardInfo.jobNo)}</div>
          <table class="info">
            ${infoTableRows}
          </table>
          <h3 style="margin-top:24px;">${escapeHtml(strings.workshopCard)}</h3>
          <table class="workshop">
            <tbody>${workshopTableRows}</tbody>
          </table>
          <h3 style="margin-top:24px;">${escapeHtml(jc.workshopSection)}</h3>
          <table class="repairs">
            <thead>
              <tr>
                <th>${escapeHtml(jc.repairService)}</th>
                <th>${escapeHtml(jc.repTag)}</th>
                <th>${escapeHtml(jc.qty)}</th>
                <th>${escapeHtml(jc.itemCode)}</th>
                <th>${escapeHtml(jc.unitPrice)}</th>
                <th>${escapeHtml(jc.totalPrice)}</th>
              </tr>
            </thead>
            <tbody>${repairsTableRows}</tbody>
          </table>
          <div class="notes">
            <div>
              <strong>${escapeHtml(jc.complaint)}</strong>
              <p>${safeMultiline(jobCardInfo.complaint)}</p>
            </div>
            <div>
              <strong>${escapeHtml(jc.repairType)}</strong>
              <p>${safeMultiline(jobCardInfo.repairType)}</p>
            </div>
          </div>
          <div class="summary">
            <div><span>${escapeHtml(jc.mainPower)}:</span> ${safeValue(jobCardInfo.mainPower)}</div>
            <div><span>${escapeHtml(jc.totalAmount)}:</span> ${safeValue(jobCardInfo.totalAmount)}</div>
          </div>
          <div class="signatures">
            <div class="signature-card">
              <div class="label">${escapeHtml(jc.preparedBy)}</div>
              <div>${safeValue(jobCardInfo.preparedBy)}</div>
              <div class="signature-line">${escapeHtml(jc.nameSignature)} ____________________</div>
            </div>
            <div class="signature-card">
              <div class="label">${escapeHtml(jc.approvedBy)}</div>
              <div>${safeValue(jobCardInfo.approvedBy || jc.fleetManagerTitle)}</div>
              <div class="signature-line">${escapeHtml(jc.nameSignature)} ____________________</div>
            </div>
          </div>
        </body>
      </html>
    `;

    popup.document.write(popupHtml);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const loadJobCardSnapshotFromDb = useCallback(async (requestId) => {
    try {
      const response = await fetch(`/api/maintenance/job-card?requestId=${encodeURIComponent(requestId)}`, {
        method: "GET",
        cache: "no-store",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success || !data?.snapshot) return null;
      const info = data.snapshot.info && typeof data.snapshot.info === "object" ? data.snapshot.info : {};
      const repairs = Array.isArray(data.snapshot.repairs) ? data.snapshot.repairs : [createJobCardRepairRow()];
      return {
        info,
        repairs: repairs.length ? repairs : [createJobCardRepairRow()],
      };
    } catch (error) {
      console.error("Failed to fetch job card snapshot:", error);
      return null;
    }
  }, []);

  const saveJobCardSnapshotToDb = useCallback(async (requestId, snapshot) => {
    const response = await fetch("/api/maintenance/job-card", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestId, snapshot }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success || !data?.snapshot) {
      throw new Error(data?.error || "Failed to save snapshot.");
    }
    return {
      info: data.snapshot.info && typeof data.snapshot.info === "object" ? data.snapshot.info : {},
      repairs: Array.isArray(data.snapshot.repairs) ? data.snapshot.repairs : [],
    };
  }, []);

  const createMaintenanceRecordInDb = useCallback(async (requestData, workshopData) => {
    const response = await fetch("/api/maintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicleId: requestData?.vehicleId || "",
        vehicleLabel: requestData?.vehicle || "",
        date: workshopData.date,
        mileage: workshopData.mileage,
        type: workshopData.type,
        workshop: workshopData.workshop,
        details: workshopData.details,
        cost: workshopData.cost,
        nextDueDate: workshopData.nextDueDate,
      }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success) {
      throw new Error(data?.error || "Failed to save maintenance record.");
    }
    return data.maintenance;
  }, []);

  const resolveMaintenanceRequestInDb = useCallback(async (requestId, nextStatus, note) => {
    const response = await fetch("/api/maintenance", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId,
        status: nextStatus,
        decisionNote: note,
      }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success) {
      throw new Error(data?.error || "Failed to update maintenance request.");
    }
    return data.request;
  }, []);

  useEffect(() => {
    if (!selectedRequest) return;
    if (jobCardSnapshots[selectedRequest.id]) return;

    let cancelled = false;
    (async () => {
      const snapshot = await loadJobCardSnapshotFromDb(selectedRequest.id);
      if (cancelled || !snapshot) return;
      setJobCardSnapshots((prev) => (prev[selectedRequest.id] ? prev : { ...prev, [selectedRequest.id]: snapshot }));
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedRequest, jobCardSnapshots, loadJobCardSnapshotFromDb]);

  const persistCurrentRequestAndSnapshot = useCallback(async (showStatus = true) => {
    if (!selectedRequest) return false;
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

    const snapshot = {
      info: {
        ...jobCardInfo,
        workshopDate: formData.date || "",
        workshopMileage: formData.mileage ? `${formData.mileage} ${strings.kmUnit}` : "",
        workshopType: formatTypeLabel(formData.type),
        workshopName: formData.workshop || "",
        workshopCost: formData.cost || "",
        workshopNextDueDate: formData.nextDueDate || "",
        workshopDetails: formData.details || "",
      },
      repairs: jobCardRepairs.map((row) => ({ ...row })),
    };
    setJobCardSnapshots((prev) => ({ ...prev, [selectedRequest.id]: snapshot }));

    try {
      const persistedSnapshot = await saveJobCardSnapshotToDb(selectedRequest.id, snapshot);
      setJobCardSnapshots((prev) => ({ ...prev, [selectedRequest.id]: persistedSnapshot }));
      if (showStatus) {
        setStatusMessage({ type: "success", text: strings.messageSavedDb });
      }
      return true;
    } catch (error) {
      console.error("Failed to persist job card snapshot:", error);
      if (showStatus) {
        setStatusMessage({ type: "warning", text: strings.messageSavedLocalOnly });
      }
      return false;
    }
  }, [
    selectedRequest,
    formData,
    spareParts,
    attachments,
    mileagePhoto,
    jobCardInfo,
    jobCardRepairs,
    strings.kmUnit,
    strings.messageSavedDb,
    strings.messageSavedLocalOnly,
    formatTypeLabel,
    saveJobCardSnapshotToDb,
  ]);

  const handleMaintenanceSubmit = async (event) => {
    event.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await persistCurrentRequestAndSnapshot(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteProcess = async () => {
    if (!selectedRequest || selectedRequest.status !== "pending" || isProcessing) return;
    setIsProcessing(true);
    try {
      const saved = await persistCurrentRequestAndSnapshot(true);
      if (!saved) return;
      await handleDecision("approve");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecision = async (decision) => {
    if (!selectedRequest) return;

    if (decision === "approve") {
      const requiredFields = ["date", "mileage", "type", "workshop", "cost", "nextDueDate"];
      const hasMissing = requiredFields.some((field) => !formData[field]);
      if (hasMissing) {
        setStatusMessage({ type: "error", text: strings.validationMissing });
        return;
      }
      try {
        await createMaintenanceRecordInDb(selectedRequest, formData);
      } catch (error) {
        console.error("Failed to persist maintenance record:", error);
        setStatusMessage({
          type: "error",
          text: `${strings.messageApprovePersistFailed} ${error?.message ? `(${error.message})` : ""}`.trim(),
        });
        return;
      }
    }

    const resolvedAt = new Date().toISOString();
    const nextStatus = decision === "approve" ? "approved" : "rejected";

    if (selectedRequest.vehicleId) {
      try {
        await resolveMaintenanceRequestInDb(selectedRequest.id, nextStatus, decisionNote);
      } catch (error) {
        console.error("Failed to resolve maintenance request:", error);
        setStatusMessage({
          type: "error",
          text: error?.message || "Failed to update maintenance request.",
        });
        return;
      }
    }

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

    if (decision === "approve") {
      await loadHistoryFromDb();
    } else {
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
    }

    setStatusMessage({
      type: decision === "approve" ? "success" : "warning",
      text: decision === "approve" ? strings.messageApproved : strings.messageRejected,
    });
    setDecisionNote("");
    void loadRequestsFromDb();
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
                    {(() => {
                      const driverInfoFields = [
                        { label: strings.driver, value: selectedRequest.driver },
                        { label: strings.vehicle, value: selectedRequest.vehicle },
                        { label: strings.date, value: formatDate(selectedRequest.date) },
                        {
                          label: strings.mileage,
                          value: `${selectedRequest.mileage || "--"} ${strings.kmUnit}`,
                        },
                        { label: strings.type, value: formatTypeLabel(selectedRequest.type) },
                        {
                          label: strings.submittedAt,
                          value: formatDate(selectedRequest.submittedAt, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }),
                        },
                      ];
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-800">
                          {driverInfoFields.map(({ label, value }) => (
                            <Field key={label} label={label} value={value} />
                          ))}
                        </div>
                      );
                    })()}
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

                  <Card title={`${strings.workshopCard} & ${strings.jobCard.title}`}>
                    <form onSubmit={handleMaintenanceSubmit} className="space-y-10">
                      <section className="space-y-6">
                        <h3 className="text-base font-semibold text-black border-b border-gray-100 pb-2">
                          {strings.workshopCard}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {workshopFieldConfigs.map((field) => (
                            <FormField
                              key={field.name}
                              label={field.label}
                            name={field.name}
                            type={field.type || "text"}
                            placeholder={field.placeholder}
                            options={field.options}
                            formData={formData}
                            handleChange={handleChange}
                            disabled={field.disabled}
                          />
                        ))}
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

                      {/*
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
                      */}
                      </section>

                      <section className="space-y-6">
                        <div>
                          <h3 className="text-base font-semibold text-black border-b border-gray-100 pb-2">
                            {strings.jobCard.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">{strings.jobCard.subtitle}</p>
                          <p className="text-xs text-gray-500 mb-4">{strings.jobCard.instructions}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {visibleJobCardMainFields.map((field) => (
                              <JobCardInput
                                key={field.key}
                                label={field.label}
                                type={field.type || "text"}
                                value={jobCardInfo[field.key] || ""}
                                onChange={(value) => handleJobCardInfoChange(field.key, value)}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            {visibleJobCardTextareaFields.map((field) => (
                              <JobCardTextarea
                                key={field.key}
                                label={field.label}
                                value={jobCardInfo[field.key] || ""}
                                onChange={(value) => handleJobCardInfoChange(field.key, value)}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            {jobCardSignatureFields.map((field) => (
                              <JobCardInput
                                key={field.key}
                                label={field.label}
                                value={jobCardInfo[field.key] || ""}
                                onChange={(value) => handleJobCardInfoChange(field.key, value)}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-base font-semibold text-black">{strings.jobCard.workshopSection}</h4>
                            {!showSpareParts && (
                              <button
                                type="button"
                                onClick={addJobCardRepairRow}
                                className="text-sm font-semibold text-black px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100"
                              >
                                + {strings.jobCard.addRepairRow}
                              </button>
                            )}
                          </div>
                          <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                  <th className="px-3 py-2 text-left">{strings.jobCard.repairService}</th>
                                  <th className="px-3 py-2 text-left">{strings.jobCard.repTag}</th>
                                  <th className="px-3 py-2 text-left">{strings.jobCard.qty}</th>
                                  <th className="px-3 py-2 text-left">{strings.jobCard.itemCode}</th>
                                  <th className="px-3 py-2 text-left">{strings.jobCard.unitPrice}</th>
                                  <th className="px-3 py-2 text-left">{strings.jobCard.totalPrice}</th>
                                  <th className="px-3 py-2"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {jobCardRepairs.map((row) => (
                                  <tr key={row.id} className="border-t">
                                    <td className="px-3 py-2">
                                      {showSpareParts ? (
                                        <span>{row.service || strings.jobCard.noData}</span>
                                      ) : (
                                        <input
                                          type="text"
                                          value={row.service}
                                          onChange={(event) => handleJobCardRepairChange(row.id, "service", event.target.value)}
                                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                                        />
                                      )}
                                    </td>
                                    <td className="px-3 py-2">
                                      {showSpareParts ? (
                                        <span>{row.repTag || strings.jobCard.noData}</span>
                                      ) : (
                                        <input
                                          type="text"
                                          value={row.repTag}
                                          onChange={(event) => handleJobCardRepairChange(row.id, "repTag", event.target.value)}
                                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                                        />
                                      )}
                                    </td>
                                    <td className="px-3 py-2">
                                      {showSpareParts ? (
                                        <span>{row.qty || strings.jobCard.noData}</span>
                                      ) : (
                                        <input
                                          type="text"
                                          value={row.qty}
                                          onChange={(event) => handleJobCardRepairChange(row.id, "qty", event.target.value)}
                                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                                        />
                                      )}
                                    </td>
                                    <td className="px-3 py-2">
                                      {showSpareParts ? (
                                        <span>{row.itemCode || strings.jobCard.noData}</span>
                                      ) : (
                                        <input
                                          type="text"
                                          value={row.itemCode}
                                          onChange={(event) => handleJobCardRepairChange(row.id, "itemCode", event.target.value)}
                                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                                        />
                                      )}
                                    </td>
                                    <td className="px-3 py-2">
                                      {showSpareParts ? (
                                        <span>{row.unitPrice || strings.jobCard.noData}</span>
                                      ) : (
                                        <input
                                          type="text"
                                          value={row.unitPrice}
                                          onChange={(event) => handleJobCardRepairChange(row.id, "unitPrice", event.target.value)}
                                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                                        />
                                      )}
                                    </td>
                                    <td className="px-3 py-2">
                                      {showSpareParts ? (
                                        <span>{row.totalPrice || strings.jobCard.noData}</span>
                                      ) : (
                                        <input
                                          type="text"
                                          value={row.totalPrice}
                                          onChange={(event) => handleJobCardRepairChange(row.id, "totalPrice", event.target.value)}
                                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                                        />
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                      {!showSpareParts && jobCardRepairs.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeJobCardRepairRow(row.id)}
                                          className="text-xs text-red-600 hover:text-red-800"
                                        >
                                          {strings.jobCard.remove}
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleJobCardPdf}
                            className="bg-black hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow"
                          >
                            {strings.jobCard.downloadButton}
                          </button>
                          <button
                            type="button"
                            onClick={resetJobCard}
                            className="border border-gray-300 hover-border-gray-500 text-gray-700 px-4 py-2.5 rounded-lg text-sm"
                          >
                            {strings.jobCard.resetButton}
                          </button>
                        </div>
                      </section>

                      <section className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-3">{strings.completeHelp}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="submit"
                            disabled={isProcessing}
                            className="bg-black hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition disabled:opacity-60"
                          >
                            {strings.saveJobCard}
                          </button>
                          <button
                            type="button"
                            onClick={handleCompleteProcess}
                            disabled={selectedRequest.status !== "pending" || isProcessing}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition disabled:opacity-50"
                          >
                            {strings.completeProcess}
                          </button>
                        </div>
                        {selectedRequest.status !== "pending" && (
                          <p className="text-xs text-gray-500 mt-2">{strings.approveDisabled}</p>
                        )}
                      </section>
                    </form>
                  </Card>

                  <Card title={strings.jobCardPreviewTitle}>
                    <JobCardPreview snapshot={selectedRequest ? jobCardSnapshots[selectedRequest.id] : null} strings={strings} />
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
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={handleRefreshHistory}
                disabled={isHistoryRefreshing}
                className="border border-gray-300 hover:border-gray-500 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {strings.refreshHistory}
              </button>
            </div>
            {history.length ? (
              <div className="space-y-4">
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
                      {history.map((record) => {
                        const isSelected = selectedHistoryId === record.id;
                        return (
                          <tr
                            key={record.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedHistoryId(record.id)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setSelectedHistoryId(record.id);
                              }
                            }}
                            className={`border-t transition cursor-pointer ${
                              isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                            }`}
                          >
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {selectedHistoryRecord && (
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <h3 className="text-sm font-semibold text-black mb-3">{strings.historyDetails}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Field label={strings.driver} value={selectedHistoryRecord.driver || "--"} />
                      <Field label={strings.vehicle} value={selectedHistoryRecord.vehicle || "--"} />
                      <Field label={strings.date} value={formatDate(selectedHistoryRecord.date)} />
                      <Field label={strings.mileage} value={selectedHistoryRecord.mileage || "--"} />
                      <Field label={strings.type} value={formatTypeLabel(selectedHistoryRecord.type)} />
                      <Field label={strings.workshop} value={selectedHistoryRecord.workshop || "--"} />
                      <Field label={strings.cost} value={selectedHistoryRecord.cost || "--"} />
                      <Field label={strings.nextDue} value={formatDate(selectedHistoryRecord.nextDueDate)} />
                      <Field
                        label={strings.historyResolvedAt}
                        value={formatDate(selectedHistoryRecord.resolvedAt, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      />
                      <Field label={strings.detailNotes} value={selectedHistoryRecord.notes || "--"} />
                    </div>
                  </div>
                )}
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

function JobCardInput({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
      />
    </div>
  );
}

function JobCardTextarea({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
      <textarea
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
      />
    </div>
  );
}

function JobCardPreview({ snapshot, strings }) {
  if (!snapshot) {
    return <p className="text-sm text-gray-500">{strings.jobCardPreviewEmpty}</p>;
  }

  const { info, repairs } = snapshot;
  const workshopInfo = [
    { label: strings.date, value: info.workshopDate },
    { label: strings.mileage, value: info.workshopMileage },
    { label: strings.type, value: info.workshopType },
    { label: strings.workshop, value: info.workshopName },
    { label: strings.cost, value: info.workshopCost },
    { label: strings.nextDue, value: info.workshopNextDueDate },
    { label: strings.detailNotes, value: info.workshopDetails },
  ];
  const infoGrid = [
    { label: strings.jobCard.jobNo, value: info.jobNo },
    { label: strings.jobCard.plateNo, value: info.plateNo },
    { label: strings.jobCard.driverName, value: info.driverName },
    { label: strings.jobCard.kms, value: info.kms },
    { label: strings.jobCard.vehicleType, value: info.vehicleType },
    { label: strings.jobCard.model, value: info.model },
    { label: strings.jobCard.dateIn, value: info.dateIn },
    { label: strings.jobCard.dateOut, value: info.dateOut },
    { label: strings.jobCard.workshopSection, value: info.project || "—" },
  ];

  const signatureFields = [
    { label: strings.jobCard.preparedBy, value: info.preparedBy },
    { label: strings.jobCard.approvedBy, value: info.approvedBy || strings.jobCard.fleetManagerTitle },
  ];

  const activeRepairs = repairs.filter((row) =>
    [row.service, row.repTag, row.qty, row.itemCode, row.unitPrice, row.totalPrice].some((value) => value && String(value).trim())
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-800">
        {infoGrid.map(({ label, value }) => (
          <div key={label} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
            <p className="text-xs uppercase text-gray-500 tracking-wide">{label}</p>
            <p className="font-semibold text-black mt-1">{value || strings.jobCard.noData}</p>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-black mb-2">{strings.workshopCard}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-800">
          {workshopInfo.map(({ label, value }) => (
            <div key={label} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
              <p className="text-xs uppercase text-gray-500 tracking-wide">{label}</p>
              <p className="font-semibold text-black mt-1">{value || strings.jobCard.noData}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-black mb-2">{strings.jobCard.workshopSection}</h4>
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">{strings.jobCard.repairService}</th>
                <th className="px-3 py-2 text-left">{strings.jobCard.repTag}</th>
                <th className="px-3 py-2 text-left">{strings.jobCard.qty}</th>
                <th className="px-3 py-2 text-left">{strings.jobCard.itemCode}</th>
                <th className="px-3 py-2 text-left">{strings.jobCard.unitPrice}</th>
                <th className="px-3 py-2 text-left">{strings.jobCard.totalPrice}</th>
              </tr>
            </thead>
            <tbody>
              {activeRepairs.length ? (
                activeRepairs.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-2">{row.service || strings.jobCard.noData}</td>
                    <td className="px-3 py-2">{row.repTag || strings.jobCard.noData}</td>
                    <td className="px-3 py-2">{row.qty || strings.jobCard.noData}</td>
                    <td className="px-3 py-2">{row.itemCode || strings.jobCard.noData}</td>
                    <td className="px-3 py-2">{row.unitPrice || strings.jobCard.noData}</td>
                    <td className="px-3 py-2">{row.totalPrice || strings.jobCard.noData}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-4 text-center text-gray-500" colSpan={6}>
                    {strings.jobCard.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signatureFields.map(({ label, value }) => (
          <div key={label} className="border border-gray-200 rounded-xl p-4">
            <p className="text-xs uppercase text-gray-500 tracking-wide">{label}</p>
            <p className="font-semibold text-black mt-2">{value || strings.jobCard.noData}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
