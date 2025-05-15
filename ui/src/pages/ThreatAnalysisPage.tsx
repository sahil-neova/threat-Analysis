import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Copy, Download, Mail } from "lucide-react";
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
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!sha256.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setResult(null);
    setFileBlob(null);

    try {
      const user_id = localStorage.getItem("user_id") || "";

      const response = await axios.post(
        "http://localhost:8000/static_analysis",
        { sha256, user_id },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "text/plain" });
      setFileBlob(blob);

      const text = await blob.text();

      const summaryMatch = text.match(/1\. Malware Summary:\s*([\s\S]*?)\n2\. Suricata Signatures:/);
      const summary = summaryMatch ? summaryMatch[1].trim() : "";

      const signatureMatch = text.match(/2\. Suricata Signatures:\s*([\s\S]*)/);
      const signatureSection = signatureMatch ? signatureMatch[1].trim() : "";

      const signatureLines = signatureSection
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.startsWith("alert"));

      setResult({
        fullText: text,
        summary,
        signatureLines,
      });
    } catch (error) {
      console.error("Analysis failed", error);
      setErrorMsg("Analysis failed. Please check the SHA256 and try again.");
    }

    setLoading(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Copied to clipboard." });
  };

  const handleDownload = () => {
    if (!fileBlob) return;
    const url = window.URL.createObjectURL(fileBlob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "suricata_rules.txt");
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

        {result && (
          <div className="space-y-6 mt-6">
            {/* Full Report */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Analysis Report:</h3>
              <div className="bg-muted dark:bg-gray-900 p-4 rounded text-sm overflow-auto whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
                {result.fullText.split("\n").map((line: string, idx: number) => (
                  <div key={idx} className="px-2 py-1">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Download and Email Buttons */}
            <div className="flex space-x-4 mt-4">
              {fileBlob && (
                <Button
                  onClick={handleDownload}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Suricata Rules
                </Button>
              )}
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
