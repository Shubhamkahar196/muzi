"use client"
import { signIn, signOut, useSession } from "next-auth/react"

export function Appbar() {
  const { data: session } = useSession();

  return (
    <div>
      <div className="flex justify-between">
        <div>Muzi</div>

        <div>
          {session?.user ? (
            <button
              className="m-2 p-2 bg-blue-400"
              onClick={() => signOut()}
            >
              Logout
            </button>
          ) : (
            <button
              className="m-2 p-2 bg-blue-400"
              onClick={() => signIn()}
            >
              Signin
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
