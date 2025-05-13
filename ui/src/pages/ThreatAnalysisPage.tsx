import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Copy } from "lucide-react";
import { toast } from "@/components/ui/sonner";

export default function MalwareAnalysis() {
  const [sha256, setSha256] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAnalyze = async () => {
    if (!sha256.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      const response = await axios.post("http://localhost:8000/static_analysis", {
        sha256,
      });
      setResult(response.data);
    } catch (error) {
      console.error("Analysis failed", error);
      setErrorMsg("Analysis failed. Please check the SHA256 and try again.");
    }

    setLoading(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Malware Analyzer</h2>

      {/* Input Section */}
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

      {/* Result Section */}
      {result && (
        <div className="space-y-6 mt-6">
          {/* Malware Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Malware Summary:</h3>
            <div className="bg-muted dark:bg-gray-900 p-4 rounded text-sm overflow-auto whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
              {result.summary}
            </div>
          </div>

          {/* Suricata Signatures */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Suricata Signatures:</h3>
            <div className="space-y-3">
              {result.signatures
                ?.split("\n")
                .filter((line: string) => line.trim())
                .map((line: string, idx: number) => (
                  <div
                    key={idx}
                    className="relative bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto whitespace-pre-wrap text-gray-700 dark:text-gray-300"
                  >
                    <button
                      onClick={() => handleCopy(line.trim())}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {line.trim()}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
