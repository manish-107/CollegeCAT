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
import { Pencil, X, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  autoAllocateSubjectsForYearMutation,
  getYearsWithBatchesOptions
} from '@/app/client/@tanstack/react-query.gen';
import type { FacultySubjectAllocationResponse } from '@/app/client/types.gen';

const subjectTypes = [
  { value: 'CORE', label: 'Core Subject' },
  { value: 'ELECTIVE', label: 'Elective Subject' },
  { value: 'LAB', label: 'Laboratory' },
  { value: 'PROJECT', label: 'Project' },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'CORE': return 'bg-blue-100 text-blue-800';
    case 'ELECTIVE': return 'bg-green-100 text-green-800';
    case 'LAB': return 'bg-purple-100 text-purple-800';
    case 'PROJECT': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'CORE': return 'Core';
    case 'ELECTIVE': return 'Elective';
    case 'LAB': return 'Lab';
    case 'PROJECT': return 'Project';
    default: return 'Unknown';
  }
};

export default function AutoAssignmentPage() {
  const { selectedYear, selectedBatch, batches } = useYearBatch();
  const [allocations, setAllocations] = useState<FacultySubjectAllocationResponse[]>([]);
  const [isSentToHod, setIsSentToHod] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FacultySubjectAllocationResponse | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch academic years to get year_id
  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  // Auto allocate mutation
  const autoAllocateMutation = useMutation(autoAllocateSubjectsForYearMutation());

  // Filter allocations by selected batch
  const filteredAllocations = selectedBatch 
    ? allocations.filter(allocation => allocation.batch_section === selectedBatch.section)
    : allocations;

  const handleAutoAssign = async () => {
    if (!yearId) {
      return;
    }

    try {
      const result = await autoAllocateMutation.mutateAsync({
        path: { year_id: yearId }
      });

      setAllocations(result.allocations || []);
      setSuccess(`Successfully allocated ${result.total_allocations} subjects to lecturers`);
    } catch (error: any) {
      console.error('Error in auto assignment:', error);
      // Error handling is managed by the mutation
    }
  };

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditForm(allocations[idx]);
  };

  const handleEditChange = (field: keyof FacultySubjectAllocationResponse, value: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: value });
  };

  const handleEditSave = () => {
    if (editingIdx !== null && editForm) {
      const updated = [...allocations];
      updated[editingIdx] = editForm;
      setAllocations(updated);
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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Auto Subject Assignment &amp; Send to HOD</h2>
      
      {/* Year Context */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Current Context</h3>
              <div className="text-sm text-blue-700 mt-1">
                <span className="font-medium">Academic Year:</span> {selectedYear || 'Not selected'}
              </div>
              {selectedBatch && (
                <div className="text-sm text-blue-700 mt-1">
                  <span className="font-medium">Selected Batch:</span> {selectedBatch.section} ({selectedBatch.noOfStudent} students)
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600">Auto assignment based on lecturer priorities</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {autoAllocateMutation.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-700">
              <strong>Error:</strong> Failed to auto assign subjects. Please try again.
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-green-700">
              <strong>Success:</strong> {success}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto Assign Button */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Auto Assignment Batch {selectedBatch ? ` ${selectedBatch.section}` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Click the button below to automatically assign subjects to lecturers based on their priority selections.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This will process all lecturer priorities and create optimal assignments.
              </p>
            </div>
            <Button
              onClick={handleAutoAssign}
              disabled={!yearId || autoAllocateMutation.isPending}
              className="flex items-center gap-2"
            >
              {autoAllocateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Auto Assigning...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Auto Assign Subjects{selectedBatch ? ` - ${selectedBatch.section}` : ''}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Allocated Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Allocated Subjects ({filteredAllocations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAllocations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                {selectedBatch 
                  ? `No subjects have been allocated for batch ${selectedBatch.section} yet.`
                  : 'No subjects have been allocated yet.'
                }
              </p>
              <p className="text-sm">Click "Auto Assign Subjects" to start the allocation process.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAllocations.map((allocation, idx) => (
                <div
                  key={allocation.allocation_id}
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
                      {allocation.subject_code}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(allocation.subject_type)}`}>
                      {getTypeLabel(allocation.subject_type)}
                    </span>
                  </div>
                  
                  <div className="font-semibold text-base">{allocation.subject_name}</div>
                  <div className="text-xs text-muted-foreground">Abbr: {allocation.abbreviation}</div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div><span className="font-medium">Lecturer:</span> {allocation.faculty_name}</div>
                    <div className="text-xs">{allocation.faculty_email}</div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div><span className="font-medium">Batch:</span> {allocation.batch_section} ({allocation.batch_noOfStudent} students)</div>
                    <div><span className="font-medium">Priority:</span> {allocation.allocated_priority}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit Allocation Modal */}
          {editingIdx !== null && editForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Edit Allocation</CardTitle>
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
                      value={editForm.subject_name}
                      onChange={(e) => handleEditChange('subject_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-subject-code">Subject Code</Label>
                    <Input
                      id="edit-subject-code"
                      placeholder="e.g., CS101, MATH201"
                      value={editForm.subject_code}
                      onChange={(e) => handleEditChange('subject_code', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lecturer">Lecturer Name</Label>
                    <Input
                      id="edit-lecturer"
                      placeholder="Enter lecturer name"
                      value={editForm.faculty_name}
                      onChange={(e) => handleEditChange('faculty_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lecturer-email">Lecturer Email</Label>
                    <Input
                      id="edit-lecturer-email"
                      placeholder="Enter lecturer email"
                      value={editForm.faculty_email}
                      onChange={(e) => handleEditChange('faculty_email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-subject-type">Subject Type</Label>
                    <Select
                      value={editForm.subject_type}
                      onValueChange={(value: string) => handleEditChange('subject_type', value)}
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
                        !editForm.subject_name.trim() ||
                        !editForm.subject_code.trim() ||
                        !editForm.faculty_name.trim() ||
                        !editForm.subject_type
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
                disabled={allocations.length === 0}
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
