import { Helmet } from "react-helmet";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SupportPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    formData.append("subject", `Tech Support Ticket Raised`);
    formData.append("message_body", form.message);

    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/support_email", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unknown error occurred");
      }

      setStatus("success");
      setTicketId(data.ticket_id);
      setForm({ name: "", email: "", message: "" });
      toast({
        title: "Support request submitted",
        description: `Ticket ID: ${data.ticket_id}`,
      });
    } catch (error: any) {
      setStatus("error");
      toast({
        title: "Failed to send support email",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-background flex flex-col">
        <Helmet>
          <title>neoThreatAgent | Support Page</title>
        </Helmet>
        <Card className="max-w-md mx-auto mt-10 bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md border-blue-200 dark:border-gray-700">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
              Raise Query With Support Team
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Submit a query, and our team will get back to you soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                  name="name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="border-gray-200 rounded-lg focus:ring-blue-500 dark:border-gray-700"
              />
              <Input
                  name="email"
                  placeholder="Your Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="border-gray-200 rounded-lg focus:ring-blue-500 dark:border-gray-700"
              />
              <Textarea
                  name="message"
                  placeholder="Your Query"
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="border-gray-200 rounded-lg focus:ring-blue-500 dark:border-gray-700"
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
                >
                  {loading ? "Sending..." : "Send Query"}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
                    onClick={() => navigate("/dashboard")}
                >
                  Go to Homepage
                </Button>
              </div>
              {status === "success" && (
                  <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-4 text-blue-600 dark:text-blue-400 text-sm space-y-1">
                    <p>
                      Your query has been successfully submitted to our support team. Your ticket ID is <strong>{ticketId}</strong>. Please retain this ID for any future correspondence.
                    </p>
                    <p>
                      Our team will review your request and get back to you shortly.
                    </p>
                    <p>
                      If you do not receive a response within a reasonable timeframe, feel free to contact us directly at <a href="mailto:techsupport@neovasolutions.in" className="underline">techsupport@neovasolutions.in</a>.
                    </p>
                  </div>

              )}
              {status === "error" && (
                  <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-4 text-red-600 dark:text-red-400 text-sm">
                    Something went wrong while sending your request.
                  </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
  );
};

export default SupportPage;