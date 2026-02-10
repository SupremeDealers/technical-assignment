import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { client } from "@/api/client";
import { useState } from "react";
import { AuthResponse } from "@/types";
import { ArrowRight, Loader2, Mail, Lock, AlertCircle } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const handleTestLogin = () => {
        setValue("email", "alice@example.com");
        setValue("password", "password123");
    };

    const onSubmit = async (data: LoginForm) => {
        try {
            setError("");
            const response = await client.post<AuthResponse>("/auth/login", data);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            navigate("/");
        } catch (e: any) {
            setError(e.response?.data?.error?.message || "Failed to login");
        }
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                    <p className="text-muted-foreground">
                        Enter your credentials to access your account
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTestLogin}
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                    title="Fast Login with Test Agent"
                >
                    :
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="bg-destructive/10 border-2 border-destructive/30 text-destructive text-sm p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <div className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" />
                            Email address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            className="h-12 transition-smooth focus:ring-2 focus:ring-primary/20 font-medium shadow-sm"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive flex items-center gap-1.5 font-medium">
                                <AlertCircle className="w-3.5 h-3.5" /> {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                                <Lock className="w-4 h-4 text-primary" />
                                Password
                            </Label>

                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="h-12 transition-smooth focus:ring-2 focus:ring-primary/20 font-medium shadow-sm"
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive flex items-center gap-1.5 font-medium">
                                <AlertCircle className="w-3.5 h-3.5" /> {errors.password.message}
                            </p>
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 font-semibold transition-all hover:shadow-xl hover:shadow-primary/20 text-base"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            Sign in
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                    )}
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            New to TaskFlow?
                        </span>
                    </div>
                </div>

                <div className="text-center">
                    <Link
                        to="/auth/register"
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-smooth inline-flex items-center gap-1"
                    >
                        Create an account
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            </form>

            <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
        </div>
    );
}
