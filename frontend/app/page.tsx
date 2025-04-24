"use client";

import GoogleLoginButton from "@/components/ui/GoogleButton";

export default function Home() {
  const handleLogin = () => {
    console.log("Logging in with Google...");
  };

  return (
    <main className="flex justify-center items-center bg-gradient-to-t from-white dark:from-black to-purple-100 dark:to-[#280446] px-4 min-h-screen text-black dark:text-white transition-colors duration-300">

      <div className="space-y-6 text-center">
        <h1 className="font-bold text-4xl leading-snug">
          <span className="text-purple-600 dark:text-purple-500">Simplify </span> 
          your workflow
        </h1>
        <p className="text-zinc-700 dark:text-zinc-400">
          Update your details, prioritize subjects, <br/> view your timetable seamlessly.
        </p>
        <GoogleLoginButton />
      </div>
    </main>
  );
}
