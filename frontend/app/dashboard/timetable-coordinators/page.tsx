"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TimetableCoordinatorHome() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/timetable-coordinators/1-create-year");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <span className="text-lg text-muted-foreground">Redirecting to Create Year and Batch...</span>
    </div>
  );
} 