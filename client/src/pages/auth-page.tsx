import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  initials: z.string().min(1, "Initials cannot be empty").max(3, "Initials must be 1-3 characters"),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  // If user is already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6 p-4">
        {/* Left side - Forms */}
        <div className="flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold text-primary mb-2">Lume</h1>
            <p className="text-gray-400">Track your emotional and financial well-being together</p>
          </div>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right side - Hero/Info */}
        <div className="hidden md:flex flex-col justify-center bg-gray-900 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-primary mb-4">Understand Your Emotional Spending</h2>
          <p className="text-gray-400 mb-6">
            Lume connects your emotions with your financial decisions, providing personalized insights to help you make better choices.
          </p>
          
          <div className="space-y-4">
            <FeatureItem title="Emotion Tracking">
              Log how you feel and identify patterns in your emotional wellbeing
            </FeatureItem>
            <FeatureItem title="Financial Insights">
              See how your emotions affect your spending behaviors
            </FeatureItem>
            <FeatureItem title="Health Monitoring">
              Connect with Apple Watch to track your physical wellness alongside emotions
            </FeatureItem>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              type="text" 
              placeholder="yourusername" 
              {...register("username")} 
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="********" 
              {...register("password")} 
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            type="submit" 
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function RegisterForm() {
  const { registerMutation } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      initials: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    // Remove confirmPassword as it's not needed for the API
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Sign up for a new Lume account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              type="text" 
              placeholder="yourusername" 
              {...register("username")} 
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="Your Name" 
                {...register("name")} 
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="initials">Initials</Label>
              <Input 
                id="initials" 
                type="text" 
                placeholder="YN" 
                maxLength={3}
                {...register("initials")} 
              />
              {errors.initials && (
                <p className="text-sm text-red-500">{errors.initials.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="********" 
              {...register("password")} 
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="********" 
              {...register("confirmPassword")} 
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            type="submit" 
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Creating account..." : "Create Account"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function FeatureItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex">
      <div className="mr-3 flex-shrink-0 mt-0.5 w-6 h-6 flex items-center justify-center rounded-full bg-primary-800">
        <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <p className="text-gray-400">{children}</p>
      </div>
    </div>
  );
}
