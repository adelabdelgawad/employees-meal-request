"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useForm } from "react-hook-form";
import LoadingButton from "@/components/loading-button";
import { handleCredentialsSignin } from "@/app/actions/authActions";
import { useState } from "react";
import ErrorMessage from "@/components/error-message";

type FormValues = {
  username: string;
  password: string;
};

export default function SignIn() {
  const [globalError, setGlobalError] = useState<string>("");

  const form = useForm<FormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await handleCredentialsSignin(values);
      if (result?.message) {
        setGlobalError(result.message);
      } else {
        // Success logic (e.g., redirecting user)
        console.log("Successfully signed in");
      }
    } catch (error) {
      setGlobalError("An unexpected error occurred. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-800">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent>
          {globalError && <ErrorMessage error={globalError} />}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        type="username"
                        placeholder="Enter your username address"
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
