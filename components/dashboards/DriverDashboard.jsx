//app/dashboard/%28role%29/%28driver%29/page.jsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { upload } from "@vercel/blob/client";
import LogoutButton from "@/components/ui/LogoutButton";

const MAX_VEHICLE_PHOTOS = 4;
const SHIFT_UPLOAD_HANDLE_URL = "/api/uploads/shifts";

const generateClientShiftId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `shift-${crypto.randomUUID()}`;
  }
  return `shift-${Date.now()}`;
};

const sanitizeUploadName = (name) => {
  if (!name) return "upload";
  const sanitized = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return sanitized || "upload";
};

async function uploadShiftAsset({ file, shiftId, eventType, label }) {
  const safeName = sanitizeUploadName(file.name);
  const pathname = `driver-shifts/${shiftId}/${eventType}/${label}-${Date.now()}-${safeName}`;
  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: SHIFT_UPLOAD_HANDLE_URL,
    contentType: file.type || "application/octet-stream",
    clientPayload: JSON.stringify({ shiftId, eventType, label }),
  });

  return {
    originalName: file.name,
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
    contentType: blob.contentType,
  };
}

const WALKAROUND_ITEMS = {
  before: [
    {
      id: "before-1",
      number: 1,
      label: "Check Engine & Hyd. Oil level",
      secondary: "آئل اور ہائیڈرولک آئل کی سطح چیک کریں",
      icon: "🛢️",
    },
    {
      id: "before-2",
      number: 2,
      label: "Check Coolant level",
      secondary: "کولنٹ کی سطح چیک کریں",
      icon: "🥶",
    },
    {
      id: "before-3",
      number: 3,
      label: "Check AdBlue level",
      secondary: "ایڈ بلو کی سطح چیک کریں",
      icon: "💧",
    },
    {
      id: "before-4",
      number: 4,
      label: "Check for missing tanks caps",
      secondary: "ٹینک کے ڈھکن چیک کریں",
      icon: "🧰",
    },
    {
      id: "before-5",
      number: 5,
      label: "Check for any leak",
      secondary: "کسی بھی لیک کے لیے چیک کریں",
      icon: "⚠️",
    },
    {
      id: "before-6",
      number: 6,
      label: "Check all the lights",
      secondary: "تمام لائٹس چیک کریں",
      icon: "💡",
    },
    {
      id: "before-7",
      number: 7,
      label: "Check vehicle structure & suspension cracks & loose bolts",
      secondary: "گاڑی کی ساخت اور سسپنشن میں دراڑیں اور ڈھیلے بولٹ چیک کریں",
      icon: "🛠️",
    },
    {
      id: "before-8",
      number: 8,
      label: "Check for loose wiring",
      secondary: "ڈھیلی وائرنگ چیک کریں",
      icon: "🔌",
    },
    {
      id: "before-9",
      number: 9,
      label: "Check all the tires & bolts",
      secondary: "تمام ٹائروں اور بولٹ کو چیک کریں",
      icon: "🛞",
    },
  ],
  after: [
    {
      id: "after-10",
      number: 10,
      label: "Check the fuel level",
      secondary: "ایندھن کی سطح چیک کریں",
      icon: "⛽",
    },
    {
      id: "after-11",
      number: 11,
      label: "Check the dashboard warning lights",
      secondary: "ڈیش بورڈ وارننگ لائٹس چیک کریں",
      icon: "⚙️",
    },
    {
      id: "after-12",
      number: 12,
      label: "Check the mirror, wiper, and windshield glass",
      secondary: "شیشہ، وائپر اور ونڈ اسکرین چیک کریں",
      icon: "🪞",
    },
    {
      id: "after-13",
      number: 13,
      label: "Check the seat belt function",
      secondary: "سیٹ بیلٹ کی فعالیت چیک کریں",
      icon: "🪢",
    },
    {
      id: "after-14",
      number: 14,
      label: "Check the horn",
      secondary: "ہارن چیک کریں",
      icon: "📣",
    },
    {
      id: "after-15",
      number: 15,
      label: "Check the air brake pressure",
      secondary: "ایئر بریک پریشر چیک کریں",
      icon: "🌀",
    },
    {
      id: "after-16",
      number: 16,
      label: "Test the brake performance",
      secondary: "بریک کی کارکردگی چیک کریں",
      icon: "🛑",
    },
    {
      id: "after-17",
      number: 17,
      label: "Test the steering performance",
      secondary: "اسٹیئرنگ کی کارکردگی چیک کریں",
      icon: "🛞",
    },
    {
      id: "after-18",
      number: 18,
      label: "Check for excessive exhaust smoke",
      secondary: "ایگزاسٹ کے دھوئیں کو چیک کریں",
      icon: "🌫️",
    },
    {
      id: "after-19",
      number: 19,
      label: "Check the availability of the first-aid kit & fire extinguisher",
      secondary: "فرسٹ ایڈ اور فائر بجھانے کا آلہ چیک کریں",
      icon: "🧯",
    },
  ],
};

const ALL_WALKAROUND_ITEMS = [...WALKAROUND_ITEMS.before, ...WALKAROUND_ITEMS.after];
const TOTAL_WALKAROUND_ITEMS = ALL_WALKAROUND_ITEMS.length;

const buildWalkaroundState = () => {
  const initial = {};
  ALL_WALKAROUND_ITEMS.forEach((item) => {
    initial[item.id] = false;
  });
  return initial;
};

