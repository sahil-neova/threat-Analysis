import { Helmet } from "react-helmet";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const AdminContactPage = () => {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState("");
    const [inquiryId, setInquiryId] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.email.includes("@")) {
            toast({ title: "Invalid email", variant: "destructive" });
            return;
        }

        const formData = new FormData();
        formData.append("user_email", form.email);
        formData.append("subject", `neoThreatAgent Service Inquiry`);
        formData.append("inquiry_body", form.message);

        try {
            setLoading(true);
            const response = await fetch("http://localhost:8000/ask_admin", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Unknown error occurred");
            }

            setStatus("success");
            setInquiryId(data.inquiry_id);
            setForm({ name: "", email: "", message: "" });
            toast({
                title: "Inquiry submitted successfully",
                description: `Reference ID: ${data.inquiry_id}`,
            });
        } catch (error: any) {
            setStatus("error");
            toast({
                title: "Failed to send inquiry",
                description: error.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
            <Helmet>
                <title>neoThreatAgent | Contact Admin</title>
            </Helmet>

            <div className="w-full max-w-xl flex flex-col items-center space-y-4">
                <Card className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-blue-200 dark:border-gray-700">
                    <CardHeader className="p-6 flex flex-col items-center">
                        <img
                            src="/neova_solutions_logo.png"
                            alt="Neova Solutions Logo"
                            className="w-18 h-18 mb-4"
                        />
                        <div className="w-16 h-0.5 bg-blue-500 rounded mb-4" />
                        <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white text-center">
                            Contact Admin for neoThreatAgent
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 text-center">
                            Get in touch with us for AI model services, integration, or custom
                            support.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                name="name"
                                placeholder="Your Full Name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                name="email"
                                type="email"
                                placeholder="Your Business Email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                            <Textarea
                                name="message"
                                placeholder="Tell us how you'd like to use neoThreatAgent or ask questions about pricing, deployment, or features."
                                rows={5}
                                value={form.message}
                                onChange={handleChange}
                                required
                            />

                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {loading ? "Sending..." : "Send Inquiry"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => navigate("/dashboard")}
                                >
                                    Back
                                </Button>
                            </div>
                        </form>

                        {status === "success" && (
                            <div className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 p-4 rounded-lg mt-4 text-sm">
                                <p>
                                    Thank you for your interest! Your inquiry has been submitted
                                    successfully. Reference ID: <strong>{inquiryId}</strong>.
                                </p>
                                <p>
                                    Our admin team will reach out to you shortly with the next
                                    steps.
                                </p>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 p-4 rounded-lg mt-4 text-sm">
                                Something went wrong. Please try again later or contact us
                                directly.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminContactPage;