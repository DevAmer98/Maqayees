"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");
  const router = useRouter();

  const t = {
    en: {
      welcome: "Welcome Back",
      subtitle: "Sign in to your account",
      email: "Email",
      password: "Password",
      remember: "Remember me",
      forgot: "Forgot password?",
      signIn: "Sign In",
      signingIn: "Signing in...",
      rights: "All rights reserved.",
      error: "Invalid email or password",
    },
    ar: {
      welcome: "مرحباً بعودتك",
      subtitle: "سجل الدخول إلى حسابك",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      remember: "تذكرني",
      forgot: "هل نسيت كلمة المرور؟",
      signIn: "تسجيل الدخول",
      signingIn: "جارٍ تسجيل الدخول...",
      rights: "جميع الحقوق محفوظة.",
      error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    },
    ur: {
      welcome: "خوش آمدید",
      subtitle: "اپنے اکاؤنٹ میں سائن ان کریں",
      email: "ای میل",
      password: "پاس ورڈ",
      remember: "مجھے یاد رکھیں",
      forgot: "پاس ورڈ بھول گئے؟",
      signIn: "سائن ان کریں",
      signingIn: "سائن ان کیا جا رہا ہے...",
      rights: "تمام حقوق محفوظ ہیں۔",
      error: "ای میل یا پاس ورڈ غلط ہے",
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res.error) {
      setError(t[lang].error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        lang !== "en" ? "direction-rtl" : ""
      }`}
      dir={lang === "en" ? "ltr" : "rtl"}
      style={{
        background:
          "linear-gradient(135deg, #050505 0%, #111111 50%, #0a0a0a 100%)",
      }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.25)] p-8 border border-black/10 relative">
        {/* Language Switcher */}
        <div className="absolute top-5 right-5">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-black text-white font-medium rounded-full px-4 py-1.5 text-sm shadow-lg cursor-pointer hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-white/60 transition-all"
          >
            <option value="en" className="text-gray-900">
              English
            </option>
            <option value="ar" className="text-gray-900">
              العربية
            </option>
            <option value="ur" className="text-gray-900">
              اردو
            </option>
          </select>
        </div>


        {/* Logo / Branding */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.svg"
            alt="Maqayees Logo"
            className="w-16 h-16 mb-2"
            onError={(e) => (e.target.style.display = "none")}
          />
          <h1 className="text-3xl font-bold text-black mb-1 tracking-tight">
            {t[lang].welcome}
          </h1>
          <p className="text-gray-700 text-sm">{t[lang].subtitle}</p>
        </div>

        {/* Error Message */}
        {error && (
          <p className="bg-red-100 border border-red-400 text-red-700 text-sm p-2 rounded-lg mb-4 text-center font-medium shadow-sm">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t[lang].email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                lang === "ar"
                  ? "أدخل بريدك الإلكتروني"
                  : lang === "ur"
                  ? "اپنا ای میل درج کریں"
                  : "you@example.com"
              }
              className="w-full border border-gray-400 focus:ring-2 focus:ring-black focus:border-black/70 rounded-xl px-3 py-2.5 text-sm outline-none bg-white text-gray-900 transition placeholder-gray-500 hover:border-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t[lang].password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                lang === "ar"
                  ? "أدخل كلمة المرور"
                  : lang === "ur"
                  ? "اپنا پاس ورڈ درج کریں"
                  : "••••••••"
              }
              className="w-full border border-gray-400 focus:ring-2 focus:ring-black focus:border-black/70 rounded-xl px-3 py-2.5 text-sm outline-none bg-white text-gray-900 transition placeholder-gray-500 hover:border-black"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-black border-gray-400 rounded focus:ring-black"
              />
              <span>{t[lang].remember}</span>
            </label>
            <a
              href="#"
              className="text-black hover:text-gray-800 font-medium hover:underline transition"
            >
              {t[lang].forgot}
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-black hover:bg-gray-900 text-white font-semibold py-2.5 rounded-xl text-sm shadow-lg transition-transform ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02]"
            }`}
          >
            {loading ? t[lang].signingIn : t[lang].signIn}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-black">Maqayees</span>.{" "}
          {t[lang].rights}
        </p>
      </div>
    </div>
  );
}
