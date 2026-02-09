import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, LayoutDashboard, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Organize with Boards',
    description: 'Create multiple boards to organize different projects and workflows.',
  },
  {
    icon: Sparkles,
    title: 'Drag & Drop',
    description: 'Intuitive drag and drop interface to move tasks between columns effortlessly.',
  },
  {
    icon: Users,
    title: 'Collaborate',
    description: 'Add comments to tasks and keep your team aligned on progress.',
  },
];

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span>Kanban</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/boards">Go to Boards</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center fade-scale-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            Organize your work visually
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            The simplest way to manage{' '}
            <span className="text-primary">your projects</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            A beautiful, intuitive Kanban board to help you organize tasks, track progress, and
            collaborate with your team. Built for simplicity and speed.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild className="gap-2">
              <Link to={isAuthenticated ? '/boards' : '/register'}>
                {isAuthenticated ? 'Go to Boards' : 'Start for Free'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {!isAuthenticated && (
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 border-t">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Simple, powerful features to help you manage your projects effectively.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-xl border bg-card p-6 card-shadow hover:card-shadow-hover transition-all duration-200"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 border-t">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to get organized?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of teams using Kanban to manage their projects.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to={isAuthenticated ? '/boards' : '/register'}>
                {isAuthenticated ? 'Go to Boards' : 'Create Free Account'}
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Free to use
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Unlimited boards
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LayoutDashboard className="h-4 w-4 text-primary" />
            <span>Kanban Board</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kanban. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
