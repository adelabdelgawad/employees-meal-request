"use client";

import { useActionState } from "react";
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

/**
 * LoginForm component renders a login card with username and password fields.
 *
 * @returns {JSX.Element} The rendered login form.
 */
export function LoginForm(): JSX.Element {
  const [state, handleLogin] = useActionState(login, undefined);
  const form = useForm<FormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

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
              {/* Using LoadingButton with form submission state */}
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
