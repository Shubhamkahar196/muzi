"use client";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";

export function Appbar() {
  const { data: session } = useSession();

  return (
    

    <div className="flex justify-between px-5 py-4 md:px-10 xl:px-20">
      <div
        className={`flex flex-col justify-center text-lg text-white font-bold hover:cursor-pointer `}
      >
        
        Muzi
      </div>
      <div className="flex items-center gap-x-2">
        {session?.user ? (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => signOut()}
          >
            Logout
          </Button>
        ) : (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => signIn(undefined, { callbackUrl: '/dashboard' })}
          >
            Signin
          </Button>
        )}
      </div>
    </div>
  );
}
