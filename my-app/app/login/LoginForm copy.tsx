"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import router for navigation
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import LoadingButton from "@/components/loading-button";

import { login } from "@/lib/session";

export type FormValues = {
  username: string;
  password: string;
};

export function LoginForm(): JSX.Element {
  const router = useRouter(); // Initialize router
  const [state, handleLogin] = useActionState(login, undefined);
  const form = useForm<FormValues>({
    defaultValues: { username: "", password: "" },
  });

  // Use useEffect to navigate after login success
  useEffect(() => {
    if (state?.success) {
      router.push("/"); // Perform navigation only after state updates
    }
  }, [state?.success, router]); // Runs only when `state.success` changes

  return (
<div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
        <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your username and password to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form action={handleLogin} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your username"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.username?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.password?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              {/* Display general error messages */}
              {state?.errors?.general && (
                <p className="text-red-500 text-sm text-center">
                  {state.errors.general}
                </p>
              )}

              <LoadingButton pending={form.formState.isSubmitting}>
                Sign In
              </LoadingButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>

  );
}
