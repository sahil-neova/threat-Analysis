import React, { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import axios from "axios";

const CreateUserPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const regex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError(
          "Password must be at least 8 characters, include one uppercase letter, one number, and one special character (!@#$%^&*)."
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/create_user", {
        email,
        password,
        role: userRole,
      });

      if (response.status === 200 || response.status === 201) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Signup failed:", error);
      setError(
          error.response?.data?.message ||
          "Signup failed. User may already exist or input is invalid."
      );
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-xl relative">
        {/* Beautiful Home Button - Top Center */}
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => {
              navigate("/dashboard");
            }}
            className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go Home
          </button>
        </div>

        <div className="flex flex-col items-center mb-8 mt-6">
          <img
              src="/neova_solutions_logo.png"
              alt="Neova Solutions Logo"
              className="w-33 h-33 mb-8 object-contain"
          />
          <h1 className="text-3xl mb-8 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-teal-400 dark:from-blue-400 dark:via-cyan-400 dark:to-green-300 text-center leading-snug">
          neoThreatAgent
          </h1>
          <p className="text-slate-800 font-bold text-sm sm:text-base text-center">
            Create New User
          </p>
        </div>
        {isSuccess ? (
          <div
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded"
            role="alert"
          >
            <p className="font-semibold">Signup successful!</p>
            <p>
              Please{" "}
              <Link
                to="/login"
                className="text-indigo-600 font-semibold underline hover:text-indigo-800"
              >
                log in
              </Link>{" "}
              with your new credentials.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded"
                role="alert"
              >
                {error}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSignup}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <span
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                  <li>Minimum 8 characters</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character (!@#$%^&*)</li>
                </ul>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="adminCheckbox"
                  checked={userRole === "admin"}
                  onChange={(e) =>
                    setUserRole(e.target.checked ? "admin" : "non-admin")
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="adminCheckbox"
                  className="text-sm text-slate-700 font-extrabold"
                >
                  Create User As Admin
                </label>
              </div>
              <button
                type="submit"
                className={`w-full bg-indigo-600 text-white font-semibold py-3 text-lg rounded-md shadow-lg transition duration-300 ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-indigo-700"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    Signing up...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateUserPage;
