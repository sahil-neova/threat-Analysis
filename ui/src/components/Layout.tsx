import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  promptHistory: string[];
}

const Layout = ({ children, promptHistory }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-800 flex flex-col">
      <Header className="shadow-sm" />
      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        <Sidebar promptHistory={promptHistory} />
        <div className="flex-1 p-6">
          <main className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;