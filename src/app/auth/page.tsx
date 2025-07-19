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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <Film className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">GoodFlicks</h2>
        </div>

        {/* Auth Tabs */}
        <Card>
          <CardHeader>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signInEmail">Email Address</Label>
                    <Input
                      id="signInEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signInPassword">Password</Label>
                    <Input
                      id="signInPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                    />
                  </div>

                  {signInError && (
                    <Alert variant="destructive">
                      <AlertDescription>{signInError}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
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
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signUpEmail">Email Address</Label>
                    <Input
                      id="signUpEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signUpPassword">Password</Label>
                    <Input
                      id="signUpPassword"
                      type="password"
                      placeholder="Create a password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  {signUpError && (
                    <Alert variant="destructive">
                      <AlertDescription>{signUpError}</AlertDescription>
                    </Alert>
                  )}

                  {signUpSuccess && (
                    <Alert>
                      <AlertDescription>
                        Account created successfully! You can now sign in.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
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