import { Bell, HelpCircle, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

interface HeaderProps {
    className?: string;
}

const Header = ({ className }: HeaderProps) => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState("light");
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === "light" ? "dark" : "light");
        root.classList.add(theme);
    }, [theme]);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_role");
        setIsLogoutDialogOpen(false);
        navigate("/logout");
    };

    return (
        <>
            <header className="bg-blue-50 dark:bg-gray-800 border-b border-blue-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img
                            src="/neova_solutions_logo.png"
                            alt="Neova Solutions Logo"
                            className="h-auto w-auto"
                        />
                    </div>

                    <div className="flex flex-col justify-center items-center py-1 px-4">
                        <h1 className="font-Roboto font-extrabold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-teal-400 dark:from-blue-400 dark:via-cyan-400 dark:to-green-300 leading-snug text-center">
                        neoThreatAgent
                        </h1>
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 text-center max-w-xl">
                            An <span className="font-semibold text-blue-600 dark:text-blue-400">AI-Powered</span> Threat Analysis Solution designed to automate, detect, and protect.
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700"
                                    onClick={() => navigate("/dashboard")}
                                >
                                    <Home className="h-6 w-6" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Home</p>
                            </TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700"
                                >
                                    <Bell className="h-6 w-6" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-blue-100 dark:bg-gray-800">
                                <DropdownMenuItem>No new notifications</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700"
                                >
                                    <HelpCircle className="h-6 w-6" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-blue-100 dark:bg-gray-800">
                                <DropdownMenuItem>
                                    <a href="/guide.pdf" download className="w-full block">
                                        Documentation
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate("/support")}>
                                    Support
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700"
                                >
                                    <Settings className="h-6 w-6" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-blue-100 dark:bg-gray-800">
                                <DropdownMenuItem onClick={() => setTheme("light")}>
                                    Light Theme
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>
                                    Dark Theme
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate("/reset-password")}>
                                    Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsLogoutDialogOpen(true)}>
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">
                            Confirm Logout
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Are you sure you want to log out? You will need to log in again to access the dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsLogoutDialogOpen(false)}
                            className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleLogout}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Yes, Logout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Header;
