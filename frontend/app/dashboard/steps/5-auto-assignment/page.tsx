'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type Subject = {
  subjectCode: string;
  subjectName: string;
  lecturer: string;
  type: 'core' | 'elective';
};

type AssignmentData = {
  year: string;
  batch: string;
  subjects: Subject[];
};

const assignmentData: AssignmentData[] = [
  {
    year: '2024-2025',
    batch: 'MCA-A',
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
    subjects: [
      { subjectCode: 'MCA301', subjectName: 'Software Engineering', lecturer: 'Prof. Rakesh Patel', type: 'core' },
      { subjectCode: 'MCA302', subjectName: 'Operating Systems', lecturer: 'Dr. Rajiv Verma', type: 'core' },
      { subjectCode: 'MCA401', subjectName: 'Cloud Computing', lecturer: 'Dr. Anita Sharma', type: 'elective' },
      { subjectCode: 'MCA402', subjectName: 'Machine Learning', lecturer: 'Dr. Megha Rao', type: 'elective' },
    ],
  },
  {
    year: '2024-2025',
    batch: 'MCA-B',
    subjects: [
      { subjectCode: 'MCB101', subjectName: 'Computer Networks', lecturer: 'Dr. Rajiv Verma', type: 'core' },
      { subjectCode: 'MCB102', subjectName: 'Compiler Design', lecturer: 'Prof. Rakesh Patel', type: 'core' },
      { subjectCode: 'MCB201', subjectName: 'Data Mining', lecturer: 'Dr. Megha Rao', type: 'elective' },
      { subjectCode: 'MCB202', subjectName: 'Cyber Security', lecturer: 'Dr. Anita Sharma', type: 'elective' },
    ],
  },
  {
    year: '2025-2026',
    batch: 'MCA-B',
    subjects: [
      { subjectCode: 'MCB301', subjectName: 'Advanced Java', lecturer: 'Dr. Anita Sharma', type: 'core' },
      { subjectCode: 'MCB302', subjectName: 'Web Technologies', lecturer: 'Dr. Rajiv Verma', type: 'core' },
      { subjectCode: 'MCB401', subjectName: 'IoT & Sensors', lecturer: 'Dr. Megha Rao', type: 'elective' },
      { subjectCode: 'MCB402', subjectName: 'Big Data Analytics', lecturer: 'Prof. Rakesh Patel', type: 'elective' },
    ],
  },
];

export default function AutoAssignmentPage() {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isAssigned, setIsAssigned] = useState(false);
  const [isSentToHod, setIsSentToHod] = useState(false);

  const filteredData = assignmentData.find(
    (entry) => entry.batch === selectedBatch && entry.year === selectedYear
  );

  const allSubjects = filteredData?.subjects || [];
  const isSelectionValid = selectedBatch && selectedYear;

  const handleSendToHod = () => {
    setIsSentToHod(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Dropdown Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Auto Assignment Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Select Batch</Label>
            <Select
              value={selectedBatch}
              onValueChange={(value) => {
                setSelectedBatch(value);
                setIsAssigned(false);
                setIsSentToHod(false);
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
                setIsAssigned(false);
                setIsSentToHod(false);
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
            <Button
              onClick={() => setIsAssigned(true)}
              disabled={!isSelectionValid}
              className={`mt-4 px-6 py-2 rounded transition-all ${isSelectionValid
                ? ''
                : 'bg-gray-400 cursor-not-allowed text-white-500'
                }`}
            >
              Auto Assign
            </Button>

            {/* Send to HOD Button */}
            {isAssigned && !isSentToHod && (
              <Button
                onClick={handleSendToHod}
                className="mt-4 px-6 py-2  rounded transition-all"
              >
                Send to HOD
              </Button>
            )}
            {isSentToHod && (
              <div className="mt-6 ml-6 text-green-500 font-semibold">
                Sent to HOD successfully!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assigned Subjects */}
      {isAssigned && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assigned Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            {allSubjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects assigned.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {allSubjects.map((subject, index) => (
                  <div
                    key={index}
                    className="border rounded-md p-4 shadow-sm"
                  >
                    <p className="text-sm font-semibold ">
                      {subject.subjectCode} - {subject.subjectName}
                    </p>
                    <p className="text-sm ">
                      <span className="font-medium">Lecturer:</span> {subject.lecturer}
                    </p>
                    <p
                      className="text-xs w-auto  italic"
                    >
                      {subject.type.toUpperCase()} Subject
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sent to HOD Confirmation */}

    </div>
  );
}
