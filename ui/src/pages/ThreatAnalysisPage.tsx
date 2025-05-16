import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Download, Mail } from "lucide-react";
import Layout from "@/components/Layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function MalwareAnalysis() {
  const [sha256, setSha256] = useState("");
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!sha256.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setFileBlob(null);

    try {
      const user_id = localStorage.getItem("user_id") || "";

      const response = await axios.post(
        "http://localhost:8000/static_analysis",
        { sha256, user_id },
        { responseType: "blob" }
      );

      // Now expect a PDF blob
      const blob = new Blob([response.data], { type: "application/pdf" });
      setFileBlob(blob);
      
      // We no longer parse PDF as text, so no summary/signature extraction
    } catch (error: any) {
      console.error("Analysis failed", error);

      if (axios.isAxiosError(error) && error.response) {
        const contentType = error.response.headers["content-type"];

        if (contentType && contentType.includes("application/json")) {
          // Try to read the error blob as JSON
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const json = JSON.parse(reader.result as string);
              setErrorMsg(json.detail || "Analysis failed. Please try again.");
            } catch {
              setErrorMsg("Failed to parse error message.");
            }
          };
          reader.onerror = () => {
            setErrorMsg("Failed to read error message.");
          };
          reader.readAsText(error.response.data);
        } else {
          // Fallback for non-JSON blobs
          setErrorMsg("Analysis failed. Please try again.");
        }
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    }

    setLoading(false);
  };

  const handleDownload = () => {
    if (!fileBlob) return;
    const url = window.URL.createObjectURL(fileBlob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "suricata_rules.pdf"); // changed to .pdf
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailSend = async () => {
    const email = recipientEmail.trim();

    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: `${email} is not a valid email address.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsEmailSending(true);

      const response = await axios.post(
        "http://localhost:8000/email_threat_analysis_report",
        { recipient_email: email }
      );

      toast({
        title: "Email Sent",
        description: response.data.message || "The report has been emailed successfully.",
      });

      setEmailDialogOpen(false);
      setRecipientEmail("");
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send the email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  return (
    <Layout promptHistory={[]}>
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Malware Analyzer</h2>

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4 space-y-2 sm:space-y-0">
          <Input
            value={sha256}
            onChange={(e) => setSha256(e.target.value)}
            placeholder="Enter SHA256"
            className="flex-1"
          />
          <Button onClick={handleAnalyze} disabled={loading || !sha256.trim()}>
            {loading ? "Analyzing..." : "Analyze Malware"}
          </Button>
        </div>

        {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}

        {fileBlob && (
          <div className="space-y-6 mt-6">
            {/* Embedded PDF preview */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Analysis Report (PDF):</h3>
              <object
                data={window.URL.createObjectURL(fileBlob)}
                type="application/pdf"
                width="100%"
                height="600px"
                aria-label="PDF Report"
              >
                <p>
                  PDF preview is not supported by your browser. You can download the file instead.
                </p>
              </object>
            </div>

            {/* Download and Email Buttons */}
            <div className="flex space-x-4 mt-4">
              <Button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button
                onClick={() => setEmailDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Report
              </Button>
            </div>
          </div>
        )}

        {/* Email Dialog */}
        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogContent className="bg-white dark:bg-gray-900 rounded-xl">
            <DialogHeader>
              <DialogTitle>Send Report via Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Enter recipient email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
            <DialogFooter className="mt-4 flex justify-end space-x-2">
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button onClick={handleEmailSend} disabled={isEmailSending}>
                {isEmailSending ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
