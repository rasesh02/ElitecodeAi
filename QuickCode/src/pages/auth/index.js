import { X, CheckCircle, Mail, Lock, Code2, Sparkles } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/router";

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center p-4 mb-4 rounded-lg shadow-lg backdrop-blur-md border ${
        type === "success"
          ? "bg-green-600/20 text-green-400 border-green-600/30"
          : "bg-red-600/20 text-red-400 border-red-600/30"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-5 h-5 mr-2" />
      ) : (
        <X className="w-5 h-5 mr-2" />
      )}
      <div className="text-sm font-normal">{message}</div>
      <button onClick={onClose} className="ml-4 hover:opacity-70 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Sign In / Sign Up Page
export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    name: "",

    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const validateForm = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = "First name is required";

    if (!formData.email) tempErrors.email = "Email is required";
    if (!formData.password) tempErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("hit",process.env.NEXT_PUBLIC_API_FRONTEND_PROBLEM);
    try {
      console.log("Form Data:", formData);
      if (isSignIn) {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_FRONTEND_PROBLEM}/api/auth/signin`,
          formData
        );
        if (res) {
          console.log(res.data.content);

          localStorage.setItem("authToken", res.data.content.data.token);
          const redirectPath =
            sessionStorage.getItem("redirectAfterAuth") || "/";
          router.push(redirectPath);
        }
      } else {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_FRONTEND_PROBLEM}/api/auth/signup`,
          formData
        );
        console.log(res.data);

        localStorage.setItem("authToken", res.data.content.data.token);
      }

      setToast({
        show: true,
        message: isSignIn
          ? "Successfully signed in!"
          : "Account created successfully! please Go ahead and login ",
        type: "success",
      });
    } catch (error) {
      console.log("Error caught:", error);

      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          "Something went wrong";

        if (status === 400) {
          setToast({
            show: true,
            message: "Invalid Credentials",
            type: "error",
          });
        } else if (status === 401) {
          setToast({
            show: true,
            message: "Unauthorized access",
            type: "error",
          });
        } else if (status >= 500) {
          setToast({
            show: true,
            message: "Server error. Please try again later.",
            type: "error",
          });
        } else {
          setToast({
            show: true,
            message: message,
            type: "error",
          });
        }
      } else if (error.request) {
        // Network error - no response received
        setToast({
          show: true,
          message: "Network error. Please check your connection and try again.",
          type: "error",
        });
      } else {
        // Something else happened
        setToast({
          show: true,
          message: "An unexpected error occurred. Please try again.",
          type: "error",
        });
      }
    }
  };

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-gray-200 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Code2 className="text-purple-400" size={32} />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                QuickCode
              </span>
            </div>
            <p className="text-gray-400">Create and solve with friends</p>
          </div>

          {/* Auth Card */}
          <div className="bg-[#1a1a1a] backdrop-blur-md rounded-xl p-8 border border-gray-800 shadow-2xl">

            {/* Tab Buttons */}
            <div className="flex mb-8 bg-[#0a0a0a] rounded-lg p-1">
              <button
                className={`flex-1 py-3 px-4 font-medium rounded-md transition-all duration-200 ${
                  isSignIn
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                onClick={() => setIsSignIn(true)}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-3 px-4 font-medium rounded-md transition-all duration-200 ${
                  !isSignIn
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                onClick={() => setIsSignIn(false)}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {!isSignIn && (
                <>
                  <div className="mb-6">
                    <label
                      className="block text-gray-300 text-sm font-medium mb-2"
                      htmlFor="name"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="John Doe"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}

              <div className="mb-6">
                <label
                  className="block text-gray-300 text-sm font-medium mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    className="pl-10 w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="john@example.com"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-8">
                <label
                  className="block text-gray-300 text-sm font-medium mb-2"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    className="pl-10 w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="••••••••"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-600/25"
              >
                {isSignIn ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}

      <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
