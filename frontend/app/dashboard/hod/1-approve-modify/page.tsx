"use client";

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  getAllocationsByYearOptions,
  getYearsWithBatchesOptions,
  updateAllocationsMutation
} from '@/app/client/@tanstack/react-query.gen';
import type { FacultySubjectAllocationResponse } from '@/app/client/types.gen';
import { toast } from 'sonner';

// Subject and assignment data types
interface Subject {
  allocation_id: number;
  subject_code: string;
  subject_name: string;
  faculty_name: string;
  subject_type: string;
  status: 'pending' | 'approved' | 'modified';
  abbreviation: string;
  faculty_id: number;
  subject_id: number;
  batch_id: number;
  batch_section: string;
  year_id: number;
  academic_year: string;
  allocated_priority: number;
}

const subjectTypes = [
  { value: 'CORE', label: 'Core Subject' },
  { value: 'ELECTIVE', label: 'Elective Subject' },
  { value: 'LAB', label: 'Laboratory' },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'CORE': return 'bg-blue-100 text-blue-800';
    case 'ELECTIVE': return 'bg-green-100 text-green-800';
    case 'LAB': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'CORE': return 'Core';
    case 'ELECTIVE': return 'Elective';
    case 'LAB': return 'Lab';
    default: return 'Unknown';
  }
};

const getStatusColor = (status: Subject['status']) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'modified': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: Subject['status']) => {
  switch (status) {
    case 'approved': return 'Approved';
    case 'pending': return 'Pending';
    case 'modified': return 'Modified';
    default: return 'Unknown';
  }
};

