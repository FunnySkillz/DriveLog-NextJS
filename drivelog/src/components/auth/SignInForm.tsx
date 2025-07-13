"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="w-full max-w-sm mx-auto">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
            let toastTitle = "";
            if (error.message.includes("Invalid password")) {
              toastTitle = "Invalid password. Please try again.";
            } else {
              toastTitle =
                flow === "signIn"
                  ? "Could not sign in, did you mean to sign up?"
                  : "Could not sign up, did you mean to sign in?";
            }
            toast.error(toastTitle);
            setSubmitting(false);
          });
        }}
      >
        <div className="space-y-2">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" name="email" placeholder="Email" required />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                required
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </Button>

        <div className="text-center text-sm text-muted-foreground mt-2">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-primary hover:underline font-medium"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </form>

      <div className="flex items-center justify-center my-5">
        <hr className="grow border-slate-200" />
        <span className="mx-4 text-muted-foreground">or</span>
        <hr className="grow border-slate-200" />
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => void signIn("anonymous")}
      >
        Sign in anonymously
      </Button>
    </div>
  );
}
