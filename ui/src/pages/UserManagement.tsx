import React, { useState } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

const UserManagement = () => {
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerRole, setRegisterRole] = useState("non-admin");
    const [resetEmail, setResetEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const response = await axios.post("http://localhost:8000/users", {
                email: registerEmail,
                password: registerPassword,
                role: registerRole,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
            });

            if (response.status === 200) {
                setSuccess(`User ${registerEmail} created successfully.`);
                setRegisterEmail("");
                setRegisterPassword("");
                setRegisterRole("non-admin");
                toast({
                    title: "Success",
                    description: `User ${registerEmail} created successfully.`,
                });
            }
        } catch (error) {
            setError(
                error.response?.data?.detail || "Failed to register user."
            );
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to register user.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const response = await axios.post("http://localhost:8000/admin/reset-password", {
                email: resetEmail,
                new_password: newPassword,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
            });

            if (response.status === 200) {
                setSuccess(`Password for ${resetEmail} reset successfully.`);
                setResetEmail("");
                setNewPassword("");
                toast({
                    title: "Success",
                    description: `Password for ${resetEmail} reset successfully.`,
                });
            }
        } catch (error) {
            setError(
                error.response?.data?.detail || "Failed to reset password."
            );
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to reset password.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center px-4">
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-lg">
                <img
                    src="/neova_solutions_logo.png"
                    alt="Neova Solutions Logo"
                    className="absolute top-4 left-4 w-24 h-auto"
                />
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">User Management</h2>
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded" role="alert">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mb-4 rounded" role="alert">
                            {success}
                        </div>
                    )}
                    {/* Register New User */}
                    <form className="space-y-5 mb-8" onSubmit={handleRegister}>
                        <h3 className="text-lg font-semibold text-gray-700">Register New User</h3>
                        <div>
                            <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                id="registerEmail"
                                type="email"
                                placeholder="Enter user email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                id="registerPassword"
                                type="password"
                                placeholder="Enter user password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="registerRole" className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                id="registerRole"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                                value={registerRole}
                                onChange={(e) => setRegisterRole(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="non-admin">Non-Admin</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className={`w-full bg-indigo-600 text-white font-semibold py-2 text-base rounded-md shadow-lg transition duration-300 ${
                                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
                            }`}
                            disabled={isLoading}
                        >
                            {isLoading ? "Registering..." : "Register User"}
                        </button>
                    </form>
                    {/* Reset Password */}
                    <form className="space-y-5" onSubmit={handleResetPassword}>
                        <h3 className="text-lg font-semibold text-gray-700">Reset User Password</h3>
                        <div>
                            <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                User Email
                            </label>
                            <input
                                id="resetEmail"
                                type="email"
                                placeholder="Enter user email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full bg-indigo-600 text-white font-semibold py-2 text-base rounded-md shadow-lg transition duration-300 ${
                                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
                            }`}
                            disabled={isLoading}
                        >
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;