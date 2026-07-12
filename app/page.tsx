import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/signout-button";
import { Truck, BarChart3, Users, Zap, Shield, Smartphone } from "lucide-react";

export const metadata = {
  title: "TransitOps - Smart Transport Operations Platform",
  description: "Streamline your fleet management with real-time tracking, maintenance scheduling, fuel optimization, and comprehensive analytics.",
  openGraph: {
    title: "TransitOps - Smart Transport Operations Platform",
    description: "Streamline your fleet management with real-time tracking, maintenance scheduling, fuel optimization, and comprehensive analytics.",
    type: "website",
  },
};

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-14 w-14 rounded-lg bg-primary/20 flex items-center justify-center">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle>Welcome back!</CardTitle>
              <p className="text-sm text-muted-foreground">{session.user.name}</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ready to manage your fleet?
            </p>
            <div className="flex gap-2">
              <SignOutButton />
              <Button asChild className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="TransitOps" className="h-8 w-8" />
            <span className="text-xl font-bold text-foreground">TransitOps</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild className="border-border hover:bg-muted">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl sm:text-6xl font-bold text-balance leading-tight">
            Smart Transport <span className="text-primary">Operations</span> Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your fleet management with real-time tracking, maintenance scheduling, fuel optimization, and comprehensive analytics.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-border hover:bg-muted">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-16">Powerful Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Truck,
              title: "Vehicle Registry",
              description: "Track all your vehicles with real-time status updates, maintenance history, and performance metrics.",
            },
            {
              icon: Users,
              title: "Driver Management",
              description: "Manage driver licenses, safety scores, and trip assignments with automated expiry alerts.",
            },
            {
              icon: BarChart3,
              title: "Analytics Dashboard",
              description: "Get comprehensive insights with visualizations of fleet performance, expenses, and optimization opportunities.",
            },
            {
              icon: Zap,
              title: "Trip Dispatching",
              description: "Create and manage trips with cargo tracking, route optimization, and real-time status monitoring.",
            },
            {
              icon: Shield,
              title: "Maintenance Tracking",
              description: "Schedule preventive maintenance, log repairs, and optimize vehicle uptime and longevity.",
            },
            {
              icon: Smartphone,
              title: "Fuel & Expenses",
              description: "Monitor fuel consumption, track operational expenses, and identify cost reduction opportunities.",
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-border">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <h3 className="text-3xl font-bold">Ready to optimize your fleet operations?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of fleet managers who trust TransitOps for their transport operations.
            </p>
            <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/signup">Get Started for Free</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="TransitOps" className="h-6 w-6" />
              <span className="font-semibold text-foreground">TransitOps</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 TransitOps. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
