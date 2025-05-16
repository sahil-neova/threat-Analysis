import { Helmet } from "react-helmet";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Layout from "@/components/Layout";

const SetOpenAIKeyPage = () => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateApiKey = (key: string) => {
    if (!key.startsWith("sk-")) {
      return "Invalid API key format. It should start with 'sk-'.";
    }
    if (key.length < 30) {
      return "API key is too short. Please enter a valid key.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateApiKey(apiKey.trim());
    if (validationError) {
      toast({
        title: "Invalid API Key",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/set_openapi_key", {
        api_key: apiKey,
      });

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "OpenAI API key saved successfully.",
        });
        setApiKey("");
        navigate("/dashboard"); // Redirect after successful submission
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>neoComplianceAgent | Set OpenAI API Key</title>
      </Helmet>
      <Layout promptHistory={[]}>
        <div className="space-y-6 max-w-2xl mx-auto mt-10">
          <Card className="bg-muted rounded-xl shadow-md">
            <CardHeader>
              <CardTitle>Set OpenAI API Key</CardTitle>
              <CardDescription>Enter your OpenAI API key to enable AI features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save API Key"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    </div>
  );
};

export default SetOpenAIKeyPage;
