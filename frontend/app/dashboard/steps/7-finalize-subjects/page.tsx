'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

type Subject = {
  subjectCode: string;
  subjectName: string;
  lecturer: string;
  type: 'core' | 'elective';
};

type AllocationData = {
  year: string;
  batch: string;
  subjects: Subject[];
  finalized: boolean;
};

const allocationData: AllocationData[] = [
  {
    year: '2024-2025',
    batch: 'MCA-A',
    finalized: false,
    subjects: [
      { subjectCode: 'MCA101', subjectName: 'Advanced Programming', lecturer: 'Dr. Anita Sharma', type: 'core' },
      { subjectCode: 'MCA102', subjectName: 'Database Systems', lecturer: 'Dr. Rajiv Verma', type: 'core' },
      { subjectCode: 'MCA201', subjectName: 'Blockchain', lecturer: 'Dr. Anita Sharma', type: 'elective' },
      { subjectCode: 'MCA202', subjectName: 'AI & NLP', lecturer: 'Dr. Megha Rao', type: 'elective' },
    ],
  },
  {
    year: '2024-2025',
    batch: 'MCA-B',
    finalized: false,
    subjects: [
      { subjectCode: 'MCA101', subjectName: 'Advanced Programming', lecturer: 'Dr. Anita Sharma', type: 'core' },
      { subjectCode: 'MCA102', subjectName: 'Database Systems', lecturer: 'Dr. Rajiv Verma', type: 'core' },
      { subjectCode: 'MCA201', subjectName: 'Blockchain', lecturer: 'Dr. Anita Sharma', type: 'elective' },
      { subjectCode: 'MCA202', subjectName: 'AI & NLP', lecturer: 'Dr. Megha Rao', type: 'elective' },
    ],
  },
  {
    year: '2025-2026',
    batch: 'MCA-A',
    finalized: false,
    subjects: [
      { subjectCode: 'MCA301', subjectName: 'Software Engineering', lecturer: 'Prof. Rakesh Patel', type: 'core' },
      { subjectCode: 'MCA302', subjectName: 'Operating Systems', lecturer: 'Dr. Rajiv Verma', type: 'core' },
      { subjectCode: 'MCA401', subjectName: 'Cloud Computing', lecturer: 'Dr. Anita Sharma', type: 'elective' },
      { subjectCode: 'MCA402', subjectName: 'Machine Learning', lecturer: 'Dr. Megha Rao', type: 'elective' },
    ],
  },
  {
    year: '2025-2026',
    batch: 'MCA-B',
    finalized: false,
    subjects: [
      { subjectCode: 'MCA301', subjectName: 'Software Engineering', lecturer: 'Prof. Rakesh Patel', type: 'core' },
      { subjectCode: 'MCA302', subjectName: 'Operating Systems', lecturer: 'Dr. Rajiv Verma', type: 'core' },
      { subjectCode: 'MCA401', subjectName: 'Cloud Computing', lecturer: 'Dr. Anita Sharma', type: 'elective' },
      { subjectCode: 'MCA402', subjectName: 'Machine Learning', lecturer: 'Dr. Megha Rao', type: 'elective' },
    ],
  },
];

export default function FinalizeSubjectsPage() {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isFinalized, setIsFinalized] = useState(false);
  const [sendingStatus, setSendingStatus] = useState('');

  const filteredData = allocationData.find(
    (entry) => entry.batch === selectedBatch && entry.year === selectedYear
  );

  const allSubjects = filteredData?.subjects || [];
  const finalized = filteredData?.finalized || false;
  const isSelectionValid = selectedBatch && selectedYear;


  useEffect(() => {
    if (isSelectionValid && !isFinalized) {
      setIsFinalized(true);
    }
  }, [selectedBatch, selectedYear, isFinalized]);

  const handleSendToLecturers = () => {
    setSendingStatus('Sending to lecturers...');
    setTimeout(() => {
      setSendingStatus('Successfully sent to all lecturers!');
    }, 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Dropdown Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Finalize Subject Allocation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Select Batch</Label>
            <Select
              value={selectedBatch}
              onValueChange={(value) => {
                setSelectedBatch(value);
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MCA-A">MCA-A</SelectItem>
                <SelectItem value="MCA-B">MCA-B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Academic Year</Label>
            <Select
              value={selectedYear}
              onValueChange={(value) => {
                setSelectedYear(value);
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2025-2026">2025-2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 flex gap-4">
            {/* Send Button */}
            {isFinalized && (
              <div className="flex items-center gap-4">
                <Button onClick={handleSendToLecturers} className="mt-4 px-6 py-2 rounded">
                  Send to All Lecturers
                </Button>
                {sendingStatus && (
                  <p className="mt-4 text-sm text-green-600">{sendingStatus}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assigned Lecturers Table */}
      {isFinalized && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assigned Lecturers for {selectedBatch} - {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="text-left font-semibold px-4 py-6 border-t">Subject Code</th>
                  <th className="text-left font-semibold px-4 py-6 border-t">Subject Name</th>
                  <th className="text-left font-semibold px-4 py-6 border-t">Lecturer</th>
                  <th className="text-left font-semibold px-4 py-6 border-t">Type</th>
                </tr>
              </thead>
              <tbody>
                {allSubjects.map((subject) => (
                  <tr key={subject.subjectCode}>
                    <td className="border-t px-4 py-4">{subject.subjectCode}</td>
                    <td className="border-t px-4 py-4">{subject.subjectName}</td>
                    <td className="border-t px-4 py-4">{subject.lecturer}</td>
                    <td className="border-t px-4 py-4">{subject.type.toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
