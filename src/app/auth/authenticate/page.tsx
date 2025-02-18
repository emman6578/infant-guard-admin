"use client";

import { useAuth } from "@/context/AuthContextProvider";
import { authenticate } from "@/libraries/API/Auth/auth";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const Authenticate = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [code, setCode] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { updateAuthToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email) {
      setError("Email is required.");
      setLoading(false);
      return;
    }

    try {
      const res = await authenticate({ email, emailToken: code });
      updateAuthToken(res.authToken);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-700">
          Authentication Page
        </h2>
        <p className="text-center mt-4">Email: {email}</p>

        <form className="mt-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-600">Code</label>
            <input
              type="text"
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter code from email"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-center mt-2">{error}</p>}

          <button
            type="submit"
            className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Authenticate;
