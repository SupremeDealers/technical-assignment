import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { client } from "@/api/client";
import { useState } from "react";
import { ArrowRight, Loader2, CheckCircle2, Mail, Lock, User, AlertCircle, Sparkles } from "lucide-react";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const password = watch("password", "");

    const onSubmit = async (data: RegisterForm) => {
        try {
            setError("");
            await client.post("/auth/register", data);
            setSuccess(true);
            setTimeout(() => navigate("/auth/login"), 1500);
        } catch (e: any) {
            setError(e.response?.data?.error?.message || "Failed to create account");
        }
    };

    if (success) {
        return (
            <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-6">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/20">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-bold">Account created!</h2>
                        <p className="text-muted-foreground font-medium">Redirecting you to login...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
                <p className="text-muted-foreground">
                    Start organizing your projects in minutes
                </p>
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
                        <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            Full name
                        </Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            className="h-12 transition-smooth focus:ring-2 focus:ring-primary/20 font-medium shadow-sm"
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive flex items-center gap-1.5 font-medium">
                                <AlertCircle className="w-3.5 h-3.5" /> {errors.name.message}
                            </p>
                        )}
                    </div>

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
                        <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                            <Lock className="w-4 h-4 text-primary" />
                            Password
                        </Label>
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
                        {password && password.length >= 6 && (
                            <p className="text-sm text-green-600 flex items-center gap-1.5 font-semibold">
                                <Sparkles className="w-3.5 h-3.5" /> Strong password
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
                            Creating account...
                        </>
                    ) : (
                        <>
                            Create account
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
                            Already have an account?
                        </span>
                    </div>
                </div>

                <div className="text-center">
                    <Link
                        to="/auth/login"
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-smooth inline-flex items-center gap-1"
                    >
                        Sign in instead
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            </form>

            <p className="text-xs text-center text-muted-foreground">
                By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
        </div>
    );
}
