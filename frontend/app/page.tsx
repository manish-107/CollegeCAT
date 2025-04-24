"use client";

import GoogleLoginButton from "@/components/ui/GoogleButton";

export default function Home() {
  const handleLogin = () => {
    console.log("Logging in with Google...");
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black  to-purple-900 text-white px-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold leading-snug">
          <span className="text-purple-500">Simplify </span> 
          your workflow
        </h1>
        <p className="text-zinc-400 ">
          Update your details, prioritize subjects, <br/>  view your timetable seamlessly.
        </p>
        <GoogleLoginButton />
      </div>
    </main>
  );
}

