'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Send, Loader2 } from 'lucide-react';
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';
import { useQuery } from '@tanstack/react-query';
import { 
  getSubjectsByYearOptions,
  getYearsWithBatchesOptions
} from '@/app/client/@tanstack/react-query.gen';
import type { SubjectResponse, SubjectTypeEnum } from '@/app/client/types.gen';

export default function CreatePriorityFormPage() {
  const { selectedYear } = useYearBatch();
  const [deadline, setDeadline] = useState('');
  const [formSent, setFormSent] = useState(false);

  // Fetch academic years to get year_id
  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  // Fetch subjects for the selected year
  const { 
    data: subjectsData, 
    isLoading: loading, 
    error: fetchError 
  } = useQuery({
    ...getSubjectsByYearOptions({ path: { year_id: yearId! } }),
    enabled: !!yearId
  });

  const subjects = subjectsData?.subjects || [];

  const getTypeColor = (type: SubjectTypeEnum) => {
    switch (type) {
      case 'CORE': return 'bg-blue-100 text-blue-800';
      case 'ELECTIVE': return 'bg-green-100 text-green-800';
      case 'LAB': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: SubjectTypeEnum) => {
    switch (type) {
      case 'CORE': return 'Core';
      case 'ELECTIVE': return 'Elective';
      case 'LAB': return 'Lab';
      default: return 'Unknown';
    }
  };

  const handleSubmitForm = () => {
    if (deadline) {
      console.log('Priority form submitted with deadline:', deadline);
      console.log('Subjects included:', subjects);
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
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading subjects...
            </div>
          ) : (
            `Total Subjects: ${subjects.length}`
          )}
        </div>
      </div>

      {/* Year and Batch Context */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Current Context</h3>
              <div className="text-sm text-blue-700 mt-1">
                <span className="font-medium">Academic Year:</span> {selectedYear || 'Not selected'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600">Subjects loaded from API</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {fetchError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-700">
              <strong>Error:</strong> Failed to fetch subjects. Please try again.
            </div>
          </CardContent>
        </Card>
      )}

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
              <p className="text-sm text-muted-foreground">
                Subjects included: {subjects.length}
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading subjects...</span>
                  </div>
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No subjects available for the selected year.</p>
                  <p className="text-sm">Please make sure subjects are added for this academic year.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map((subject) => (
                    <div
                      key={subject.subject_id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                    >
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{subject.subject_name}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{subject.subject_code}</p>
                        <p className="text-xs text-muted-foreground">Abbr: {subject.abbreviation}</p>
                        <div className="flex items-center justify-between">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(subject.subject_type)}`}>
                            {getTypeLabel(subject.subject_type)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {subject.no_of_hours_required} hours
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  <p className="text-sm text-muted-foreground">
                    {subjects.length > 0 ? `${subjects.length} subjects will be included` : 'No subjects available'}
                  </p>
                </div>
                <Button 
                  onClick={handleSubmitForm}
                  disabled={!deadline || subjects.length === 0 || loading}
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