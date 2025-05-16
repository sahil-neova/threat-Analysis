import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/login", {
        email,
        password,
      });

      if (response.status === 200) {
        const { access_token, user_id, role } = response.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("user_id", user_id);
        localStorage.setItem("user_role", role);
        navigate("/dashboard");
        toast({
          title: "Success",
          description: "Logged in successfully.",
        });
      }
    } catch (error) {
      console.error("Login error:", error.response || error);
      const errorMessage =
          error.response?.data?.detail || "Login failed. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-xl">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/neova_solutions_logo.png"
            alt="Neova Solutions Logo"
            className="w-auto h-auto mb-3 drop-shadow-md"
          />
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-teal-400 dark:from-blue-400 dark:via-cyan-400 dark:to-green-300 text-center leading-snug">
            Welcome to neoThreatAgent
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-700 dark:text-gray-300 text-center max-w-sm">
            An{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              AI-Powered
            </span>{" "}
            Cloud Threat Analysis Solution
          </p>
        </div>
        <p className="text-slate-700 text-xs sm:text-sm text-center mt-4 font-extrabold">
          Login to begin using neoThreatAgent
        </p>{" "}
        {/* Adjusted mt-6 for more space */}
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded"
            role="alert"
          >
            {error}
          </div>
        )}
        <form className="space-y-5 " onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-gray-700 dark:text-gray-300 mb-1 font-extrabold"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-indigo-600 text-white font-semibold py-2 text-base rounded-md shadow-lg transition duration-300 ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-indigo-700"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              Sign up
            </Link>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Forgot Password?{" "}
            <Link
              to="/reset-password"
              className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              Click Here to reset your password
            </Link>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Interested in using our service?{" "}
            <Link
              to="/contact_admin"
              className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              Contact Us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;