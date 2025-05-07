'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type Preference = {
  subjectCode: string;
  subjectName: string;
  type: 'core' | 'elective';
};

type LecturerPreference = {
  lecturerId: string;
  lecturerName: string;
  department: string;
  preferences: Preference[];
  submittedAt: string;
  batch: string;
};

type Lecturer = {
  lecturerId: string;
  lecturerName: string;
  department: string;
  batch: string;
};

// Mock: All lecturers
const allLecturers: Lecturer[] = [
  { lecturerId: 'lect1', lecturerName: 'Dr. Smith', department: 'CSE', batch: 'CSE-A' },
  { lecturerId: 'lect2', lecturerName: 'Prof. Patel', department: 'Maths', batch: 'CSE-B' },
  { lecturerId: 'lect3', lecturerName: 'Dr. Allen', department: 'CSE', batch: 'CSE-A' },
  { lecturerId: 'lect4', lecturerName: 'Dr. Roy', department: 'ECE', batch: 'CSE-B' },
];

// Mock: API - Submitted preferences
async function getLecturerPreferences(): Promise<LecturerPreference[]> {
  return [
    {
      lecturerId: 'lect1',
      lecturerName: 'Dr. Smith',
      department: 'CSE',
      submittedAt: '2025-05-06T10:00:00Z',
      batch: 'CSE-A',
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
      submittedAt: '2025-05-05T15:45:00Z',
      batch: 'CSE-B',
      preferences: [
        { subjectCode: 'MA101', subjectName: 'Calculus I', type: 'core' },
        { subjectCode: 'MA201', subjectName: 'Linear Algebra', type: 'core' },
        { subjectCode: 'MA301', subjectName: 'Probability', type: 'elective' },
      ],
    },
    {
      lecturerId: 'lect3',
      lecturerName: 'Prof. Roa',
      department: 'MCA',
      submittedAt: '2025-05-05T15:45:00Z',
      batch: 'CSE-B',
      preferences: [
        { subjectCode: 'MA101', subjectName: 'Calculus I', type: 'core' },
        { subjectCode: 'MA201', subjectName: 'Linear Algebra', type: 'core' },
        { subjectCode: 'MA301', subjectName: 'Probability', type: 'elective' },
      ],
    },
    {
      lecturerId: 'lect4',
      lecturerName: 'Prof. Kumar',
      department: 'MCA',
      submittedAt: '2025-05-05T15:45:00Z',
      batch: 'CSE-B',
      preferences: [
        { subjectCode: 'MA101', subjectName: 'Calculus I', type: 'core' },
        { subjectCode: 'MA201', subjectName: 'Linear Algebra', type: 'core' },
        { subjectCode: 'MA301', subjectName: 'Probability', type: 'elective' },
      ],
    },
  ];
}

const batches = ['CSE-A', 'CSE-B'];

export default function PrioritySelectionReviewPage() {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [submitted, setSubmitted] = useState<LecturerPreference[]>([]);
  const [openLecturers, setOpenLecturers] = useState<Record<string, boolean>>({});
  const [showSubmitted, setShowSubmitted] = useState(true);
  const [showNotSubmitted, setShowNotSubmitted] = useState(false);

  useEffect(() => {
    getLecturerPreferences().then(setSubmitted);
  }, []);

  const filteredSubmitted = submitted.filter((lec) => lec.batch === selectedBatch);
  const allInBatch = allLecturers.filter((lec) => lec.batch === selectedBatch);

  const notSubmitted = allInBatch.filter(
    (lec) => !submitted.some((sub) => sub.lecturerId === lec.lecturerId)
  );

  return (
    <div className="p-6">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Lecturer Priority Submissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Select Batch</Label>
            <Select onValueChange={(val) => setSelectedBatch(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch} value={batch}>
                    {batch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBatch && (
            <>
              <div className="space-y-4">
                {/* Submitted Section */}
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setShowSubmitted(!showSubmitted)}
                    className="mb-2"
                  >
                    {showSubmitted ? 'Hide' : 'Show'} Lecturers Who Submitted
                  </Button>

                  {showSubmitted &&
                    (filteredSubmitted.length === 0 ? (
                      <p className="text-muted-foreground italic">No submissions yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredSubmitted.map((lec) => (
                          <Card key={lec.lecturerId} className="border p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold">
                                  {lec.lecturerName} ({lec.department})
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Submitted: {new Date(lec.submittedAt).toLocaleString()}
                                </p>
                              </div>
                              <Button
                                variant="secondary"
                                onClick={() =>
                                  setOpenLecturers((prev) => ({
                                    ...prev,
                                    [lec.lecturerId]: !prev[lec.lecturerId],
                                  }))
                                }
                              >
                                {openLecturers[lec.lecturerId] ? 'Close' : 'View Preferences'}
                              </Button>
                            </div>

                            {openLecturers[lec.lecturerId] && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <Card className="p-3 border">
                                  <Label>Core Subjects</Label>
                                  <ul className="list-disc list-inside text-sm mt-2">
                                    {lec.preferences
                                      .filter((p) => p.type === 'core')
                                      .map((p, i) => (
                                        <li key={i}>
                                          {p.subjectCode} - {p.subjectName}
                                        </li>
                                      ))}
                                  </ul>
                                </Card>
                                <Card className="p-3 border">
                                  <Label>Elective Subjects</Label>
                                  <ul className="list-disc list-inside text-sm mt-2">
                                    {lec.preferences
                                      .filter((p) => p.type === 'elective')
                                      .map((p, i) => (
                                        <li key={i}>
                                          {p.subjectCode} - {p.subjectName}
                                        </li>
                                      ))}
                                  </ul>
                                </Card>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    ))}
                </div>

                {/* Not Submitted Section */}
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setShowNotSubmitted(!showNotSubmitted)}
                    className="mb-2"
                  >
                    {showNotSubmitted ? 'Hide' : 'Show'} Lecturers Who Have Not Submitted
                  </Button>

                  {showNotSubmitted && (
                    <ul className="space-y-2 text-sm">
                      {notSubmitted.length > 0 ? (
                        notSubmitted.map((lec) => (
                          <li
                            key={lec.lecturerId}
                            className="border p-2 rounded-md text-muted-foreground"
                          >
                            {lec.lecturerName} ({lec.department})
                          </li>
                        ))
                      ) : (
                        <li>No pending submissions.</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
