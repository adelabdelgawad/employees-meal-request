"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import router for navigation
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
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
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-800">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              action={handleLogin}
              className="flex max-w-[300px] flex-col gap-4"
            >
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
