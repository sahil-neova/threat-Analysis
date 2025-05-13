import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout promptHistory={[]}>
      <Card className="max-w-md mx-auto mt-10 bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md border-blue-200 dark:border-gray-700">
        <CardHeader className="p-6 text-center">
          <CardTitle className="text-3xl font-semibold text-gray-800 dark:text-white">
            404
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Oops! Page not found
          </p>
          <Button
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
            onClick={() => navigate("/")}
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default NotFound;