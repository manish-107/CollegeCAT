'use client';

import { useState } from 'react';
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

type AssignmentData = {
  year: string;
  batch: string;
  subjects: Subject[];
  approvalStatus: 'pending' | 'approved'; // Batch approval status
};

const assignmentData: AssignmentData[] = [
  {
    year: '2024-2025',
    batch: 'MCA-A',
    approvalStatus: 'pending',
    subjects: [
      { subjectCode: 'MCA101', subjectName: 'Advanced Programming', lecturer: 'Dr. Anita Sharma', type: 'core' },
      { subjectCode: 'MCA102', subjectName: 'Database Systems', lecturer: 'Dr. Rajiv Verma', type: 'core' },
      { subjectCode: 'MCA201', subjectName: 'Blockchain', lecturer: 'Dr. Anita Sharma', type: 'elective' },
      { subjectCode: 'MCA202', subjectName: 'AI & NLP', lecturer: 'Dr. Megha Rao', type: 'elective' },
    ],
  },
  {
    year: '2025-2026',
    batch: 'MCA-B',
    approvalStatus: 'approved',
    subjects: [
      { subjectCode: 'MCA301', subjectName: 'Software Engineering', lecturer: 'Prof. Rakesh Patel', type: 'core' },
      { subjectCode: 'MCA302', subjectName: 'Operating Systems', lecturer: 'Dr. Rajiv Verma', type: 'core' },
      { subjectCode: 'MCA401', subjectName: 'Cloud Computing', lecturer: 'Dr. Anita Sharma', type: 'elective' },
      { subjectCode: 'MCA402', subjectName: 'Machine Learning', lecturer: 'Dr. Megha Rao', type: 'elective' },
    ],
  },
];

export default function HodReviewPage() {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isReviewed, setIsReviewed] = useState(false);

  const filteredData = assignmentData.find(
    (entry) => entry.batch === selectedBatch && entry.year === selectedYear
  );

  const allSubjects = filteredData?.subjects || [];
  const approvalStatus = filteredData?.approvalStatus || 'pending';
  const isSelectionValid = selectedBatch && selectedYear;

  const handleReviewAssignments = () => {
    setIsReviewed(true);
  };

  const getBatchApprovalStatusBadge = (status: 'pending' | 'approved' ) => {
    switch (status) {
      case 'approved':
        return (
          <span className="text-xs text-green-600 bg-green-100 py-1 px-2 rounded">
            Approved
          </span>
        );
      
       
      default:
        return (
          <span className="text-xs text-yellow-600 bg-yellow-100 py-1 px-2 rounded">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Dropdown Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Review Subject Assignments</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Select Batch</Label>
            <Select
              value={selectedBatch}
              onValueChange={(value) => {
                setSelectedBatch(value);
                setIsReviewed(false);
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
                setIsReviewed(false);
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
              onClick={handleReviewAssignments}
              disabled={!isSelectionValid}
              className={`mt-4 px-6 py-2 rounded transition-all ${isSelectionValid
                ? ''
                : 'bg-gray-400 cursor-not-allowed text-white-500'
                }`}
            >
              Review Assignments
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Subjects & Approval Status */}
      {isReviewed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assigned Subjects for {selectedBatch} - {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="font-medium text-sm">Batch Approval Status: {getBatchApprovalStatusBadge(approvalStatus)}</p>
            </div>
            {allSubjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">yet to be approved</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {allSubjects.map((subject) => (
                  <div
                    key={subject.subjectCode}
                    className="border rounded-md p-4 shadow-sm"
                  >
                    <p className="text-sm font-semibold ">
                      {subject.subjectCode} - {subject.subjectName}
                    </p>
                    <p className="text-sm ">
                      <span className="font-medium">Lecturer:</span> {subject.lecturer}
                    </p>
                    <p className="text-xs italic">{subject.type.toUpperCase()} Subject</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}