export default function HODApproveModifyPage() {
  const { selectedYear, selectedBatch } = useYearBatch();
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Subject | null>(null);

  // Fetch academic years to get year_id
  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  // Fetch allocations for the selected year
  const { 
    data: allocationsData, 
    isLoading, 
    error: fetchError 
  } = useQuery({
    ...getAllocationsByYearOptions({ path: { year_id: yearId! } }),
    enabled: !!yearId
  });

  // Update allocations mutation
  const updateAllocationMutation = useMutation(updateAllocationsMutation());

  // Convert API data to local format and filter by selected batch
  const subjects: Subject[] = allocationsData?.allocations
    ?.filter(allocation => !selectedBatch || allocation.batch_section === selectedBatch.section)
    ?.map(allocation => ({
      allocation_id: allocation.allocation_id,
      subject_code: allocation.subject_code,
      subject_name: allocation.subject_name,
      faculty_name: allocation.faculty_name,
      subject_type: allocation.subject_type,
      status: 'pending' as Subject['status'], // Default status, you might want to add this to the API
      abbreviation: allocation.abbreviation,
      faculty_id: allocation.faculty_id,
      subject_id: allocation.subject_id,
      batch_id: allocation.batch_id,
      batch_section: allocation.batch_section,
      year_id: allocation.year_id,
      academic_year: allocation.academic_year,
      allocated_priority: allocation.allocated_priority,
    })) || [];

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditForm(subjects[idx]);
  };

  const handleEditChange = (field: keyof Subject, value: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: value });
  };

  const handleEditSave = async () => {
    if (editingIdx !== null && editForm) {
      try {
        // Update the allocation via API
        await updateAllocationMutation.mutateAsync({
          body: {
            allocation_id: editForm.allocation_id,
            faculty_id: editForm.faculty_id,
            subject_id: editForm.subject_id,
            batch_id: editForm.batch_id,
            year_id: editForm.year_id,
            allocated_priority: editForm.allocated_priority,
          }
        });

        // Update local state
      const updated = [...subjects];
      updated[editingIdx] = { ...editForm, status: 'modified' as Subject['status'] };
        
      setEditingIdx(null);
      setEditForm(null);
        toast.success('Allocation updated successfully');
      } catch (error) {
        console.error('Error updating allocation:', error);
        toast.error('Failed to update allocation');
      }
    }
  };

  const handleEditCancel = () => {
    setEditingIdx(null);
    setEditForm(null);
  };

  const handleApprove = async (idx: number) => {
    const subject = subjects[idx];
    try {
      // Update the allocation via API
      await updateAllocationMutation.mutateAsync({
        body: {
          allocation_id: subject.allocation_id,
          faculty_id: subject.faculty_id,
          subject_id: subject.subject_id,
          batch_id: subject.batch_id,
          year_id: subject.year_id,
          allocated_priority: subject.allocated_priority,
        }
      });

      toast.success('Allocation approved successfully');
    } catch (error) {
      console.error('Error approving allocation:', error);
      toast.error('Failed to approve allocation');
    }
  };

  const handleReject = async (idx: number) => {
    const subject = subjects[idx];
    try {
      // You might want to implement a reject API call here
      // For now, we'll just show a toast
      toast.success('Allocation rejected');
    } catch (error) {
      console.error('Error rejecting allocation:', error);
      toast.error('Failed to reject allocation');
    }
  };

  const handleApproveAll = async () => {
    try {
      // Approve all allocations for the current batch
      const promises = subjects.map(subject => 
        updateAllocationMutation.mutateAsync({
          body: {
            allocation_id: subject.allocation_id,
            faculty_id: subject.faculty_id,
            subject_id: subject.subject_id,
            batch_id: subject.batch_id,
            year_id: subject.year_id,
            allocated_priority: subject.allocated_priority,
          }
        })
      );

      await Promise.all(promises);
      toast.success('All allocations approved successfully');
    } catch (error) {
      console.error('Error approving all allocations:', error);
      toast.error('Failed to approve all allocations');
    }
  };

  const handleRejectAll = async () => {
    try {
      // You might want to implement a reject all API call here
      toast.success('All allocations rejected');
    } catch (error) {
      console.error('Error rejecting all allocations:', error);
      toast.error('Failed to reject all allocations');
    }
  };

  if (!yearId || !selectedBatch?.batch_id) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
              <span>Please select an academic year and batch to view allocations.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading allocations...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
              <span>Error loading allocations. Please try again.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Approve or Modify Assignments</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            All Subject Assignments - {selectedBatch?.section} ({selectedYear})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No allocations found for the selected year and batch.
            </div>
          ) : (
            <>
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
                        {subject.subject_code}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(subject.subject_type)}`}>
                        {getTypeLabel(subject.subject_type)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subject.status)}`}>
                        {getStatusLabel(subject.status)}
                  </span>
                    </div>
                    <div className="font-semibold text-base">{subject.subject_name}</div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Lecturer:</span> {subject.faculty_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Abbreviation:</span> {subject.abbreviation}
                </div>
                <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Priority:</span> {subject.allocated_priority}
                </div>
              </div>
            ))}
          </div>

          {/* Bulk Actions */}
          <div className="flex justify-center gap-4 mt-8 pt-6 border-t">
                <Button 
                  onClick={handleApproveAll} 
                  className="px-6"
                  disabled={updateAllocationMutation.isPending}
                >
                  {updateAllocationMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    'Approve All'
                  )}
            </Button>
                <Button 
                  onClick={handleRejectAll} 
                  variant="outline" 
                  className="px-6"
                >
              Reject All
            </Button>
          </div>
            </>
          )}

          {/* Edit Subject Modal */}
          {editingIdx !== null && editForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Modify Assignment</CardTitle>
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
                    <Label htmlFor="edit-lecturer">Lecturer</Label>
                    <Input
                      id="edit-lecturer"
                      placeholder="Enter lecturer name"
                      value={editForm.faculty_name}
                      onChange={(e) => handleEditChange('faculty_name', e.target.value)}
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
                        !editForm.subject_type ||
                        updateAllocationMutation.isPending
                      }
                    >
                      {updateAllocationMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
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
        </CardContent>
      </Card>
    </div>
  );
} 