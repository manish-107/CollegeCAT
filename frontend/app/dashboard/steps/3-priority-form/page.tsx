'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input'; // Optional for search functionality

type FormData = {
  academicYear: string;
  batch: string;
  coreSubjects: string[];
  electiveSubjects: string[];
  deadline: string;
};

type SubjectData = {
  core: string[];
  electives: string[];
};

type MockSubjects = {
  [batch: string]: {
    [year: string]: SubjectData;
  };
};

const mockSubjects: MockSubjects = {
  'CSE-B': {
    '2024-2025': {
      core: ['Data Structures', 'Algorithms', 'Operating Systems'],
      electives: ['Artificial Intelligence', 'Machine Learning', 'Cloud Computing'],
    },
    '2025-2026': {
      core: ['Database Management', 'Computer Networks', 'Software Engineering'],
      electives: ['Cyber Security', 'Blockchain', 'Virtual Reality'],
    },
  },
  'CSE-A': {
    '2024-2025': {
      core: ['Discrete Mathematics', 'Linear Algebra', 'Computer Architecture'],
      electives: ['Data Science', 'Internet of Things', 'Mobile Development'],
    },
    '2025-2026': {
      core: ['Compilers', 'Advanced Programming', 'Network Security'],
      electives: ['Cloud Computing', 'Machine Learning', 'Game Development'],
    },
  },
};

export default function CreatePriorityFormPage() {
  const { register, handleSubmit, setValue, watch } = useForm<FormData>();
  const [formSent, setFormSent] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectData>({
    core: [],
    electives: [],
  });
  const [searchQuery, setSearchQuery] = useState('');

  const selectedBatch = watch('batch');
  const selectedYear = watch('academicYear');

  const batchNames = Object.keys(mockSubjects);

  const academicYears = selectedBatch ? Object.keys(mockSubjects[selectedBatch]) : [];

  useEffect(() => {
    if (selectedBatch && selectedYear) {
      const subjects = mockSubjects[selectedBatch]?.[selectedYear];
      if (subjects) {
        setAvailableSubjects(subjects);
      } else {
        setAvailableSubjects({ core: [], electives: [] });
      }
    }
  }, [selectedBatch, selectedYear]);

  const filteredCoreSubjects = availableSubjects.core.filter((subject) =>
    subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredElectiveSubjects = availableSubjects.electives.filter((subject) =>
    subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
    setFormSent(true);
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Create Subject Priority Form</CardTitle>
        </CardHeader>
        <CardContent>
          {formSent ? (
            <div className="bg-green-100 text-green-700 p-4 rounded-md">
              ✅ Form has been sent to lecturers.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Select
                    onValueChange={(value) => setValue('academicYear', value)}
                    disabled={!selectedBatch}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Academic Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor="batch">Batch Name</Label>
                  <Select
                    onValueChange={(value) => setValue('batch', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batchNames.map((batch) => (
                        <SelectItem key={batch} value={batch}>
                          {batch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(!selectedBatch || !selectedYear) && (
                <p className="text-sm italic">
                  Select a valid batch and year to view subjects.
                </p>
              )}

              {selectedBatch && selectedYear && (filteredCoreSubjects.length > 0 || filteredElectiveSubjects.length > 0) && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <Label htmlFor="coreSubjects">Core Subjects</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredCoreSubjects.map((subject) => (
                        <div
                          key={subject}
                          className="border rounded-md p-2 text-sm "
                        >
                          {subject}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2" >
                    <Label htmlFor="electiveSubjects">Elective Subjects</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredElectiveSubjects.map((subject) => (
                        <div
                          key={subject}
                          className="border rounded-md p-2 text-sm "
                        >
                          {subject}
                        </div>
                      ))}
                    </div>
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="deadline">Select Deadline</Label>
                    <Input
                      type="date"
                      {...register('deadline', { required: true })}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full mt-4">
                Save
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
