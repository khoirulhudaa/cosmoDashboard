import authImg from "assets/img/auth/auth.jpg";
import Checkbox from "components/checkbox";
import InputField from "components/fields/InputField";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://vr.kiraproject.id/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Simpan token
        localStorage.setItem("token", data.data.token);

        // Simpan user profile
        localStorage.setItem("user", JSON.stringify(data.data.user));

        // Redirect ke dashboard
        navigate("/admin/default", { replace: true });
      } else {
        setError("Email atau password tidak sesuai.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid grid-cols-2 h-[100vh] overflow-hidden w-full items-center justify-center lg:items-center lg:justify-start">
      {/* Sign in section */}
      <div className="flex items-center justify-center py-10 overflow-hidden h-full px-14">
        <div className="relative h-full p-10 shadow-lg border border-black/30 rounded-lg w-full max-w-full flex-col items-center">
          <Link to="/" className="mt-0 w-max lg:pt-10">
            <div className="mx-auto flex h-fit mb-6 w-screen items-center hover:cursor-pointer">
              <svg
                width="8"
                height="12"
                viewBox="0 0 8 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.70994 2.11997L2.82994 5.99997L6.70994 9.87997C7.09994 10.27 7.09994 10.9 6.70994 11.29C6.31994 11.68 5.68994 11.68 5.29994 11.29L0.709941 6.69997C0.319941 6.30997 0.319941 5.67997 0.709941 5.28997L5.29994 0.699971C5.68994 0.309971 6.31994 0.309971 6.70994 0.699971C7.08994 1.08997 7.09994 1.72997 6.70994 2.11997V2.11997Z"
                  fill="#A3AED0"
                />
              </svg>
              <p className="ml-3 text-sm text-gray-600">
                Kembali ke halaman utama
              </p>
            </div>
          </Link>

          <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
            Masuk
          </h4>
          <p className="mb-9 ml-1 text-base text-gray-600">
            Masukkan email dan kata sandi untuk masuk!
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <InputField
              variant="auth"
              extra="mb-3"
              label="Email*"
              placeholder="mail@simmmple.com"
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password */}
            <InputField
              variant="auth"
              extra="mb-3"
              label="Password*"
              placeholder="Min. 8 characters"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Checkbox & Lupa Password */}
            <div className="mb-4 flex items-center justify-between px-2">
              <div className="flex items-center">
                <Checkbox
                  checked={rememberMe}
                  onChange={(e: any) => setRememberMe(e.target.checked)}
                />
                <p className="ml-2 text-sm font-medium text-navy-700 dark:text-white">
                  Ingat saya
                </p>
              </div>
              <a
                className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white cursor-pointer"
                onClick={(e) => e.preventDefault()}
              >
                Lupa kata sandi?
              </a>
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={loading}
              className={`linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Memproses..." : "Masuk sekarang"}
            </button>
          </form>
        </div>
      </div>

      {/* Background Image */}
      <div className="relative overflow-hidden h-full">
        <div
          className="relative flex brightness-50 h-full w-full items-end justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(${authImg})` }}
        />
      </div>
    </div>
  );
}