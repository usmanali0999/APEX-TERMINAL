"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/application/store/authStore";

export default function SignupPage() {
  const router = useRouter();
  const signup = useAuthStore((s) => s.signup);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signup(name, email, password);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Signup failed");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-cyan-400 font-bold tracking-wider font-mono text-2xl">
            APEXPULSE TERMINAL
          </div>
          <div className="text-xs text-gray-500 font-mono mt-2">
            Create Your Account
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-950 border border-gray-900 rounded-xl p-6 space-y-4"
        >
          <div className="text-sm text-gray-400 font-mono mb-4">Sign Up</div>

          <div>
            <label className="block text-xs text-gray-500 font-mono mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-mono mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-mono mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-900/20 border border-red-900 rounded-lg p-2 font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 rounded-lg text-sm transition-all disabled:opacity-40 font-mono"
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>

          <div className="text-xs text-gray-500 text-center font-mono">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}