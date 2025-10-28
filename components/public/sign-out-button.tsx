"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import React, { ComponentProps } from "react";
type SignOutButtonProps = {
  text?: string;
} & ComponentProps<typeof Button>;
const SignOutButton = ({ text, ...props }: SignOutButtonProps) => {
  const router = useRouter();
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login"); // redirect to login page
        },
      },
    });
  };
  return (
    <Button onClick={handleSignOut} {...props}>
      {text ?? "התנתק"}
    </Button>
  );
};

export default SignOutButton;
