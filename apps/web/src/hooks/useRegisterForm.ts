import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../store/services/auth.service";
import { showToast } from "../components/tools/toast";

export const useRegisterForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const navigate = useNavigate();

  const registerMutation = useRegister();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await registerMutation.mutateAsync(formData);
    } catch (error: any) {
      console.error("Registration error:", error?.response);
      let errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Network error. Please check your connection.";

      const details = error?.response?.data?.error?.details;
      if (Array.isArray(details) && details.length > 0) {
        errorMessage = details
          .map((d: any) => d.message || JSON.stringify(d))
          .join("\n");
      }

      showToast({
        type: "error",
        title: errorMessage,
      });
    }
  };

  useEffect(() => {
    if (registerMutation.isSuccess) {
      console.log("Registration successful! Redirecting...");
      navigate("/dashboard");
    }
  }, [registerMutation.isSuccess, navigate]);

  // useEffect(() => {
  //   if (registerMutation.isError) {
  //     const error: any = registerMutation.error;
  //     let errorMessage =
  //       error?.response?.data?.message ||
  //       error?.message ||
  //       "Registration failed. Please try again.";

  //     const details = error?.response?.data?.error?.details;
  //     if (Array.isArray(details) && details.length > 0) {
  //       errorMessage = details
  //         .map((d: any) => d.message || JSON.stringify(d))
  //         .join("\n");
  //     }

  //     setErrors({ form: errorMessage });
  //     console.error("Registration error:", errorMessage);
  //   }
  // }, [registerMutation.isError, registerMutation.error]);

  return {
    formData,
    errors,
    isLoading: registerMutation.isPending,
    isSuccess: registerMutation.isSuccess,
    isError: registerMutation.isError,
    handleInputChange,
    handleRegister,
  };
};
