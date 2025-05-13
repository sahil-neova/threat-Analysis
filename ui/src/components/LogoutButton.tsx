import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Navigate to the logout page
        navigate("/logout", { replace: true });
    };

    return (
        <button
            onClick={handleLogout}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-lg transition duration-300"
        >
            Yes, Logout
        </button>
    );
};

export default LogoutButton;