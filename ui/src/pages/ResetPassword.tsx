import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            toast({
                title: "Error",
                description: "Please enter a valid email address.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        if (currentPassword === newPassword) {
            setError("New password cannot be the same as the current password.");
            toast({
                title: "Error",
                description: "New password cannot be the same as the current password.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        if (!passwordRegex.test(newPassword)) {
            setError(
                "New password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character (!@#$%^&*)."
            );
            toast({
                title: "Error",
                description:
                    "New password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character (!@#$%^&*).",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            toast({
                title: "Error",
                description: "New password and confirm password do not match.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post("http://localhost:8000/reset-password", {
                email,
                current_password: currentPassword,
                new_password: newPassword,
            });

            if (response.status === 200) {
                setSuccess("Password reset successfully. Please log in with your new password.");
                setEmail("");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                toast({
                    title: "Success",
                    description: "Password reset successfully.",
                });
            }
        } catch (error) {
            let errorMessage = "Failed to reset password. Please try again.";
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    errorMessage = "User not found.";
                } else if (error.response?.status === 400) {
                    errorMessage = error.response.data.detail;
                } else if (error.response?.status === 500) {
                    errorMessage = "Server error. Please try again later.";
                }
            }
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

    const handleCancel = () => {
        setEmail("");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setSuccess("");
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center px-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <img
                        src="/neova_solutions_logo.png"
                        alt="Neova Solutions Logo"
                        className="w-auto h-auto mb-3 drop-shadow-md"
                    />
                </div>
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded" role="alert">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mb-4 rounded" role="alert">
                        {success} <Link to="/login" className="text-indigo-600 dark:text-indigo-400 underline">Login now</Link>.
                    </div>
                )}
                {!success && (
                    <form className="space-y-5" onSubmit={handleResetPassword}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Current Password
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                placeholder="Enter current password"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                type="submit"
                                className={`flex-1 bg-indigo-600 text-white font-semibold py-2 text-base rounded-md shadow-lg transition duration-300 ${
                                    isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
                                }`}
                                disabled={isLoading}
                            >
                                {isLoading ? "Resetting..." : "Reset Password"}
                            </button>
                            <Button
                                variant="outline"
                                className="flex-1 border-indigo-600 text-indigo-600 hover:bg-indigo-100 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-gray-700"
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;