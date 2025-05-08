import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Form schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(2, "Full name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

// Component to check authentication and redirect if needed
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Also check localStorage for stored user data
  const localUser = localStorage.getItem('lumeUser');
  
  if (user || localUser) {
    // If we have a user session, redirect to home
    return <Redirect to="/" />;
  }
  
  return <>{children}</>;
}

// Auth form component that contains all the form logic
function AuthForms() {
  const [activeTab, setActiveTab] = useState("login");
  const { loginMutation, registerMutation } = useAuth();
  
  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values);
  };

  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onRegisterSubmit = (values: RegisterValues) => {
    const { confirmPassword, ...registerData } = values;
    registerMutation.mutate(registerData);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col md:flex-row">
      {/* Hero section */}
      <div className="flex-1 p-6 md:p-12 flex flex-col justify-center text-foreground">
        <div className="max-w-lg mx-auto md:mx-0">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="text-primary">Lume</span> - Understand Your Emotional Spending
          </h1>
          <p className="text-lg mb-8 md:pr-12">
            Discover how your emotions affect your financial decisions. Track your mood, monitor your spending, and gain valuable insights to make better financial choices.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 rounded-full p-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">✓</div>
              </div>
              <span>Track your emotional patterns alongside spending</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 rounded-full p-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">✓</div>
              </div>
              <span>Analyze financial habits with AI-powered insights</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 rounded-full p-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">✓</div>
              </div>
              <span>Protect your financial well-being</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth form section */}
      <div className="flex-1 p-6 md:p-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {activeTab === "login" ? "Sign In" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" 
                ? "Enter your credentials to access your account" 
                : "Sign up to start your emotional finance journey"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center text-sm text-muted-foreground">
            <p className="mb-2">
              {activeTab === "login" 
                ? "Don't have an account?" 
                : "Already have an account?"}
            </p>
            <Button 
              variant="link" 
              onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
              className="p-0 h-auto"
            >
              {activeTab === "login" ? "Create an account" : "Sign in instead"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <AuthGuard>
      <AuthForms />
    </AuthGuard>
  );
}