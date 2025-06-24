'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Send } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'core' | 'elective' | 'lab' | 'project';
}

export default function CreatePriorityFormPage() {
  const [deadline, setDeadline] = useState('');
  const [formSent, setFormSent] = useState(false);

  // Mock subjects data - in real app this would come from the subjects management page
  const subjects: Subject[] = [
    { id: '1', name: 'Data Structures', code: 'CS101', type: 'core' },
    { id: '2', name: 'Algorithms', code: 'CS102', type: 'core' },
    { id: '3', name: 'Database Management', code: 'CS201', type: 'core' },
    { id: '4', name: 'Computer Networks', code: 'CS202', type: 'core' },
    { id: '5', name: 'Artificial Intelligence', code: 'CS301', type: 'elective' },
    { id: '6', name: 'Machine Learning', code: 'CS302', type: 'elective' },
    { id: '7', name: 'Software Engineering Lab', code: 'CS401', type: 'lab' },
    { id: '8', name: 'Final Year Project', code: 'CS501', type: 'project' },
    { id: '9', name: 'Operating Systems', code: 'CS203', type: 'core' },
    { id: '10', name: 'Web Development', code: 'CS303', type: 'elective' },
  ];

  const getTypeColor = (type: Subject['type']) => {
    switch (type) {
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'elective': return 'bg-green-100 text-green-800';
      case 'lab': return 'bg-purple-100 text-purple-800';
      case 'project': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: Subject['type']) => {
    switch (type) {
      case 'core': return 'Core';
      case 'elective': return 'Elective';
      case 'lab': return 'Lab';
      case 'project': return 'Project';
      default: return 'Unknown';
    }
  };

  const handleSubmitForm = () => {
    if (deadline) {
      console.log('Priority form submitted with deadline:', deadline);
    setFormSent(true);
    }
  };

  const handleResetForm = () => {
    setFormSent(false);
    setDeadline('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Create Subject Priority Form</h2>
        <div className="text-sm text-muted-foreground">
          Total Subjects: {subjects.length}
        </div>
      </div>

          {formSent ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
            <div className="bg-green-100 text-green-700 p-4 rounded-md">
                ✅ Priority form has been sent to lecturers successfully!
              </div>
              <p className="text-muted-foreground">
                Deadline: {deadline}
              </p>
              <Button onClick={handleResetForm} variant="outline">
                Create New Form
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Deadline Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Set Priority Form Deadline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="deadline">Submission Deadline</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full max-w-md"
                />
                <p className="text-sm text-muted-foreground">
                  Select the deadline by which lecturers must submit their subject preferences.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subjects List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Subjects for Priority Selection</CardTitle>
              <p className="text-sm text-muted-foreground">
                These subjects will be included in the priority form sent to lecturers.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                  >
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{subject.code}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(subject.type)}`}>
                        {getTypeLabel(subject.type)}
                      </span>
                    </div>
                        </div>
                      ))}
                    </div>
            </CardContent>
          </Card>

          {/* Submit Form */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Ready to Send Priority Form</h3>
                  <p className="text-sm text-muted-foreground">
                    {deadline ? `Deadline: ${deadline}` : 'Please set a deadline first'}
                  </p>
                </div>
                <Button 
                  onClick={handleSubmitForm}
                  disabled={!deadline}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Priority Form
              </Button>
              </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}