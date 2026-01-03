"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { GoogleIcon } from "@/icons";
import { signIn } from "@/lib/auth-client";
import { Github } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SocialAuth() {
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // await authClient.signIn.social({
  //   provider: "google", // or "github"
  //   callbackURL: "/dashboard",
  //   errorCallbackURL: "/error",         // optional: where to go if something goes wrong
  //   newUserCallbackURL: "/welcome",     // optional: for newly registered users
  // });

  async function signInWithGithub() {
    setGithubLoading(true);
    const data = await signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });

    if (data.error) {
      setGithubLoading(false);
      toast.error(`Error: ${data.error.message}`);
    } else {
      setGithubLoading(false);
      // toast.success("Github signin successful.");
    }
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    const data = await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });

    if (data.error) {
      setGoogleLoading(false);
      toast.error(`Error: ${data.error.message}`);
    } else {
      setGoogleLoading(false);
      // toast.success("Google signin successful.");
    }
  }

  return (
    <div className="flex flex-col items-center px-5">
      <Separator />
      <p className="text-center text-sm text-muted-foreground mt-4">
        Or continue with
      </p>
      <Button
        variant="outline"
        onClick={signInWithGithub}
        className="mt-4 w-full cursor-pointer"
        disabled={githubLoading || googleLoading}
      >
        {githubLoading ? <Spinner /> : <Github />}
        {githubLoading ? "Loading..." : "Github"}
      </Button>
      <Button
        variant="outline"
        onClick={signInWithGoogle}
        className="mt-2 w-full cursor-pointer"
        disabled={githubLoading || googleLoading}
      >
        {googleLoading ? <Spinner /> : <GoogleIcon />}
        {googleLoading ? "Loading..." : "Google"}
      </Button>
    </div>
  );
}
