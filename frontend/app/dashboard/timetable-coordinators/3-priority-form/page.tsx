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
import { toast } from 'sonner';

export default function CreatePriorityFormPage() {
  const { selectedYear } = useYearBatch();
  const [deadline, setDeadline] = useState('');

  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

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

  const handleSubmitForm = async () => {
    if (!deadline) return;

    const message = `Please fill priority form. Deadline: ${new Date(deadline).toLocaleString()}`;
    const notification = {
      notification: message,
      date: new Date().toISOString(),
      role: "FACULTY"
    };

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send notification');
      }

      toast.success('Notification sent to faculty successfully!');
    } catch (error: any) {
      console.error('Error sending notification:', error.message);
      toast.error('Failed to send notification');
    }
  };

  return (
    <div className="space-y-8 mx-auto px-6 py-8 max-w-6xl">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-3xl tracking-tight">Create Subject Priority Form</h2>
        <div className="text-muted-foreground text-sm">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading subjects...</span>
            </div>
          ) : (
            <span>Total Subjects: {subjects.length}</span>
          )}
        </div>
      </div>

      {fetchError && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="font-medium text-red-700">
              ⚠️ Failed to fetch subjects. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Deadline Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            Set Priority Form Deadline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="deadline">Submission Deadline</Label>
          <Input
            id="deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="max-w-sm"
          />
          <p className="text-muted-foreground text-sm">
            Select the deadline by which lecturers must submit their subject preferences.
          </p>
        </CardContent>
      </Card>

      {/* Subjects Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Subjects</CardTitle>
          <p className="text-muted-foreground text-sm">
            These subjects will be included in the priority form.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          ) : subjects.length === 0 ? (
            <div className="py-6 text-muted-foreground text-center">
              <p>No subjects found for the selected academic year.</p>
            </div>
          ) : (
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <div
                  key={subject.subject_id}
                  className="bg-card shadow-sm hover:shadow-md p-4 border rounded-lg transition-shadow"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground text-base">{subject.subject_name}</h3>
                    <p className="font-mono text-muted-foreground text-sm">{subject.subject_code}</p>
                    <p className="text-muted-foreground text-xs">Abbr: {subject.abbreviation}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${getTypeColor(subject.subject_type)}`}>
                        {getTypeLabel(subject.subject_type)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {subject.no_of_hours_required} hrs
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Section */}
      <Card>
        <CardContent className="flex justify-between items-center py-6">
          <div>
            <h3 className="font-semibold text-base">Ready to Send?</h3>
            <p className="text-muted-foreground text-sm">
              {deadline ? `Deadline: ${new Date(deadline).toLocaleString()}` : 'Please set a deadline.'}
            </p>
            <p className="text-muted-foreground text-sm">
              {subjects.length > 0 ? `${subjects.length} subjects included.` : 'No subjects available.'}
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
        </CardContent>
      </Card>
    </div>
  );
}
