import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const LogoutPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/", { replace: true });
        }, 2000); // Redirect after 2 seconds

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md text-center">
                <div className="flex flex-col items-center mb-6">
                    <LogOut className="w-12 h-12 text-blue-500 dark:text-blue-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Logged Out</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You have been successfully logged out. Redirecting to login...
                </p>
                <a
                    href="/"
                    className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                    Go to Login
                </a>
            </div>
        </div>
    );
};

export default LogoutPage;