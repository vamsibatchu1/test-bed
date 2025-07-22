"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { Film, Loader2 } from "lucide-react";

export default function AuthPage() {
  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState("");

  // Sign Up State
  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    setSignInLoading(true);

    if (!signInEmail.trim()) {
      setSignInError("Email is required");
      setSignInLoading(false);
      return;
    }

    if (!signInPassword.trim()) {
      setSignInError("Password is required");
      setSignInLoading(false);
      return;
    }

    try {
      const { error } = await signIn(signInEmail, signInPassword);
      
      if (error) {
        setSignInError(error.message);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setSignInError("An unexpected error occurred");
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");
    setSignUpLoading(true);

    if (!fullName.trim()) {
      setSignUpError("Full name is required");
      setSignUpLoading(false);
      return;
    }

    if (!signUpEmail.trim()) {
      setSignUpError("Email is required");
      setSignUpLoading(false);
      return;
    }

    if (signUpPassword.length < 6) {
      setSignUpError("Password must be at least 6 characters");
      setSignUpLoading(false);
      return;
    }

    if (signUpPassword !== confirmPassword) {
      setSignUpError("Passwords do not match");
      setSignUpLoading(false);
      return;
    }

    try {
      const { error } = await signUp(signUpEmail, signUpPassword, fullName);
      
      if (error) {
        setSignUpError(error.message);
      } else {
        setSignUpSuccess(true);
        // Clear form
        setFullName("");
        setSignUpEmail("");
        setSignUpPassword("");
        setConfirmPassword("");
        // Switch to sign in tab after a delay
        setTimeout(() => {
          setSignUpSuccess(false);
          const signInTab = document.querySelector('[data-value="signin"]') as HTMLElement;
          if (signInTab) signInTab.click();
        }, 2000);
      }
    } catch (err) {
      setSignUpError("An unexpected error occurred");
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 mx-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <img 
              src="/logomain.png" 
              alt="GoodFlicks Logo" 
              className="h-48 w-auto"
            />
          </div>
        </div>

        {/* Auth Tabs */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-neutral-800">
                <TabsTrigger value="signin" className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-neutral-700 data-[state=active]:text-white">Create Account</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signInEmail" className="text-white">Email Address</Label>
                    <Input
                      id="signInEmail"
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white focus:border-red-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signInPassword" className="text-white">Password</Label>
                    <Input
                      id="signInPassword"
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white focus:border-red-500"
                      required
                    />
                  </div>

                  {signInError && (
                    <Alert variant="destructive" className="bg-red-950 border-red-800">
                      <AlertDescription className="text-red-200">{signInError}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-white hover:bg-gray-100 text-black font-medium"
                    disabled={signInLoading}
                  >
                    {signInLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white focus:border-red-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signUpEmail" className="text-white">Email Address</Label>
                    <Input
                      id="signUpEmail"
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white focus:border-red-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signUpPassword" className="text-white">Password</Label>
                    <Input
                      id="signUpPassword"
                      type="password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white focus:border-red-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white focus:border-red-500"
                      required
                    />
                  </div>

                  {signUpError && (
                    <Alert variant="destructive" className="bg-red-950 border-red-800">
                      <AlertDescription className="text-red-200">{signUpError}</AlertDescription>
                    </Alert>
                  )}

                  {signUpSuccess && (
                    <Alert className="bg-green-950 border-green-800">
                      <AlertDescription className="text-green-200">
                        Account created successfully! You can now sign in.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-white hover:bg-gray-100 text-black font-medium"
                    disabled={signUpLoading}
                  >
                    {signUpLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
} 