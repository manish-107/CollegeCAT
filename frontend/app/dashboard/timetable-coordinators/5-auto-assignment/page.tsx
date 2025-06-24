'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Subject and assignment data types
interface Subject {
  subjectCode: string;
  subjectName: string;
  lecturer: string;
  type: 'core' | 'elective';
}

// Flattened subject assignments for all batches/years
const initialSubjects: Subject[] = [
  { subjectCode: 'MCA101', subjectName: 'Advanced Programming', lecturer: 'Dr. Anita Sharma', type: 'core' },
  { subjectCode: 'MCA102', subjectName: 'Database Systems', lecturer: 'Dr. Rajiv Verma', type: 'core' },
  { subjectCode: 'MCA201', subjectName: 'Blockchain', lecturer: 'Dr. Anita Sharma', type: 'elective' },
  { subjectCode: 'MCA202', subjectName: 'AI & NLP', lecturer: 'Dr. Megha Rao', type: 'elective' },
  { subjectCode: 'MCA301', subjectName: 'Software Engineering', lecturer: 'Prof. Rakesh Patel', type: 'core' },
  { subjectCode: 'MCA302', subjectName: 'Operating Systems', lecturer: 'Dr. Rajiv Verma', type: 'core' },
  { subjectCode: 'MCA401', subjectName: 'Cloud Computing', lecturer: 'Dr. Anita Sharma', type: 'elective' },
  { subjectCode: 'MCA402', subjectName: 'Machine Learning', lecturer: 'Dr. Megha Rao', type: 'elective' },
  { subjectCode: 'MCB101', subjectName: 'Computer Networks', lecturer: 'Dr. Rajiv Verma', type: 'core' },
  { subjectCode: 'MCB102', subjectName: 'Compiler Design', lecturer: 'Prof. Rakesh Patel', type: 'core' },
  { subjectCode: 'MCB201', subjectName: 'Data Mining', lecturer: 'Dr. Megha Rao', type: 'elective' },
  { subjectCode: 'MCB202', subjectName: 'Cyber Security', lecturer: 'Dr. Anita Sharma', type: 'elective' },
  { subjectCode: 'MCB301', subjectName: 'Advanced Java', lecturer: 'Dr. Anita Sharma', type: 'core' },
  { subjectCode: 'MCB302', subjectName: 'Web Technologies', lecturer: 'Dr. Rajiv Verma', type: 'core' },
  { subjectCode: 'MCB401', subjectName: 'IoT & Sensors', lecturer: 'Dr. Megha Rao', type: 'elective' },
  { subjectCode: 'MCB402', subjectName: 'Big Data Analytics', lecturer: 'Prof. Rakesh Patel', type: 'elective' },
];

const subjectTypes = [
  { value: 'core', label: 'Core Subject' },
  { value: 'elective', label: 'Elective Subject' },
];

const getTypeColor = (type: Subject['type']) => {
  switch (type) {
    case 'core': return 'bg-blue-100 text-blue-800';
    case 'elective': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeLabel = (type: Subject['type']) => {
  switch (type) {
    case 'core': return 'Core';
    case 'elective': return 'Elective';
    default: return 'Unknown';
  }
};

export default function AutoAssignmentPage() {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [isSentToHod, setIsSentToHod] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Subject | null>(null);

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditForm(subjects[idx]);
  };

  const handleEditChange = (field: keyof Subject, value: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: value });
  };

  const handleEditSave = () => {
    if (editingIdx !== null && editForm) {
      const updated = [...subjects];
      updated[editingIdx] = editForm;
      setSubjects(updated);
      setEditingIdx(null);
      setEditForm(null);
    }
  };

  const handleEditCancel = () => {
    setEditingIdx(null);
    setEditForm(null);
  };

  const handleSendToHod = () => {
    setIsSentToHod(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Auto Subject Assignment &amp; Send to HOD</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">All Assigned Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {subjects.map((subject, idx) => (
              <div
                key={idx}
                className="border-2 border-primary/30 rounded-lg p-4 bg-muted/50 shadow-sm hover:shadow-lg transition-all flex flex-col gap-2 relative"
              >
                <button
                  className="absolute top-2 right-2 text-primary hover:text-primary/80 z-10"
                  onClick={() => handleEdit(idx)}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700">
                    {subject.subjectCode}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(subject.type)}`}>{getTypeLabel(subject.type)}</span>
                </div>
                <div className="font-semibold text-base">{subject.subjectName}</div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Lecturer:</span> {subject.lecturer}
                </div>
              </div>
            ))}
          </div>

          {/* Edit Subject Modal */}
          {editingIdx !== null && editForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Edit Subject</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditCancel}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-subject-name">Subject Name</Label>
                    <Input
                      id="edit-subject-name"
                      placeholder="Enter subject name"
                      value={editForm.subjectName}
                      onChange={(e) => handleEditChange('subjectName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-subject-code">Subject Code</Label>
                    <Input
                      id="edit-subject-code"
                      placeholder="e.g., CS101, MATH201"
                      value={editForm.subjectCode}
                      onChange={(e) => handleEditChange('subjectCode', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lecturer">Lecturer</Label>
                    <Input
                      id="edit-lecturer"
                      placeholder="Enter lecturer name"
                      value={editForm.lecturer}
                      onChange={(e) => handleEditChange('lecturer', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-subject-type">Subject Type</Label>
                    <Select
                      value={editForm.type}
                      onValueChange={(value: Subject['type']) => handleEditChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleEditSave}
                      className="flex-1"
                      disabled={
                        !editForm.subjectName.trim() ||
                        !editForm.subjectCode.trim() ||
                        !editForm.lecturer.trim() ||
                        !editForm.type
                      }
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleEditCancel}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end mt-8">
            {!isSentToHod ? (
              <Button
                onClick={handleSendToHod}
              >
                Send All Assignments to HOD
              </Button>
            ) : (
              <span className="text-green-600 font-semibold text-lg">Sent to HOD successfully!</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
