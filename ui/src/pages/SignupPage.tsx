import { Link } from "react-router-dom";

const SignupPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center px-4">
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md text-center">
        <img
          src="/neova_solutions_logo.png"
          alt="Neova Solutions Logo"
          className="absolute top-4 left-4 w-24 h-auto"
        />
        <div className="flex flex-col items-center mt-12 mb-6">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-teal-400 dark:from-blue-400 dark:via-cyan-400 dark:to-green-300 text-center leading-snug">
          neoThreatAgent
          </h1>
          <p className="text-slate-700 text-sm">
            Only administrators can create new user accounts. Please contact your administrator to get started.
          </p>
          <p className="text-slate-700 text-sm">
            If you are an administrator, please log in using your admin credentials.
          </p>
        </div>
        <p className="text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-semibold underline hover:text-indigo-800"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
