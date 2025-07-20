"use client";

import { useEffect, useState } from 'react';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllocationsByYearOptions,
  getYearsWithBatchesOptions,
  updateAllocationsMutation,
  getAllUsersOptions
} from '@/app/client/@tanstack/react-query.gen';
import type { FacultySubjectAllocationResponse } from '@/app/client/types.gen';
import { toast } from 'sonner';

const subjectTypes = [
  { value: 'CORE', label: 'Core Subject' },
  { value: 'ELECTIVE', label: 'Elective Subject' },
  { value: 'LAB', label: 'Laboratory' },
  { value: 'PROJECT', label: 'Project' },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'CORE': return 'bg-blue-200 border border-blue-400 text-blue-900';
    case 'ELECTIVE': return 'bg-green-200 border border-green-400 text-green-900';
    case 'LAB': return 'bg-purple-200 border border-purple-400 text-purple-900';
    case 'PROJECT': return 'bg-orange-200 border border-orange-400 text-orange-900';
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'modified': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'approved': return 'Approved';
    case 'pending': return 'Pending';
    case 'modified': return 'Modified';
    default: return 'Unknown';
  }
};

export default function HODApproveModifyPage() {
  const { selectedYear, selectedBatch } = useYearBatch();
  const [allocations, setAllocations] = useState<FacultySubjectAllocationResponse[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FacultySubjectAllocationResponse | null>(null);

  const queryClient = useQueryClient();

  // Fetch academic years to get year_id
  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  // Fetch users for faculty selection
  const { data: usersData, isLoading: isUsersLoading } = useQuery(getAllUsersOptions());
  const facultyUsers = usersData?.filter(u => u.role === 'FACULTY') || [];

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

  // Update local state when data is fetched
  useEffect(() => {
    if (allocationsData?.allocations) {
      setAllocations(allocationsData.allocations);
    }
  }, [allocationsData]);

  // Filter allocations by selected batch
  const filteredAllocations = selectedBatch
    ? allocations.filter(a => a.batch_section === selectedBatch.section)
    : allocations;

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditForm(filteredAllocations[idx]);
  };

  const handleEditChange = (field: keyof FacultySubjectAllocationResponse, value: any) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: value });
  };

  const handleEditSave = async () => {
    if (editingIdx !== null && editForm) {
      try {
        await updateAllocationMutation.mutateAsync({
          body: {
            allocation_id: editForm.allocation_id,
            faculty_id: editForm.faculty_id,
            co_faculty_id: editForm.co_faculty_id,
            venue: editForm.venue
          },
        });

        toast.success('Allocation updated successfully');
        await queryClient.invalidateQueries({
          queryKey: getAllocationsByYearOptions({ path: { year_id: yearId! } }).queryKey,
        });

        setEditingIdx(null);
        setEditForm(null);
      } catch (err) {
        console.error('Failed to update allocation:', err);
        toast.error('Failed to update allocation');
      }
    }
  };

  const handleEditCancel = () => {
    setEditingIdx(null);
    setEditForm(null);
  };




  const handleApproveAll = async () => {
    try {
      const promises = filteredAllocations.map(allocation => 
        updateAllocationMutation.mutateAsync({
          body: {
            allocation_id: allocation.allocation_id,
            faculty_id: allocation.faculty_id,
            co_faculty_id: allocation.co_faculty_id,
            venue: allocation.venue
          }
        })
      );

      await Promise.all(promises);
      toast.success('All allocations approved successfully');
      await queryClient.invalidateQueries({
        queryKey: getAllocationsByYearOptions({ path: { year_id: yearId! } }).queryKey,
      });
    } catch (error) {
      console.error('Error approving all allocations:', error);
      toast.error('Failed to approve all allocations');
    }
  };



  if (!yearId || !selectedBatch?.batch_id) {
    return (
      <div className="space-y-8 mx-auto p-6 max-w-5xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 bg-amber-50 p-4 border border-amber-200 rounded-lg text-amber-600">
              <span>Please select an academic year and batch to view allocations.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8 mx-auto p-6 max-w-5xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading allocations...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="space-y-8 mx-auto p-6 max-w-5xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 bg-red-50 p-4 border border-red-200 rounded-lg text-red-600">
              <span>Error loading allocations. Please try again.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-auto p-6 max-w-7xl">
      <h2 className="mb-6 font-bold text-2xl text-center">Approve or Modify Assignments</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            All Subject Assignments - {selectedBatch?.section} ({selectedYear})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAllocations.length === 0 ? (
            <div className="py-8 text-muted-foreground text-center">
              No allocations found for the selected year and batch.
            </div>
          ) : (
            <>
              <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                {filteredAllocations.map((allocation, idx) => (
                  <div
                    key={allocation.allocation_id}
                    className="relative flex flex-col gap-2 bg-muted/50 shadow-sm hover:shadow-lg p-4 border-2 border-primary/30 rounded-lg transition-all"
                  >
                    <button
                      className="top-2 right-2 z-10 absolute text-primary hover:text-primary/80"
                      onClick={() => handleEdit(idx)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-gray-100 px-2 py-1 border border-gray-200 rounded font-mono text-white dark:text-black text-xs">
                        {allocation.subject_code}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(allocation.subject_type)}`}>
                        {getTypeLabel(allocation.subject_type)}
                      </span>
                    </div>
                    <div className="font-semibold text-base">{allocation.subject_name}</div>
                    <div className="text-muted-foreground text-sm">
                      <span className="font-medium">Faculty:</span> {allocation.faculty_name}
                    </div>
                    {allocation.co_faculty_id && (
                      <div className="text-muted-foreground text-sm">
                        <span className="font-medium">Co-Faculty:</span> {allocation.co_faculty_id}
                      </div>
                    )}
                    <div className="text-muted-foreground text-sm">
                      <span className="font-medium">Venue:</span> {allocation.venue || 'Not assigned'}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      <span className="font-medium">Batch:</span> {allocation.batch_section} ({allocation.batch_noOfStudent} students)
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
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    'Approve All'
                  )}
                </Button>
               
              </div>
            </>
          )}

          {/* Edit Modal - Updated with proper form fields */}
          {editingIdx !== null && editForm && (
            <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
              <Card className="mx-4 w-full max-w-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Edit Allocation</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditCancel}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject Name</Label>
                    <Input value={editForm.subject_name} disabled />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Subject Code</Label>
                    <Input value={editForm.subject_code} disabled />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Subject Type</Label>
                    <Input value={editForm.subject_type} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label>Faculty</Label>
                    <Select
                      value={editForm.faculty_id?.toString()}
                      onValueChange={(val) => handleEditChange('faculty_id', Number(val))}
                      disabled={isUsersLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a faculty member" />
                      </SelectTrigger>
                      <SelectContent>
                        {facultyUsers.map(user => (
                          <SelectItem key={user.user_id} value={user.user_id.toString()}>
                            {user.uname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Co-Faculty</Label>
                    <Select
                      value={editForm.co_faculty_id?.toString() ?? ''}
                      onValueChange={(val) =>
                        handleEditChange('co_faculty_id', val === 'none' ? null : Number(val))
                      }
                      disabled={isUsersLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a co-faculty (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {facultyUsers.map(user => (
                          <SelectItem key={user.user_id} value={user.user_id.toString()}>
                            {user.uname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Input
                      placeholder="Enter venue"
                      value={editForm.venue ?? ''}
                      onChange={(e) => handleEditChange('venue', e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      className="flex-1" 
                      onClick={handleEditSave}
                      disabled={updateAllocationMutation.isPending}
                    >
                      {updateAllocationMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleEditCancel}>
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
