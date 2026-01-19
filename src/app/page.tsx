import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold tracking-tight text-foreground text-balance">
          Family sync
          <br />
          with a family calendar
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          We're on a mission to transform family life by harnessing vast amounts of untapped family data.
        </p>
        <div className="mt-8 flex gap-4">
          <SignedOut>
            <Button asChild>
              <Link href="/sign-in">Log in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sign-up">Sign up</Link>
            </Button>
              </SignedOut>
          <SignedIn>
            <Button asChild>
              <Link href="/calendars">Go to calendars</Link>
            </Button>
          </SignedIn>
        </div>
      </div>
    </main>
  );
}
