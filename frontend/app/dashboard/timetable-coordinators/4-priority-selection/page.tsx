'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Preference {
  subjectCode: string;
  subjectName: string;
  type: 'core' | 'elective' | 'lab' | 'project';
}

interface Lecturer {
  lecturerId: string;
  lecturerName: string;
  department: string;
  preferences?: Preference[]; // Optional for not-submitted
}

// All lecturers (some have not submitted)
const allLecturers: Lecturer[] = [
  {
    lecturerId: 'lect1',
    lecturerName: 'Dr. Smith',
    department: 'CSE',
    preferences: [
      { subjectCode: 'CS101', subjectName: 'Intro to CS', type: 'core' },
      { subjectCode: 'CS201', subjectName: 'Data Structures', type: 'core' },
      { subjectCode: 'CS401', subjectName: 'AI Basics', type: 'elective' },
      { subjectCode: 'CS501', subjectName: 'ML', type: 'elective' },
    ],
  },
  {
    lecturerId: 'lect2',
    lecturerName: 'Prof. Patel',
    department: 'Maths',
    preferences: [
      { subjectCode: 'MA101', subjectName: 'Calculus I', type: 'core' },
      { subjectCode: 'MA201', subjectName: 'Linear Algebra', type: 'core' },
      { subjectCode: 'MA301', subjectName: 'Probability', type: 'elective' },
    ],
  },
  {
    lecturerId: 'lect3',
    lecturerName: 'Dr. Allen',
    department: 'CSE',
    preferences: [
      { subjectCode: 'CS101', subjectName: 'Intro to CS', type: 'core' },
      { subjectCode: 'CS202', subjectName: 'Computer Networks', type: 'core' },
      { subjectCode: 'CS303', subjectName: 'Web Development', type: 'elective' },
    ],
  },
  // Not submitted
  {
    lecturerId: 'lect4',
    lecturerName: 'Dr. Rao',
    department: 'Physics',
  },
  {
    lecturerId: 'lect5',
    lecturerName: 'Prof. Mehta',
    department: 'Chemistry',
  },
];

const getTypeColor = (type: Preference['type']) => {
  switch (type) {
    case 'core': return 'bg-blue-100 text-blue-800';
    case 'elective': return 'bg-green-100 text-green-800';
    case 'lab': return 'bg-purple-100 text-purple-800';
    case 'project': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeLabel = (type: Preference['type']) => {
  switch (type) {
    case 'core': return 'Core';
    case 'elective': return 'Elective';
    case 'lab': return 'Lab';
    case 'project': return 'Project';
    default: return 'Unknown';
  }
};

export default function PrioritySelectionPage() {
  const [selectedLecturer, setSelectedLecturer] = useState<string | null>(null);

  // Split lecturers into submitted and not submitted
  const submitted = allLecturers.filter((l) => l.preferences && l.preferences.length > 0);
  const notSubmitted = allLecturers.filter((l) => !l.preferences || l.preferences.length === 0);

  const handleLecturerClick = (lecturerId: string) => {
    setSelectedLecturer(selectedLecturer === lecturerId ? null : lecturerId);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-12">
      <h2 className="text-2xl font-bold mb-6 text-center">Lecturer Priority Selection</h2>
      {/* Submitted Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold mb-2">Preferences Submitted</h3>
        <div className="grid grid-cols-1 gap-6">
          {submitted.map((lect) => (
            <Card
              key={lect.lecturerId}
              className={`transition-all duration-200 border-2 ${selectedLecturer === lect.lecturerId ? 'border-primary shadow-lg' : 'border-primary hover:shadow'} cursor-pointer`}
              onClick={() => handleLecturerClick(lect.lecturerId)}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-lg flex flex-col">
                  <span>{lect.lecturerName}</span>
                </CardTitle>
                <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                  {selectedLecturer === lect.lecturerId ? 'Hide Preferences' : 'Show Preferences'}
                </span>
              </CardHeader>
              {selectedLecturer === lect.lecturerId && (
                <>
                  <hr className="my-2 border-muted" />
                  <CardContent>
                    <Label className="mb-3 block text-base font-semibold">Subject Priority List</Label>
                    <div className="space-y-3">
                      {lect.preferences!.map((pref, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-3 rounded-lg border bg-muted/50 shadow-sm"
                        >
                          <span className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mr-2">
                            {idx + 1}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(pref.type)}`}>{getTypeLabel(pref.type)}</span>
                          <span className="px-2 py-1 rounded-full text-xs font-mono bg-gray-100 text-gray-700 border border-gray-200 ml-2">
                            {pref.subjectCode}
                          </span>
                          <span className="font-semibold ml-2">{pref.subjectName}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>
      {/* Not Submitted Section */}
      <div className="space-y-2 mt-8">
        <h3 className="text-lg font-semibold mb-2">Preferences Not Submitted</h3>
        {notSubmitted.length === 0 ? (
          <p className="text-muted-foreground italic">All lecturers have submitted their preferences.</p>
        ) : (
          <ul className="space-y-2">
            {notSubmitted.map((lect) => (
              <li key={lect.lecturerId} className="border rounded p-3 bg-muted/50 flex flex-col">
                <span className="font-semibold">{lect.lecturerName}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
