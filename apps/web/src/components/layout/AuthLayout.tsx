import { Outlet, Navigate } from "react-router-dom";
import { LayoutGrid, Zap, Shield, Users } from "lucide-react";

export function AuthLayout() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    // If already logged in (has both token AND user), redirect to dashboard
    if (token && user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex min-h-screen">
            {/* Left side - Brand/Hero section */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent p-12 text-white items-center justify-center relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '48px 48px'
                    }} />
                </div>

                <div className="relative z-10 max-w-md space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                            <LayoutGrid className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold">TaskFlow</h1>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold leading-tight">
                            Organize your work.<br />
                            Achieve more together.
                        </h2>
                        <p className="text-white/80 text-lg">
                            Modern project management made simple. Collaborate with your team and track progress in real-time.
                        </p>
                    </div>

                    <div className="space-y-4 pt-8">
                        <div className="flex items-start gap-3 group">
                            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-lg mt-1 shadow-lg group-hover:bg-white/30 transition-all">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Lightning Fast</h3>
                                <p className="text-white/70 text-sm">Drag-and-drop interface for seamless workflow</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 group">
                            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-lg mt-1 shadow-lg group-hover:bg-white/30 transition-all">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Team Collaboration</h3>
                                <p className="text-white/70 text-sm">Work together with real-time updates</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 group">
                            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-lg mt-1 shadow-lg group-hover:bg-white/30 transition-all">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Secure & Reliable</h3>
                                <p className="text-white/70 text-sm">Your data is safe with enterprise-grade security</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Auth form */}
            <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-lg shadow-lg">
                            <LayoutGrid className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">TaskFlow</h1>
                    </div>

                    <Outlet />
                </div>
            </div>
        </div>
    );
}
