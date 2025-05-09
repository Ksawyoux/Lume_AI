import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X } from "lucide-react";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AccountSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

// Profile update schema
const profileFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }).optional(),
});

// Password update schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters long" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function AccountSettings({ open, onOpenChange, user }: AccountSettingsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("profile");

  // Profile update form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      name: user?.name || "",
    },
  });

  // Password update form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Submit handler for profile form
  const onProfileSubmit = async (values: ProfileFormValues) => {
    try {
      if (!user) return;
      
      // Make API request to update profile
      await apiRequest(`/users/${user.id}/profile`, "PATCH", values);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      // Force a reload to update user info everywhere
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Submit handler for password form
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    try {
      if (!user) return;
      
      // Make API request to update password
      const response = await apiRequest("PATCH", `/api/users/${user.id}/password`, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      
      if (response.ok) {
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully.",
        });
        
        // Reset the form
        passwordForm.reset();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update password");
      }
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2126] border-[#2A363D] text-white max-w-md w-full p-0 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="p-4 border-b border-[#2A363D]">
          <DialogTitle className="text-xl font-bold">Account Settings</DialogTitle>
          <DialogClose className="absolute right-4 top-4 text-gray-400 hover:text-white">
            <X size={18} />
          </DialogClose>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 border-b border-[#2A363D] bg-transparent h-auto p-0">
            <TabsTrigger 
              value="profile" 
              className={`py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#00f19f] data-[state=active]:text-[#00f19f] data-[state=active]:shadow-none transition-colors duration-200 bg-transparent`}
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="password" 
              className={`py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#00f19f] data-[state=active]:text-[#00f19f] data-[state=active]:shadow-none transition-colors duration-200 bg-transparent`}
            >
              Password
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="p-4">
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Username</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-[#222a32] border-[#2A363D] focus-visible:ring-[#00f19f] focus-visible:ring-offset-0 focus-visible:border-[#00f19f]" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-[#222a32] border-[#2A363D] focus-visible:ring-[#00f19f] focus-visible:ring-offset-0 focus-visible:border-[#00f19f]" 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full mt-6 bg-[#00f19f] text-black hover:bg-[#00d489] flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Changes
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          {/* Password Tab */}
          <TabsContent value="password" className="p-4">
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Current Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          className="bg-[#222a32] border-[#2A363D] focus-visible:ring-[#00f19f] focus-visible:ring-offset-0 focus-visible:border-[#00f19f]" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">New Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          className="bg-[#222a32] border-[#2A363D] focus-visible:ring-[#00f19f] focus-visible:ring-offset-0 focus-visible:border-[#00f19f]" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Confirm New Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          className="bg-[#222a32] border-[#2A363D] focus-visible:ring-[#00f19f] focus-visible:ring-offset-0 focus-visible:border-[#00f19f]" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full mt-6 bg-[#00f19f] text-black hover:bg-[#00d489] flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Update Password
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}