const CHECKLIST_INFO_TEMPLATE = {
  driverId: "",
  driverName: "",
  plateNo: "",
  startDateTime: "",
  endDateTime: "",
  startKm: "",
  endKm: "",
  shift: "",
  preTripDefects: "",
  postTripDefects: "",
  dispatcher: "",
  driverSignature: "",
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

const formatChecklistDateTime = (value) => {
  if (!value) return "—";
  return value.replace("T", " ");
};

export default function DriverDashboard() {
  const [onShift, setOnShift] = useState(false);
  const [lang, setLang] = useState("en");
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [startMileage, setStartMileage] = useState("");
  const [startMileagePhoto, setStartMileagePhoto] = useState(null);
  const [startError, setStartError] = useState("");
  const [endMileage, setEndMileage] = useState("");
  const [endMileagePhoto, setEndMileagePhoto] = useState(null);
  const [endError, setEndError] = useState("");
  const [recordedStartMileage, setRecordedStartMileage] = useState(null);
  const [formData, setFormData] = useState({ date: "", mileage: "", type: "" });
  const [maintenanceMessage, setMaintenanceMessage] = useState(null);
  const [startVehiclePhotos, setStartVehiclePhotos] = useState([]);
  const [endVehiclePhotos, setEndVehiclePhotos] = useState([]);
  const [activeShiftId, setActiveShiftId] = useState(null);
  const [startSubmitting, setStartSubmitting] = useState(false);
  const [endSubmitting, setEndSubmitting] = useState(false);
  const [driver, setDriver] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [walkaroundChecks, setWalkaroundChecks] = useState(() => buildWalkaroundState());
  const [checklistInfo, setChecklistInfo] = useState(() => ({ ...CHECKLIST_INFO_TEMPLATE }));

  const defaultTab = "vehicle";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const isRTL = lang === "ar" || lang === "ur";

  const prepareUploadPayload = useCallback(async ({ shiftId, eventType, odometerPhoto, vehiclePhotos }) => {
    const odometerUpload = await uploadShiftAsset({
      file: odometerPhoto,
      shiftId,
      eventType,
      label: "odometer",
    });

    const vehicleUploads = await Promise.all(
      vehiclePhotos.map((file, index) =>
        uploadShiftAsset({
          file,
          shiftId,
          eventType,
          label: `vehicle-${index + 1}`,
        })
      )
    );

    return {
      odometerPhoto: odometerUpload,
      vehiclePhotos: vehicleUploads,
    };
  }, []);

  // 🌍 Translations
  const t = {
    en: {
      dashboard: "Driver Dashboard",
      profile: "Profile",
      vehicle: "Vehicle",
      maintenance: "Maintenance",
      logout: "Logout",
      driverPanel: "Driver Panel",
      system: "Maqayees System",
      profileInfo: "Profile Information",
      assignedVehicle: "Assigned Vehicle",
      checklistTitle: "Daily Vehicle Walkaround Checklist",
      checklistSubtitle: "Tick every inspection item before heading out.",
      checklistInfoHint: "Details provided here appear on the exported PDF.",
      inspectionItemLabel: "Inspection Item",
      statusLabel: "Status",
      beforeEngineStartLabel: "Before Engine Start",
      afterEngineStartLabel: "After Engine Start",
      driverIdLabel: "Driver ID",
      driverNameLabel: "Driver Name",
      plateNoLabel: "Plate No.",
      startDateLabel: "Start Date & Time",
      endDateLabel: "End Date & Time",
      startKmLabel: "Start KM",
      endKmLabel: "End KM",
      shiftLabel: "Shift",
      dayShift: "Day Shift",
      nightShift: "Night Shift",
      preTripDefects: "Pre-Trip Observed Defects",
      postTripDefects: "Post-Trip Observed Defects",
      dispatcherSignature: "Project Dispatcher",
      driverSignatureLabel: "Driver Signature",
      checklistProgress: "Checklist progress",
      completeChecklistMessage: "All checks completed. Download the PDF below.",
      incompleteChecklistMessage: "Complete every check to unlock the PDF.",
      downloadChecklist: "Download Checklist PDF",
      resetChecklist: "Reset Checklist",
      pdfWindowBlocked: "Pop-up blocked. Allow pop-ups to download the checklist.",
      maintenanceHistory: "Maintenance History",
      welcome: "Welcome",
      onDuty: "🟢 On Duty",
      offDuty: "⚪ Off Duty",
      recordMaintenance: "🧰 Record Maintenance",
      date: "Date",
      mileage: "Mileage",
      type: "Maintenance Type",
      selectType: "Select type",
      preventiveMaintenance: "PPM",
      inspection: "General Inspection",
      repair: "Repair",
      noRecords: "No maintenance records found.",
      maintenanceMissing: "Please select a date, mileage, and type before saving.",
      maintenanceSaved: "Maintenance record saved.",
      submit: "Save Record",
      kmUnit: "km",
      email: "Email",
      phone: "Phone",
      iqama: "Iqama",
      passport: "Passport",
      plate: "Plate",
      brand: "Brand",
      model: "Model",
      year: "Year",
      color: "Color",
      project: "Project",
      status: "Status",
      startShift: "Start Shift",
      cancel: "Cancel",
      startDuty: "Start Duty",
      mileagePrompt: "Enter starting mileage",
      uploadPhoto: "Upload odometer photo",
      missingFields: "Please provide mileage and a photo before starting.",
      startMileageRequired: "Please enter the starting mileage.",
      startPhotoRequired: "Please upload the starting odometer photo.",
      vehiclePhotos: "Vehicle Images",
      vehiclePhotoInstruction: "Upload 4 photos (add them one by one if easier) covering each angle before continuing.",
      vehiclePhotoRequired: "Please upload exactly 4 vehicle images.",
      endShift: "End Shift",
      endDuty: "End Duty",
      endMileagePrompt: "Enter ending mileage",
      endUploadPhoto: "Upload ending odometer photo",
      missingEndFields: "Please provide mileage and a photo before ending.",
      endMileageRequired: "Please enter the ending mileage.",
      endPhotoRequired: "Please upload the ending odometer photo.",
      endVehiclePhotoRequired: "Please upload exactly 4 vehicle images before ending.",
      endLowerThanStart: "Ending mileage cannot be lower than starting mileage.",
      noActiveShift: "Active shift not found. Please start a shift first.",
    },
    ar: {
      dashboard: "لوحة السائق",
      profile: "الملف الشخصي",
      vehicle: "المركبة",
      maintenance: "الصيانة",
      logout: "تسجيل الخروج",
      driverPanel: "لوحة السائق",
      system: "نظام مقاييس",
      profileInfo: "معلومات الملف الشخصي",
      assignedVehicle: "المركبة المخصصة",
      checklistTitle: "قائمة التفقد اليومي للمركبة",
      checklistSubtitle: "قم بتحديد كل عنصر فحص قبل التحرك.",
      checklistInfoHint: "سيتم إظهار هذه البيانات في ملف PDF المُصدَّر.",
      inspectionItemLabel: "عنصر الفحص",
      statusLabel: "الحالة",
      beforeEngineStartLabel: "قبل تشغيل المحرك",
      afterEngineStartLabel: "بعد تشغيل المحرك",
      driverIdLabel: "رقم السائق",
      driverNameLabel: "اسم السائق",
      plateNoLabel: "رقم اللوحة",
      startDateLabel: "تاريخ ووقت البداية",
      endDateLabel: "تاريخ ووقت النهاية",
      startKmLabel: "قراءة البداية",
      endKmLabel: "قراءة النهاية",
      shiftLabel: "الوردية",
      dayShift: "وردية نهارية",
      nightShift: "وردية ليلية",
      preTripDefects: "ملاحظات قبل الرحلة",
      postTripDefects: "ملاحظات بعد الرحلة",
      dispatcherSignature: "مشرف المشروع",
      driverSignatureLabel: "توقيع السائق",
      checklistProgress: "تقدم قائمة الفحص",
      completeChecklistMessage: "تم إكمال جميع الفحوصات. يمكنك تنزيل ملف PDF بالأسفل.",
      incompleteChecklistMessage: "أكمل جميع العناصر لعرض زر التنزيل.",
      downloadChecklist: "تنزيل قائمة الفحص PDF",
      resetChecklist: "إعادة ضبط القائمة",
      pdfWindowBlocked: "تم حظر النافذة المنبثقة. يرجى السماح بتنزيل PDF.",
      maintenanceHistory: "سجل الصيانة",
      welcome: "مرحبًا",
      onDuty: "🟢 في الخدمة",
      offDuty: "⚪ خارج الخدمة",
      recordMaintenance: "🧰 تسجيل الصيانة",
      date: "التاريخ",
      mileage: "قراءة العداد",
      type: "نوع الصيانة",
      selectType: "اختر النوع",
      preventiveMaintenance: "PPM",
      inspection: "فحص عام",
      repair: "إصلاح",
      noRecords: "لا توجد سجلات صيانة.",
      maintenanceMissing: "يرجى اختيار التاريخ والعداد والنوع قبل الحفظ.",
      maintenanceSaved: "تم حفظ سجل الصيانة.",
      submit: "حفظ السجل",
      kmUnit: "كم",
      email: "البريد الإلكتروني",
      phone: "رقم الجوال",
      iqama: "رقم الإقامة",
      passport: "رقم الجواز",
      plate: "اللوحة",
      brand: "العلامة التجارية",
      model: "الطراز",
      year: "السنة",
      color: "اللون",
      project: "المشروع",
      status: "الحالة",
      startShift: "بدء المناوبة",
      cancel: "إلغاء",
      startDuty: "بدء الخدمة",
      mileagePrompt: "أدخل قراءة العداد عند البدء",
      uploadPhoto: "ارفع صورة عداد الكيلومترات",
      missingFields: "يرجى إدخال قراءة العداد وتحميل الصورة قبل البدء.",
      startMileageRequired: "يرجى إدخال قراءة العداد عند البدء.",
      startPhotoRequired: "يرجى تحميل صورة عداد البداية.",
      vehiclePhotos: "صور المركبة",
      vehiclePhotoInstruction: "قم بتحميل 4 صور (يمكنك إضافتها واحدة تلو الأخرى) تغطي جميع جوانب المركبة قبل المتابعة.",
      vehiclePhotoRequired: "يرجى تحميل 4 صور للمركبة.",
      endShift: "إنهاء المناوبة",
      endDuty: "إنهاء الخدمة",
      endMileagePrompt: "أدخل قراءة العداد عند الانتهاء",
      endUploadPhoto: "ارفع صورة عداد الكيلومترات عند الانتهاء",
      missingEndFields: "يرجى إدخال قراءة العداد وتحميل الصورة قبل الإنهاء.",
      endMileageRequired: "يرجى إدخال قراءة العداد عند الانتهاء.",
      endPhotoRequired: "يرجى تحميل صورة عداد النهاية.",
      endVehiclePhotoRequired: "يرجى تحميل 4 صور للمركبة قبل الإنهاء.",
      endLowerThanStart: "لا يمكن أن تكون قراءة العداد النهائية أقل من قراءة البداية.",
      noActiveShift: "لم يتم العثور على مناوبة نشطة. يرجى بدء المناوبة أولاً.",
    },
    ur: {
      dashboard: "ڈرائیور ڈیش بورڈ",
      profile: "پروفائل",
      vehicle: "گاڑی",
      maintenance: "مینٹیننس",
      logout: "لاگ آؤٹ",
      driverPanel: "ڈرائیور پینل",
      system: "مقییس سسٹم",
      profileInfo: "پروفائل معلومات",
      assignedVehicle: "تفویض شدہ گاڑی",
      checklistTitle: "روزانہ گاڑی واک اراؤنڈ چیک لسٹ",
      checklistSubtitle: "روانگی سے پہلے ہر آئٹم پر نشان لگائیں۔",
      checklistInfoHint: "یہ معلومات PDF میں ظاہر ہو گی۔",
      inspectionItemLabel: "معائنہ آئٹم",
      statusLabel: "حالت",
      beforeEngineStartLabel: "انجن اسٹارٹ سے پہلے",
      afterEngineStartLabel: "انجن اسٹارٹ کے بعد",
      driverIdLabel: "ڈرائیور آئی ڈی",
      driverNameLabel: "ڈرائیور کا نام",
      plateNoLabel: "پلیٹ نمبر",
      startDateLabel: "شروع ہونے کی تاریخ اور وقت",
      endDateLabel: "اختتام کی تاریخ اور وقت",
      startKmLabel: "ابتدائی کلو میٹر",
      endKmLabel: "اختتامی کلو میٹر",
      shiftLabel: "شفٹ",
      dayShift: "دن کی شفٹ",
      nightShift: "رات کی شفٹ",
      preTripDefects: "سفر سے پہلے کی خرابیوں",
      postTripDefects: "سفر کے بعد کی خرابیوں",
      dispatcherSignature: "پروجیکٹ ڈسپیچر",
      driverSignatureLabel: "ڈرائیور دستخط",
      checklistProgress: "چیک لسٹ کی پیش رفت",
      completeChecklistMessage: "تمام چیک مکمل ہو گئے۔ نیچے PDF ڈاؤن لوڈ کریں۔",
      incompleteChecklistMessage: "PDF کے لیے تمام آئٹمز مکمل کریں۔",
      downloadChecklist: "چیک لسٹ PDF ڈاؤن لوڈ کریں",
      resetChecklist: "چیک لسٹ صاف کریں",
      pdfWindowBlocked: "پاپ اپ بلاک ہو گیا۔ براہ کرم PDF ڈاؤن لوڈ کرنے کی اجازت دیں۔",
      maintenanceHistory: "مینٹیننس کی ہسٹری",
      welcome: "خوش آمدید",
      onDuty: "🟢 ڈیوٹی پر",
      offDuty: "⚪ ڈیوٹی سے باہر",
      recordMaintenance: "🧰 مینٹیننس ریکارڈ کریں",
      date: "تاریخ",
      mileage: "مائلیج",
      type: "مینٹیننس کی قسم",
      selectType: "قسم منتخب کریں",
      preventiveMaintenance: "PPM",
      inspection: "جنرل انسپیکشن",
      repair: "مرمت",
      noRecords: "کوئی مینٹیننس ریکارڈ نہیں ملا۔",
      maintenanceMissing: "براہ کرم تاریخ، مائلیج اور قسم منتخب کریں۔",
      maintenanceSaved: "مینٹیننس ریکارڈ محفوظ ہو گیا ہے۔",
      submit: "ریکارڈ محفوظ کریں",
      kmUnit: "کلومیٹر",
      email: "ای میل",
      phone: "فون نمبر",
      iqama: "اقامہ نمبر",
      passport: "پاسپورٹ نمبر",
      plate: "پلیٹ نمبر",
      brand: "برانڈ",
      model: "ماڈل",
      year: "سال",
      color: "رنگ",
      project: "پروجیکٹ",
      status: "اسٹیٹس",
      startShift: "ڈیوٹی شروع کریں",
      cancel: "منسوخ کریں",
      startDuty: "ڈیوٹی پر جائیں",
      mileagePrompt: "ابتدائی مائلیج درج کریں",
      uploadPhoto: "اوڈومیٹر کی تصویر اپ لوڈ کریں",
      missingFields: "براہ کرم مائلیج اور تصویر فراہم کریں۔",
      startMileageRequired: "براہ کرم ابتدائی مائلیج درج کریں۔",
      startPhotoRequired: "براہ کرم ابتدائی اوڈومیٹر کی تصویر اپ لوڈ کریں۔",
      vehiclePhotos: "گاڑی کی تصاویر",
      vehiclePhotoInstruction: "آگے بڑھنے سے پہلے 4 تصاویر اپ لوڈ کریں (ضرورت ہو تو ایک ایک کر کے شامل کریں)۔",
      vehiclePhotoRequired: "براہ کرم گاڑی کی 4 تصاویر اپ لوڈ کریں۔",
      endShift: "ڈیوٹی ختم کریں",
      endDuty: "ڈیوٹی سے فارغ ہوں",
      endMileagePrompt: "اختتامی مائلیج درج کریں",
      endUploadPhoto: "اختتامی اوڈومیٹر تصویر اپ لوڈ کریں",
      missingEndFields: "براہ کرم اختتامی مائلیج اور تصویر فراہم کریں۔",
      endMileageRequired: "براہ کرم اختتامی مائلیج درج کریں۔",
      endPhotoRequired: "براہ کرم اختتامی اوڈومیٹر تصویر اپ لوڈ کریں۔",
      endVehiclePhotoRequired: "براہ کرم ڈیوٹی ختم کرنے سے پہلے گاڑی کی 4 تصاویر اپ لوڈ کریں۔",
      endLowerThanStart: "اختتامی مائلیج ابتدائی مائلیج سے کم نہیں ہو سکتی۔",
      noActiveShift: "فعال شفٹ نہیں ملی۔ براہ کرم پہلے شفٹ شروع کریں۔",
    },
  };

  const fetchDriverDashboard = useCallback(
    async (options = {}) => {
      const { silent = false } = options;
      if (!silent) setDashboardLoading(true);
      setDashboardError("");
      try {
        const response = await fetch("/api/driver/dashboard", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.error || "Failed to load driver dashboard.");
        }
        setDriver(payload.driver || null);
        setVehicle(payload.vehicle || null);
        setMaintenanceRecords(payload.maintenanceRecords || []);
        if (payload.activeShift) {
          setOnShift(true);
          setActiveShiftId(payload.activeShift.id || null);
          setRecordedStartMileage(
            typeof payload.activeShift.startMileage === "number" ? payload.activeShift.startMileage : null
          );
        } else {
          setOnShift(false);
          setActiveShiftId(null);
          setRecordedStartMileage(null);
        }
      } catch (error) {
        console.error("Failed to load driver dashboard", error);
        setDashboardError(error.message || "Failed to load driver dashboard.");
      } finally {
        if (!silent) setDashboardLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDriverDashboard();
  }, [fetchDriverDashboard]);

  useEffect(() => {
    if (!driver) return;
    setChecklistInfo((prev) => ({
      ...prev,
      driverId: prev.driverId || driver.id || "",
      driverName: prev.driverName || driver.name || "",
    }));
  }, [driver]);

  useEffect(() => {
    if (!vehicle) return;
    setChecklistInfo((prev) => ({
      ...prev,
      plateNo: prev.plateNo || vehicle.plateNumber || "",
    }));
  }, [vehicle]);

  const maintenanceTypes = useMemo(
    () => [
      { value: "preventive_maintenance", label: t[lang].preventiveMaintenance },
      { value: "repair", label: t[lang].repair },
    ],
    [lang]
  );

  const navItems = [
    { key: "vehicle", label: t[lang].vehicle, icon: "🚗" },
    { key: "maintenance", label: t[lang].maintenance, icon: "🧰" },
    { key: "profile", label: t[lang].profile, icon: "👤" },

  ];

  const completedChecklistItems = useMemo(() => Object.values(walkaroundChecks).filter(Boolean).length, [walkaroundChecks]);
  const checklistReadyForPdf = completedChecklistItems === TOTAL_WALKAROUND_ITEMS;

  const toggleShift = () => {
    if (dashboardLoading) return;
    if (!onShift) {
      setShowStartModal(true);
    } else {
      setShowEndModal(true);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChecklistInfoChange = (field, value) => {
    setChecklistInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleChecklistToggle = (itemId) => {
    setWalkaroundChecks((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const resetChecklist = () => {
    setWalkaroundChecks(buildWalkaroundState());
    setChecklistInfo({
      ...CHECKLIST_INFO_TEMPLATE,
      driverId: driver?.id || "",
      driverName: driver?.name || "",
      plateNo: vehicle?.plateNumber || "",
    });
  };

  const handleChecklistPdf = () => {
    if (!checklistReadyForPdf) return;
    if (typeof window === "undefined") return;

    const popup = window.open("", "driverChecklistWindow", "width=900,height=1200");
    if (!popup) {
      alert(t[lang].pdfWindowBlocked);
      return;
    }
    popup.opener = null;

    const shiftLabel =
      checklistInfo.shift === "day"
        ? t[lang].dayShift
        : checklistInfo.shift === "night"
        ? t[lang].nightShift
        : "—";

    const infoRows = [
      { label: t[lang].driverIdLabel, value: checklistInfo.driverId || "—" },
      { label: t[lang].driverNameLabel, value: checklistInfo.driverName || "—" },
      { label: t[lang].plateNoLabel, value: checklistInfo.plateNo || vehicle?.plateNumber || "—" },
      { label: t[lang].shiftLabel, value: shiftLabel },
      { label: t[lang].startDateLabel, value: formatChecklistDateTime(checklistInfo.startDateTime) },
      { label: t[lang].endDateLabel, value: formatChecklistDateTime(checklistInfo.endDateTime) },
      { label: t[lang].startKmLabel, value: checklistInfo.startKm || "—" },
      { label: t[lang].endKmLabel, value: checklistInfo.endKm || "—" },
    ];

    const infoTableRows = infoRows
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.label)}</td>
            <td>${escapeHtml(row.value)}</td>
          </tr>
        `
      )
      .join("");

    const buildSection = (title, items) => `
      <h3>${escapeHtml(title)}</h3>
      <table class="items">
        <thead>
          <tr>
            <th>#</th>
            <th>${escapeHtml(t[lang].inspectionItemLabel)}</th>
            <th>${escapeHtml(t[lang].statusLabel)}</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
                <tr>
                  <td>${item.number}</td>
                  <td>
                    <div>${escapeHtml(item.label)}</div>
                    ${item.secondary ? `<div class="secondary">${escapeHtml(item.secondary)}</div>` : ""}
                  </td>
                  <td class="status">${walkaroundChecks[item.id] ? "☑" : "☐"}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;

    const preTrip = escapeHtml(checklistInfo.preTripDefects || "—");
    const postTrip = escapeHtml(checklistInfo.postTripDefects || "—");
    const dispatcher = escapeHtml(checklistInfo.dispatcher || "—");
    const driverSignature = escapeHtml(checklistInfo.driverSignature || "—");

    const generatedAt = escapeHtml(new Date().toLocaleString());

    popup.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(t[lang].checklistTitle)}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 32px; color: #111; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            h2 { font-size: 18px; margin: 24px 0 8px; }
            h3 { font-size: 16px; margin: 20px 0 8px; }
            table { width: 100%; border-collapse: collapse; }
            table.meta tr td:first-child { width: 35%; font-weight: 600; }
            table.meta td { border: 1px solid #e5e7eb; padding: 6px 10px; font-size: 13px; }
            table.items th { text-align: left; background: #f3f4f6; font-size: 12px; }
            table.items th, table.items td { border: 1px solid #e5e7eb; padding: 6px 8px; }
            table.items td.status { text-align: center; font-size: 18px; }
            table.items td div.secondary { font-size: 11px; color: #6b7280; margin-top: 4px; }
            .notes { display: grid; grid-template-columns: repeat(auto-fit,minmax(240px,1fr)); gap: 16px; margin-top: 24px; }
            .note { border: 1px solid #e5e7eb; padding: 12px; min-height: 120px; }
            .signatures { display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap: 16px; margin-top: 24px; }
            .signature { border-top: 1px solid #111; padding-top: 8px; font-size: 13px; }
            .footer { margin-top: 32px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(t[lang].checklistTitle)}</h1>
          <p>${escapeHtml(t[lang].checklistSubtitle)}</p>
          <table class="meta">${infoTableRows}</table>
          ${buildSection(t[lang].beforeEngineStartLabel, WALKAROUND_ITEMS.before)}
          ${buildSection(t[lang].afterEngineStartLabel, WALKAROUND_ITEMS.after)}
          <div class="notes">
            <div class="note">
              <strong>${escapeHtml(t[lang].preTripDefects)}</strong>
              <p>${preTrip || "—"}</p>
            </div>
            <div class="note">
              <strong>${escapeHtml(t[lang].postTripDefects)}</strong>
              <p>${postTrip || "—"}</p>
            </div>
          </div>
          <div class="signatures">
            <div class="signature">
              ${escapeHtml(t[lang].dispatcherSignature)}<br/>
              ${dispatcher}
            </div>
            <div class="signature">
              ${escapeHtml(t[lang].driverSignatureLabel)}<br/>
              ${driverSignature}
            </div>
          </div>
          <p class="footer">Generated: ${generatedAt}</p>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const handleMaintenanceSubmit = (event) => {
    event.preventDefault();
    const { date, mileage, type } = formData;
    if (!date || !mileage || !type) {
      setMaintenanceMessage({ type: "error", text: t[lang].maintenanceMissing });
      return;
    }

    const mileageValue = Number(mileage);
    if (Number.isNaN(mileageValue) || mileageValue < 0) {
      setMaintenanceMessage({ type: "error", text: t[lang].maintenanceMissing });
      return;
    }

    const locale = lang === "ar" ? "ar-SA" : lang === "ur" ? "ur-PK" : "en-US";
    const formattedMileage = `${new Intl.NumberFormat(locale).format(mileageValue)} ${t[lang].kmUnit}`;
    const typeOption = maintenanceTypes.find((option) => option.value === type);

    setMaintenanceRecords((prev) => [
      {
        id: `mnt-${Date.now()}`,
        date,
        typeKey: type,
        typeLabel: typeOption?.label,
        mileage: formattedMileage,
        cost: "N/A",
        workshop: "N/A",
      },
      ...prev,
    ]);

    setFormData({ date: "", mileage: "", type: "" });
    setMaintenanceMessage({ type: "success", text: t[lang].maintenanceSaved });
  };

  const startVehiclePhotoPreviews = useMemo(() => {
    if (!startVehiclePhotos.length) return [];
    return startVehiclePhotos.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
  }, [startVehiclePhotos]);

  const endVehiclePhotoPreviews = useMemo(() => {
    if (!endVehiclePhotos.length) return [];
    return endVehiclePhotos.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
  }, [endVehiclePhotos]);

  useEffect(() => {
    return () => {
      startVehiclePhotoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [startVehiclePhotoPreviews]);

  useEffect(() => {
    return () => {
      endVehiclePhotoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [endVehiclePhotoPreviews]);

  const handleVehiclePhotoAdd = (type, fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (type === "start") {
      setStartVehiclePhotos((prev) => {
        const remaining = MAX_VEHICLE_PHOTOS - prev.length;
        if (remaining <= 0) return prev;
        return [...prev, ...files.slice(0, remaining)];
      });
    } else {
      setEndVehiclePhotos((prev) => {
        const remaining = MAX_VEHICLE_PHOTOS - prev.length;
        if (remaining <= 0) return prev;
        return [...prev, ...files.slice(0, remaining)];
      });
    }
  };

  const handleVehiclePhotoRemove = (type, index) => {
    if (type === "start") {
      setStartVehiclePhotos((prev) => prev.filter((_, idx) => idx !== index));
    } else {
      setEndVehiclePhotos((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const handleStartShift = async () => {
    if (startSubmitting) return;
    if (!driver || !vehicle) {
      setStartError("Driver or vehicle information is unavailable. Please refresh.");
      return;
    }
    if (!startMileage) {
      setStartError(t[lang].startMileageRequired);
      return;
    }
    if (!startMileagePhoto) {
      setStartError(t[lang].startPhotoRequired);
      return;
    }
    if (startVehiclePhotos.length !== MAX_VEHICLE_PHOTOS) {
      setStartError(t[lang].vehiclePhotoRequired);
      return;
    }
    const parsedStart = Number(startMileage);
    if (Number.isNaN(parsedStart) || parsedStart < 0) {
      setStartError(t[lang].missingFields);
      return;
    }
    setStartError("");
    setStartSubmitting(true);

    try {
      const candidateShiftId = activeShiftId || generateClientShiftId();
      const uploads = await prepareUploadPayload({
        shiftId: candidateShiftId,
        eventType: "start",
        odometerPhoto: startMileagePhoto,
        vehiclePhotos: startVehiclePhotos,
      });

      const response = await fetch("/api/shifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shiftId: candidateShiftId,
          eventType: "start",
          mileage: parsedStart,
          recordedAt: new Date().toISOString(),
          driverId: driver?.id,
          driverName: driver?.name,
          driverEmail: driver?.email,
          driverPhone: driver?.phone,
          vehicleId: vehicle?.id,
          vehiclePlate: vehicle?.plateNumber,
          projectName: vehicle?.project,
          uploads,
        }),
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse shift start response", jsonError);
      }

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to save shift details.");
      }

      const shiftIdFromApi = payload.shift?.id || candidateShiftId;
      setActiveShiftId(shiftIdFromApi);

      setOnShift(true);
      setShowStartModal(false);
      setStartMileage("");
      setStartMileagePhoto(null);
      setStartVehiclePhotos([]);
      setRecordedStartMileage(parsedStart);
      setStartError("");
      fetchDriverDashboard({ silent: true });
    } catch (error) {
      console.error("Failed to start shift", error);
      setStartError(error.message || t[lang].missingFields);
    } finally {
      setStartSubmitting(false);
    }
  };

  const handleEndShift = async () => {
    if (endSubmitting) return;
    if (!driver || !vehicle) {
      setEndError("Driver or vehicle information is unavailable. Please refresh.");
      return;
    }
    if (!activeShiftId) {
      setEndError(t[lang].noActiveShift);
      return;
    }
    if (!endMileage) {
      setEndError(t[lang].endMileageRequired);
      return;
    }
    if (!endMileagePhoto) {
      setEndError(t[lang].endPhotoRequired);
      return;
    }
    if (endVehiclePhotos.length !== MAX_VEHICLE_PHOTOS) {
      setEndError(t[lang].endVehiclePhotoRequired);
      return;
    }
    const parsedEnd = Number(endMileage);
    if (Number.isNaN(parsedEnd) || parsedEnd < 0) {
      setEndError(t[lang].missingEndFields);
      return;
    }
    if (recordedStartMileage !== null && parsedEnd < recordedStartMileage) {
      setEndError(t[lang].endLowerThanStart);
      return;
    }
    setEndError("");
    setEndSubmitting(true);

    try {
      const uploads = await prepareUploadPayload({
        shiftId: activeShiftId,
        eventType: "end",
        odometerPhoto: endMileagePhoto,
        vehiclePhotos: endVehiclePhotos,
      });

      const response = await fetch("/api/shifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType: "end",
          shiftId: activeShiftId,
          mileage: parsedEnd,
          recordedAt: new Date().toISOString(),
          startMileage: recordedStartMileage,
          driverId: driver?.id,
          driverName: driver?.name,
          driverEmail: driver?.email,
          driverPhone: driver?.phone,
          vehicleId: vehicle?.id,
          vehiclePlate: vehicle?.plateNumber,
          projectName: vehicle?.project,
          uploads,
        }),
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse shift end response", jsonError);
      }

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to close the shift.");
      }

      setActiveShiftId(null);
      setOnShift(false);
      setShowEndModal(false);
      setEndMileage("");
      setEndMileagePhoto(null);
      setEndVehiclePhotos([]);
      setRecordedStartMileage(null);
      setEndError("");
      fetchDriverDashboard({ silent: true });
    } catch (error) {
      console.error("Failed to end shift", error);
      setEndError(error.message || t[lang].missingEndFields);
    } finally {
      setEndSubmitting(false);
    }
  };

  const startPreviewUrl = useMemo(() => {
    if (!startMileagePhoto) return null;
    return URL.createObjectURL(startMileagePhoto);
  }, [startMileagePhoto]);

  const endPreviewUrl = useMemo(() => {
    if (!endMileagePhoto) return null;
    return URL.createObjectURL(endMileagePhoto);
  }, [endMileagePhoto]);

  useEffect(() => {
    return () => {
      if (startPreviewUrl) URL.revokeObjectURL(startPreviewUrl);
    };
  }, [startPreviewUrl]);

  useEffect(() => {
    return () => {
      if (endPreviewUrl) URL.revokeObjectURL(endPreviewUrl);
    };
  }, [endPreviewUrl]);

  useEffect(() => {
    setMaintenanceMessage(null);
  }, [lang]);

  const driverDisplayName = driver?.name || t[lang].driverPanel;

  return (
    <div
      className={`min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-black text-white flex-col p-6 shadow-2xl rounded-r-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gray-900 to-black flex items-center justify-center text-white font-bold text-xl shadow-lg border border-gray-700">
            D
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t[lang].driverPanel}</h2>
            <p className="text-sm text-gray-400">{t[lang].system}</p>
          </div>
        </div>

        {/* Language Selector */}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="mb-6 border border-gray-600 bg-black text-gray-200 rounded-lg text-sm py-1.5 px-2 focus:ring-2 focus:ring-gray-400"
        >
          <option value="en">🇬🇧 English</option>
          <option value="ar">🇸🇦 العربية</option>
          <option value="ur">🇵🇰 اردو</option>
        </select>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center w-full px-4 py-2.5 rounded-lg text-left font-medium transition-all duration-200 ${
                activeTab === item.key
                  ? "bg-white text-black shadow-inner"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <LogoutButton
          className="mt-auto bg-gray-800 hover:bg-gray-700 text-white py-2.5 px-4 rounded-lg font-semibold text-sm shadow-md transition disabled:opacity-70"
          pendingText={t[lang].logout}
        >
          {t[lang].logout}
        </LogoutButton>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black text-white z-20 flex justify-between items-center px-4 py-3 shadow-md">
        <h2 className="text-lg font-semibold">{t[lang].dashboard}</h2>
        <div className="flex gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="border border-white/40 bg-gray-800 text-white rounded-lg text-xs p-1 focus:outline-none"
          >
            <option value="en">EN</option>
            <option value="ar">AR</option>
            <option value="ur">UR</option>
          </select>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="border border-white/40 bg-gray-800 text-white rounded-lg text-xs p-1 focus:outline-none"
          >
            {navItems.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 mt-16 md:mt-0">
        {dashboardError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {dashboardError}
          </div>
        )}
        {dashboardLoading && (
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            Loading driver details...
          </div>
        )}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-black">
              {activeTab === "profile"
                ? t[lang].profile
                : activeTab === "vehicle"
                ? t[lang].assignedVehicle
                : t[lang].maintenance}
            </h1>
            <p className="text-gray-600 mt-1">
              {t[lang].welcome},{" "}
              <span className="font-semibold text-black">{driverDisplayName}</span>
            </p>
          </div>

          {/* Shift Toggle */}
          <div
            onClick={toggleShift}
            className={`mt-4 sm:mt-0 relative inline-flex items-center cursor-pointer select-none w-48 h-12 rounded-full transition-colors duration-300 shadow-inner ${
              onShift ? "bg-green-600" : "bg-gray-400"
            }`}
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`absolute w-10 h-10 bg-white rounded-full shadow-md top-1 ${
                onShift ? "left-[calc(100%-2.75rem)]" : "left-1"
              }`}
            />
            <div className="absolute inset-0 flex items-center justify-center font-semibold text-sm">
              <AnimatePresence mode="wait">
                {onShift ? (
                  <motion.span key="on" className="text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {t[lang].onDuty}
                  </motion.span>
                ) : (
                  <motion.span key="off" className="text-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {t[lang].offDuty}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="space-y-6">
          {activeTab === "profile" && (
            <Card title={t[lang].profileInfo}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
                <Field label={t[lang].email} value={driver?.email || "—"} />
                <Field label={t[lang].phone} value={driver?.phone || "—"} />
                <Field label={t[lang].iqama} value={driver?.iqama || "—"} />
                <Field label={t[lang].passport} value={driver?.passport || "—"} />
              </div>
            </Card>
          )}

          {activeTab === "vehicle" && (
            <>
              <Card title={t[lang].assignedVehicle}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
                  <Field label={t[lang].plate} value={vehicle?.plateNumber || "—"} />
                  <Field label={t[lang].brand} value={vehicle?.brand || "—"} />
                  <Field label={t[lang].model} value={vehicle?.model || "—"} />
                  <Field label={t[lang].year} value={vehicle?.year || "—"} />
                  <Field label={t[lang].color} value={vehicle?.color || "—"} />
                  <Field label={t[lang].project} value={vehicle?.project || "—"} />
                  <p>
                    <span className="font-medium">{t[lang].status}:</span>{" "}
                    <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                      {vehicle?.status || t[lang].offDuty}
                    </span>
                  </p>
                </div>
              </Card>

              {onShift && (
                <Card title={t[lang].checklistTitle}>
                  <p className="text-sm text-gray-600 mb-2">{t[lang].checklistSubtitle}</p>
                  <p className="text-xs text-gray-500 mb-4">{t[lang].checklistInfoHint}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                    <ChecklistInput
                      label={t[lang].driverIdLabel}
                      value={checklistInfo.driverId}
                      onChange={(value) => handleChecklistInfoChange("driverId", value)}
                    />
                    <ChecklistInput
                      label={t[lang].driverNameLabel}
                      value={checklistInfo.driverName}
                      onChange={(value) => handleChecklistInfoChange("driverName", value)}
                    />
                    <ChecklistInput
                      label={t[lang].plateNoLabel}
                      value={checklistInfo.plateNo}
                      onChange={(value) => handleChecklistInfoChange("plateNo", value)}
                    />
                    <ChecklistInput
                      label={t[lang].startKmLabel}
                      type="number"
                      value={checklistInfo.startKm}
                      onChange={(value) => handleChecklistInfoChange("startKm", value)}
                    />
                    <ChecklistInput
                      label={t[lang].endKmLabel}
                      type="number"
                      value={checklistInfo.endKm}
                      onChange={(value) => handleChecklistInfoChange("endKm", value)}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">{t[lang].shiftLabel}</label>
                      <div className="flex items-center gap-4 text-sm text-gray-700">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            className="h-4 w-4 text-black focus:ring-black"
                            checked={checklistInfo.shift === "day"}
                            onChange={() => handleChecklistInfoChange("shift", "day")}
                          />
                          {t[lang].dayShift}
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            className="h-4 w-4 text-black focus:ring-black"
                            checked={checklistInfo.shift === "night"}
                            onChange={() => handleChecklistInfoChange("shift", "night")}
                          />
                          {t[lang].nightShift}
                        </label>
                      </div>
                    </div>
                    <ChecklistInput
                      label={t[lang].startDateLabel}
                      type="datetime-local"
                      value={checklistInfo.startDateTime}
                      onChange={(value) => handleChecklistInfoChange("startDateTime", value)}
                    />
                    <ChecklistInput
                      label={t[lang].endDateLabel}
                      type="datetime-local"
                      value={checklistInfo.endDateTime}
                      onChange={(value) => handleChecklistInfoChange("endDateTime", value)}
                    />
                  </div>

                  <ChecklistSection
                    title={t[lang].beforeEngineStartLabel}
                    items={WALKAROUND_ITEMS.before}
                    checks={walkaroundChecks}
                    onToggle={handleChecklistToggle}
                  />
                  <ChecklistSection
                    title={t[lang].afterEngineStartLabel}
                    items={WALKAROUND_ITEMS.after}
                    checks={walkaroundChecks}
                    onToggle={handleChecklistToggle}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <ChecklistTextarea
                      label={t[lang].preTripDefects}
                      value={checklistInfo.preTripDefects}
                      onChange={(value) => handleChecklistInfoChange("preTripDefects", value)}
                    />
                    <ChecklistTextarea
                      label={t[lang].postTripDefects}
                      value={checklistInfo.postTripDefects}
                      onChange={(value) => handleChecklistInfoChange("postTripDefects", value)}
                    />
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-700">
                      {t[lang].checklistProgress}: {completedChecklistItems}/{TOTAL_WALKAROUND_ITEMS}
                    </p>
                    <p className={`text-sm ${checklistReadyForPdf ? "text-green-600" : "text-gray-500"}`}>
                      {checklistReadyForPdf ? t[lang].completeChecklistMessage : t[lang].incompleteChecklistMessage}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {checklistReadyForPdf && (
                      <button
                        onClick={handleChecklistPdf}
                        className="bg-black hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow"
                      >
                        {t[lang].downloadChecklist}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={resetChecklist}
                      className="border border-gray-300 hover:border-gray-500 text-gray-700 px-4 py-2.5 rounded-lg text-sm"
                    >
                      {t[lang].resetChecklist}
                    </button>
                  </div>
                </Card>
              )}
            </>
          )}

          {activeTab === "maintenance" && (
            <>
              <Card title={t[lang].recordMaintenance}>
                <form onSubmit={handleMaintenanceSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <FormField
                    label={t[lang].date}
                    name="date"
                    type="date"
                    formData={formData}
                    handleChange={handleChange}
                  />
                  <FormField
                    label={t[lang].mileage}
                    name="mileage"
                    type="number"
                    placeholder="e.g. 52,300"
                    formData={formData}
                    handleChange={handleChange}
                  />
                  <FormField
                    label={t[lang].type}
                    name="type"
                    type="select"
                    options={maintenanceTypes}
                    placeholder={t[lang].selectType}
                    formData={formData}
                    handleChange={handleChange}
                  />
                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="bg-black hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition"
                    >
                      {t[lang].submit}
                    </button>
                  </div>
                </form>
                {maintenanceMessage && (
                  <p className={`mb-4 text-sm ${maintenanceMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    {maintenanceMessage.text}
                  </p>
                )}
                <h3 className="text-base font-semibold text-black mb-3">{t[lang].maintenanceHistory}</h3>
                {maintenanceRecords.length ? (
                  <table className="w-full text-sm text-left text-gray-800 border border-gray-300 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-gray-800">
                      <tr>
                        <th className="py-3 px-4 font-medium">Date</th>
                        <th className="py-3 px-4 font-medium">Type</th>
                        <th className="py-3 px-4 font-medium">Mileage</th>
                        <th className="py-3 px-4 font-medium">Workshop</th>
                        <th className="py-3 px-4 font-medium">Cost (SAR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceRecords.map((r) => (
                        <tr key={r.id} className="border-b hover:bg-gray-50 transition">
                          <td className="py-2.5 px-4">{r.date}</td>
                          <td className="py-2.5 px-4">
                            {r.typeLabel || maintenanceTypes.find((option) => option.value === r.typeKey)?.label || r.typeKey}
                          </td>
                          <td className="py-2.5 px-4">{r.mileage}</td>
                          <td className="py-2.5 px-4">{r.workshop}</td>
                          <td className="py-2.5 px-4">{r.cost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-sm">{t[lang].noRecords}</p>
                )}
              </Card>

            </>
          )}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {showStartModal && (
          <motion.div key="start-modal" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <motion.div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
              <button
                onClick={() => {
                  setShowStartModal(false);
                  setStartError("");
                  setStartMileage("");
                  setStartMileagePhoto(null);
                  setStartVehiclePhotos([]);
                }}
                className="absolute top-3 right-3 text-gray-500 text-xl"
              >
                ×
              </button>
              <h3 className="text-2xl font-semibold text-black mb-2 text-center">{t[lang].startShift}</h3>
              <p className="text-gray-600 text-sm mb-6 text-center">
                {t[lang].mileagePrompt} &nbsp;{t[lang].uploadPhoto}
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t[lang].mileagePrompt}</label>
                <input
                  type="number"
                  value={startMileage}
                  onChange={(e) => setStartMileage(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-black text-sm"
                  placeholder="e.g. 52300"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t[lang].uploadPhoto}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setStartMileagePhoto(e.target.files[0])}
                  className="w-full text-sm text-gray-700 border border-gray-300 rounded-xl bg-gray-50 file:bg-black file:text-white file:py-2 file:px-4 file:rounded-lg"
                />
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">{t[lang].vehiclePhotos}</label>
                  <span className="text-xs text-gray-500">
                    {startVehiclePhotos.length}/{MAX_VEHICLE_PHOTOS}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{t[lang].vehiclePhotoInstruction}</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    handleVehiclePhotoAdd("start", e.target.files);
                    e.target.value = "";
                  }}
                  className="w-full text-sm text-gray-700 border border-gray-300 rounded-xl bg-gray-50 file:bg-black file:text-white file:py-2 file:px-4 file:rounded-lg"
                />
              </div>
              {!!startVehiclePhotoPreviews.length && (
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {startVehiclePhotoPreviews.map((preview, index) => (
                    <div key={`${preview.url}-${index}`} className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <img src={preview.url} alt={preview.name} className="h-24 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleVehiclePhotoRemove("start", index)}
                        className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {startPreviewUrl && (
                <img src={startPreviewUrl} className="w-full h-40 object-cover rounded-lg border mt-3 mb-4" alt="Starting odometer preview" />
              )}
              {startError && <p className="text-red-600 text-sm mb-3 text-center">{startError}</p>}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowStartModal(false);
                    setStartError("");
                    setStartMileage("");
                    setStartMileagePhoto(null);
                    setStartVehiclePhotos([]);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                >
                  {t[lang].cancel}
                </button>
                <button
                  onClick={handleStartShift}
                  disabled={startSubmitting}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-white ${
                    startSubmitting ? "bg-gray-500 cursor-not-allowed" : "bg-black hover:bg-gray-900"
                  }`}
                >
                  {t[lang].startDuty}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showEndModal && (
          <motion.div key="end-modal" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <motion.div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <button
                onClick={() => {
                  setShowEndModal(false);
                  setEndError("");
                  setEndMileage("");
                  setEndMileagePhoto(null);
                  setEndVehiclePhotos([]);
                }}
                className="absolute top-3 right-3 text-xl text-gray-500"
              >
                ×
              </button>
              <h3 className="mb-2 text-center text-2xl font-semibold text-black">{t[lang].endShift}</h3>
              <p className="mb-6 text-center text-sm text-gray-600">
                {t[lang].endMileagePrompt} &nbsp;{t[lang].endUploadPhoto}
              </p>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t[lang].endMileagePrompt}</label>
                <input
                  type="number"
                  value={endMileage}
                  onChange={(e) => setEndMileage(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black"
                  placeholder="e.g. 52840"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t[lang].endUploadPhoto}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEndMileagePhoto(e.target.files[0])}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 text-sm text-gray-700 file:rounded-lg file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">{t[lang].vehiclePhotos}</label>
                  <span className="text-xs text-gray-500">
                    {endVehiclePhotos.length}/{MAX_VEHICLE_PHOTOS}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{t[lang].vehiclePhotoInstruction}</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    handleVehiclePhotoAdd("end", e.target.files);
                    e.target.value = "";
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 text-sm text-gray-700 file:rounded-lg file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
              </div>
              {!!endVehiclePhotoPreviews.length && (
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {endVehiclePhotoPreviews.map((preview, index) => (
                    <div key={`${preview.url}-${index}`} className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <img src={preview.url} alt={preview.name} className="h-24 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleVehiclePhotoRemove("end", index)}
                        className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {endPreviewUrl && (
                <img src={endPreviewUrl} className="mb-4 mt-3 h-40 w-full rounded-lg border object-cover" alt="Ending odometer preview" />
              )}
              {endError && <p className="mb-3 text-center text-sm text-red-600">{endError}</p>}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEndModal(false);
                    setEndError("");
                    setEndMileage("");
                    setEndMileagePhoto(null);
                    setEndVehiclePhotos([]);
                  }}
                  className="rounded-xl bg-gray-200 px-4 py-2.5 font-medium text-gray-800 hover:bg-gray-300"
                >
                  {t[lang].cancel}
                </button>
                <button
                  onClick={handleEndShift}
                  disabled={endSubmitting}
                  className={`rounded-xl px-4 py-2.5 font-semibold text-white ${
                    endSubmitting ? "bg-gray-500 cursor-not-allowed" : "bg-black hover:bg-gray-900"
                  }`}
                >
                  {t[lang].endDuty}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* UI Helpers */
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
    <p>
      <span className="font-medium text-black">{label}:</span> {value}
    </p>
  );
}

function FormField({ label, name, type = "text", placeholder, options = [], formData, handleChange }) {
  const value = formData[name] || "";

  if (type === "select") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
        <select
          value={value}
          onChange={(e) => handleChange(name, e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
        >
          <option value="">{placeholder}</option>
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
        onChange={(e) => handleChange(name, e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
      />
    </div>
  );
}

function ChecklistInput({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
      />
    </div>
  );
}

function ChecklistTextarea({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black"
      />
    </div>
  );
}

function ChecklistSection({ title, items, checks, onToggle }) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-black">{title}</h3>
        <span className="text-xs text-gray-500">{items.length} items</span>
      </div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 hover:border-gray-400 transition"
          >
            <input
              type="checkbox"
              checked={Boolean(checks[item.id])}
              onChange={() => onToggle(item.id)}
              className="mt-1 h-4 w-4 rounded border-gray-400 text-black focus:ring-black"
            />
            <div className="text-sm text-gray-800">
              <p className="font-medium text-black flex items-center gap-1">
                <span className="text-gray-500">{item.number}.</span>
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </p>
              {item.secondary && <p className="text-xs text-gray-600 mt-1">{item.secondary}</p>}
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
