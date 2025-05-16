import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";

type Report = {
  id: string;
  title: string;
  view_url: string;
  download_url: string;
  date: string;
};

const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        console.error("User ID not found in localStorage.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8000/list_threat_analysis_reports",
          {
            params: { user_id: userId },
          }
        );

        const files = response.data.files || [];
        const mappedReports: Report[] = files.map(
          (
            file: { s3_key: string; view_url: string; download_url: string },
            index: number
          ) => {
            const parts = file.s3_key.split("/");
            const fileName = parts[parts.length - 1];
            return {
              id: `${index}`,
              title: fileName,
              view_url: file.view_url,
              download_url: file.download_url,
              date: new Date().toISOString(),
            };
          }
        );

        setReports(mappedReports);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <Layout promptHistory={[]}>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          Threat Analysis Reports
        </h1>

        {loading ? (
          <div className="text-center text-gray-600 dark:text-gray-400">
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400">
            No reports available. Generate a threat report to see it here.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="rounded-2xl border border-blue-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-900"
              >
                <CardHeader className="px-5 pt-5 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-white break-words">
                    {report.title}
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(report.date).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-2 flex flex-col gap-3">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm py-2 text-center transition-all duration-200"
                  >
                    View
                  </button>
                  <a
                    href={report.download_url}
                    download
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm py-2 text-center transition-all duration-200"
                  >
                    Download
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal for a viewing report */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 w-full max-w-4xl relative shadow-lg">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-lg"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              {selectedReport.title}
            </h2>
            <iframe
              src={selectedReport.view_url}
              className="w-full h-[500px] rounded border"
              title="Threat Analysis Report"
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ReportsPage;
