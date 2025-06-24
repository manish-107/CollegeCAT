"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Subject {
  subjectCode: string;
  subjectName: string;
  type: "core" | "elective" | "lab" | "project";
}

// Example subject list (replace with real data/fetch in production)
const subjects: Subject[] = [
  { subjectCode: "CS101", subjectName: "Intro to CS", type: "core" },
  { subjectCode: "CS201", subjectName: "Data Structures", type: "core" },
  { subjectCode: "CS401", subjectName: "AI Basics", type: "elective" },
  { subjectCode: "CS501", subjectName: "ML", type: "elective" },
  { subjectCode: "MA101", subjectName: "Calculus I", type: "core" },
  { subjectCode: "MA201", subjectName: "Linear Algebra", type: "core" },
];

const getTypeColor = (type: Subject["type"]): string => {
  switch (type) {
    case "core":
      return "bg-blue-100 text-blue-800";
    case "elective":
      return "bg-green-100 text-green-800";
    case "lab":
      return "bg-purple-100 text-purple-800";
    case "project":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeLabel = (type: Subject["type"]): string => {
  switch (type) {
    case "core":
      return "Core";
    case "elective":
      return "Elective";
    case "lab":
      return "Lab";
    case "project":
      return "Project";
    default:
      return "Unknown";
  }
};

export default function FacultyPrioritySelectionPage() {
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (subject: Subject) => {
    if (selectedSubjects.find((s) => s.subjectCode === subject.subjectCode)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s.subjectCode !== subject.subjectCode));
    } else if (selectedSubjects.length < 5) {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: send selectedSubjects to backend
    setSubmitted(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Subject Priority Selection</h2>
      <p className="mb-4 text-center text-muted-foreground">
        Choose up to 5 subjects in order of preference. Click to select/deselect. Drag to reorder (optional).
      </p>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {subjects.map((subject) => {
            const selectedIdx = selectedSubjects.findIndex((s) => s.subjectCode === subject.subjectCode);
            return (
              <Card
                key={subject.subjectCode}
                className={`transition-all duration-200 border-2 cursor-pointer ${
                  selectedIdx !== -1 ? "border-primary shadow-lg bg-primary/10" : "border-muted hover:shadow"
                }`}
                onClick={() => handleSelect(subject)}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-lg flex flex-col">
                    <span>{subject.subjectName}</span>
                  </CardTitle>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getTypeColor(subject.type)}`}>
                    {getTypeLabel(subject.type)}
                  </span>
                </CardHeader>
                <CardContent>
                  <span className="px-2 py-1 rounded-full text-xs font-mono bg-gray-100 text-gray-700 border border-gray-200">
                    {subject.subjectCode}
                  </span>
                  {selectedIdx !== -1 && (
                    <span className="ml-4 text-primary font-semibold">Selected as #{selectedIdx + 1}</span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="flex justify-center">
          <Button type="submit" disabled={selectedSubjects.length === 0 || submitted}>
            {submitted ? "Submitted" : "Submit Preferences"}
          </Button>
        </div>
      </form>
      {submitted && (
        <div className="mt-6 text-center text-green-600 font-semibold">Preferences submitted successfully!</div>
      )}
      {selectedSubjects.length > 0 && (
        <div className="mt-8">
          <Label className="mb-3 block text-base font-semibold">Your Priority List</Label>
          <ol className="space-y-2">
            {selectedSubjects.map((subject, idx) => (
              <li key={subject.subjectCode} className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50 shadow-sm">
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mr-2">
                  {idx + 1}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(subject.type)}`}>{getTypeLabel(subject.type)}</span>
                <span className="px-2 py-1 rounded-full text-xs font-mono bg-gray-100 text-gray-700 border border-gray-200 ml-2">
                  {subject.subjectCode}
                </span>
                <span className="font-semibold ml-2">{subject.subjectName}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
} 