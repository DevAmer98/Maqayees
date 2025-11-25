"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AddMaintenancePage() {
  const { id } = useParams();

  const [lang, setLang] = useState("en");
  const [formData, setFormData] = useState({
    date: "",
    mileage: "",
    type: "",
    workshop: "",
    details: "",
    cost: "",
    nextDueDate: "",
    attachments: [],
  });

  const [mileagePhoto, setMileagePhoto] = useState(null);
  const [spareParts, setSpareParts] = useState([
    { name: "", quantity: "", cost: "", invoice: null },
  ]);

  const maintenanceTypes = ["PPM", "Repair", "Oil Change"];

  // Translations
  const t = {
    en: {
      title: "Add Maintenance Record",
      subtitle: "Record maintenance details for this vehicle",
      back: "Back to Driver Panel",
      date: "Maintenance Date",
      mileage: "Mileage (km)",
      type: "Maintenance Type",
      workshop: "Workshop / Technician",
      cost: "Cost (SAR)",
      next: "Next Service Due",
      notes: "Notes / Details",
      save: "Save Record",
      ppmPhoto: "Odometer / Mileage Photo",
      spare: "Spare Parts Used",
      addPart: "+ Add Another Part",
      removePart: "Remove Part",
      upload: "Upload Receipt or Attachments",
      placeholderNotes: "Describe what was done or observed...",
    },
    ar: {
      title: "إضافة سجل صيانة",
      subtitle: "سجل تفاصيل الصيانة لهذه المركبة",
      back: "العودة إلى لوحة السائق",
      date: "تاريخ الصيانة",
      mileage: "عدد الكيلومترات",
      type: "نوع الصيانة",
      workshop: "الورشة / الفني",
      cost: "التكلفة (ريال سعودي)",
      next: "تاريخ الخدمة القادمة",
      notes: "ملاحظات / تفاصيل",
      save: "حفظ السجل",
      ppmPhoto: "صورة العداد / الأميال",
      spare: "قطع الغيار المستخدمة",
      addPart: "+ إضافة قطعة أخرى",
      removePart: "إزالة القطعة",
      upload: "تحميل المرفقات أو الفواتير",
      placeholderNotes: "أدخل تفاصيل أو ملاحظات حول الصيانة...",
    },
    ur: {
      title: "مینٹیننس ریکارڈ شامل کریں",
      subtitle: "گاڑی کی مینٹیننس کی تفصیلات درج کریں",
      back: "ڈرائیور پینل پر واپس جائیں",
      date: "مینٹیننس کی تاریخ",
      mileage: "کلومیٹر (km)",
      type: "مینٹیننس کی قسم",
      workshop: "ورکشاپ / ٹیکنیشن",
      cost: "لاگت (SAR)",
      next: "اگلی سروس کی تاریخ",
      notes: "نوٹس / تفصیل",
      save: "ریکارڈ محفوظ کریں",
      ppmPhoto: "اوڈومیٹر / مائلیج کی تصویر",
      spare: "استعمال شدہ اسپیئر پارٹس",
      addPart: "+ ایک اور پارٹ شامل کریں",
      removePart: "پارٹ ہٹائیں",
      upload: "رسید یا اٹیچمنٹس اپ لوڈ کریں",
      placeholderNotes: "کیا کام کیا گیا یا مشاہدہ کیا گیا درج کریں...",
    },
  };

  const isRTL = lang === "ar" || lang === "ur";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMileagePhoto = (e) => setMileagePhoto(e.target.files[0]);

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, attachments: files }));
  };

  const handlePartChange = (index, field, value) => {
    const updated = [...spareParts];
    updated[index][field] = value;
    setSpareParts(updated);
  };

  const addSparePart = () =>
    setSpareParts((prev) => [...prev, { name: "", quantity: "", cost: "" }]);

  const removeSparePart = (index) =>
    setSpareParts(spareParts.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Maintenance record submitted:", formData, mileagePhoto);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex flex-col ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gradient-to-r from-black via-gray-950 to-gray-900 text-white py-4 px-4 sm:px-6 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t[lang].title}
          </h1>
          <p className="text-sm opacity-90">{t[lang].subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-full bg-white/10 text-white border border-white/30 text-sm py-1.5 px-4 backdrop-blur-md hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="en">🇬🇧 English</option>
            <option value="ar">🇸🇦 العربية</option>
            <option value="ur">🇵🇰 اردو</option>
          </select>

          <Link
            href="/dashboard?tab=vehicle"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition shadow-sm border border-black/10"
          >
            <span className="text-lg">←</span> {t[lang].back}
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 flex justify-center items-start sm:items-center p-4 sm:p-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white w-full max-w-2xl p-6 sm:p-8 rounded-3xl shadow-xl border border-black/10"
        >
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {t[lang].title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           
            <FormField label={t[lang].workshop} name="workshop" placeholder="e.g. Al-Futtaim Service Center" formData={formData} handleChange={handleChange} />
            <FormField label={t[lang].cost} name="cost" type="number" placeholder="e.g. 450" formData={formData} handleChange={handleChange} />
            <FormField label={t[lang].next} name="nextDueDate" type="date" formData={formData} handleChange={handleChange} />

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                {t[lang].notes}
              </label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows="4"
                placeholder={t[lang].placeholderNotes}
                className="input-style resize-none"
              ></textarea>
            </div>
          </div>

          {/* PPM: Mileage photo */}
          {formData.type === "PPM" && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                {t[lang].ppmPhoto}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleMileagePhoto}
                className="input-style cursor-pointer"
              />
              {mileagePhoto && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(mileagePhoto)}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* Repair or Oil Change */}
          {(formData.type === "Repair" || formData.type === "Oil Change") && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-3 text-base">
                {t[lang].upload}
              </h3>

              {/* Spare Parts for Repair */}
              {formData.type === "Repair" && (
                <>
                  {spareParts.map((part, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 bg-gray-50 rounded-xl p-4 mb-3 shadow-sm hover:shadow-md transition"
                    >
                      <input
                        type="text"
                        placeholder="Part name"
                        value={part.name}
                        onChange={(e) =>
                          handlePartChange(index, "name", e.target.value)
                        }
                        className="input-style mb-2"
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={part.quantity}
                        onChange={(e) =>
                          handlePartChange(index, "quantity", e.target.value)
                        }
                        className="input-style mb-2"
                      />
                      <input
                        type="number"
                        placeholder="Cost (SAR)"
                        value={part.cost}
                        onChange={(e) =>
                          handlePartChange(index, "cost", e.target.value)
                        }
                        className="input-style mb-2"
                      />

                      <label className="text-sm text-gray-600 block mb-1 font-medium">
                        Upload Invoice / Attachment
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          handlePartChange(index, "invoice", e.target.files[0])
                        }
                        className="input-style cursor-pointer"
                      />
                      {part.invoice && (
                        <p className="text-sm text-gray-500 mt-1">
                          File: <strong>{part.invoice.name}</strong>
                        </p>
                  )}

                  {spareParts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSparePart(index)}
                      className="text-red-600 text-sm mt-2 hover:underline"
                    >
                      {t[lang].removePart}
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSparePart}
                className="text-black text-sm font-semibold hover:underline"
              >
                {t[lang].addPart}
              </button>
            </>
          )}

              {/* File upload for Oil Change */}
              {formData.type === "Oil Change" && (
                <div className="border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 rounded-xl p-6 flex flex-col items-center text-center transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleAttachmentUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center text-black hover:text-gray-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-10 h-10 mb-2 opacity-80"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    <span className="font-medium text-sm">
                      Click to upload or drag & drop files
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      (PNG, JPG, or PDF up to 5MB)
                    </span>
                  </label>

                  {formData.attachments.length > 0 && (
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      {formData.attachments.map((file, i) => (
                        <p key={i}>
                          📎 <strong>{file.name}</strong>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="mt-10">
            <button
              type="submit"
              className="w-full bg-black hover:bg-gray-900 text-white py-3 rounded-xl text-base font-semibold shadow-lg transition active:scale-[0.98]"
            >
              {t[lang].save}
            </button>
          </div>
        </form>
      </main>

      {/* Global Styles */}
      <style jsx global>{`
        .input-style {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.9rem;
          background-color: #ffffff;
          color: #0f172a;
          transition: all 0.25s ease;
        }
        .input-style:hover {
          background-color: #f5f5f5;
        }
        .input-style:focus {
          outline: none;
          border-color: #111827;
          background-color: #fff;
          box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.15);
        }
        .rtl {
          direction: rtl;
          text-align: right;
        }
        .ltr {
          direction: ltr;
          text-align: left;
        }
      `}</style>
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  placeholder,
  formData,
  handleChange,
  options,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">
        {label}
      </label>
      {type === "select" ? (
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="input-style"
        >
          <option value="">Select</option>
          {options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="input-style"
        />
      )}
    </div>
  );
}
