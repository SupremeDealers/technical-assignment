import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../store/services/auth.service";

export const useLoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const navigate = useNavigate();

  const loginMutation = useLogin();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string | null> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await loginMutation.mutateAsync(formData);
      // Navigation happens in useEffect on success
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Network error. Please check your connection.";

      setErrors({ form: errorMessage });
      console.error("Login failed:", errorMessage);
    }
  };

  useEffect(() => {
    if (loginMutation.isSuccess) {
      console.log("Login successful! Redirecting...");
      navigate("/dashboard");
    }
  }, [loginMutation.isSuccess, navigate]);

  useEffect(() => {
    if (loginMutation.isError) {
      const error: any = loginMutation.error;
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid email or password";

      setErrors({ form: errorMessage });
      console.error("Login error:", errorMessage);
    }
  }, [loginMutation.isError, loginMutation.error]);

  return {
    formData,
    errors,
    isLoading: loginMutation.isPending,
    isSuccess: loginMutation.isSuccess,
    isError: loginMutation.isError,
    handleInputChange,
    handleLogin,
  };
};
