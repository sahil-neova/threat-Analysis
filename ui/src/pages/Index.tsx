import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Layout from "@/components/Layout";

const Index = () => {
  const navigate = useNavigate();

  const handleNavigateToThreatAnalysis = () => {
    navigate("/threat-analysis"); // Fixed route
  };

  return (
    <Layout promptHistory={[]}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Threat Analysis Card */}
          <Card className="bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md border-blue-200 dark:border-gray-700 min-h-[200px] hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="p-4">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                Threat Analysis
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Analyze your files for potential threats and vulnerabilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-gray-700">
                  <ShieldAlert className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                  Run threat detection and receive detailed reports.
                </p>
              </div>
              <Button
                onClick={handleNavigateToThreatAnalysis}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm py-1 transition-all duration-200 hover:scale-105"
              >
                Start Threat Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
