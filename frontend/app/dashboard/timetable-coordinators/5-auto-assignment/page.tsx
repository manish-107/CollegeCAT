'use client';

import { useEffect, useState } from 'react';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  autoAllocateSubjectsForYearMutation,
  getAllocationsByYearOptions,
  getYearsWithBatchesOptions, updateAllocationsMutation, getAllUsersOptions
} from '@/app/client/@tanstack/react-query.gen';
import type { FacultySubjectAllocationResponse, AllocationUpdateRequest } from '@/app/client/types.gen';
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
    default: return 'bg-gray-200 border border-gray-400 text-gray-800';
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
  const { selectedYear, selectedBatch } = useYearBatch();
  const [allocations, setAllocations] = useState<FacultySubjectAllocationResponse[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FacultySubjectAllocationResponse | null>(null);

  const queryClient = useQueryClient();

  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  const autoAllocateMutation = useMutation(autoAllocateSubjectsForYearMutation());
  const updateAllocationMutation = useMutation(updateAllocationsMutation());

  const { data: usersData, isLoading: isUsersLoading } = useQuery(getAllUsersOptions());
  const facultyUsers = usersData?.filter(u => u.role === 'FACULTY') || [];

  const {
    data: allocationsData,
    isLoading,
    error: fetchError
  } = useQuery({
    ...getAllocationsByYearOptions({ path: { year_id: yearId! } }),
    enabled: !!yearId
  });

  useEffect(() => {
    if (allocationsData?.allocations) {
      setAllocations(allocationsData.allocations);
    }
  }, [allocationsData]);


  const filteredAllocations = selectedBatch
    ? allocations.filter(a => a.batch_section === selectedBatch.section)
    : allocations;



  const handleAutoAssign = async () => {
    if (!yearId) return;

    try {
      const result = await autoAllocateMutation.mutateAsync({ path: { year_id: yearId } });
      await queryClient.invalidateQueries({
        queryKey: getAllocationsByYearOptions({ path: { year_id: yearId } }).queryKey
      });
      toast.success(`Successfully allocated ${result.total_allocations} subjects to faculties`);
    } catch (error) {
      console.error('Error in auto assignment:', error);
      toast.error('Unable to allocate subjects');
    }
  };

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditForm(allocations[idx]);
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

  const handleSendToHod = async () => {
    if (!selectedYear || !selectedBatch) {
      toast.error("Year or Batch not selected");
      return;
    }

    const payload = {
      notification: `Subject allocations have been finalized for ${selectedYear} - ${selectedBatch.section}`,
      date: new Date().toISOString(),
      role: 'HOD',
    };

    try {
      const res = await fetch('/api/notifications?type=hod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('HOD has been notified!');
      } else {
        toast.error('Failed to notify HOD');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    }
  };


  return (
    <div className="space-y-8 mx-auto p-6 max-w-7xl">
      <h2 className="mb-6 font-bold text-2xl text-center">Auto Subject Assignment &amp; Send to HOD</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Zap className="w-5 h-5" />
            Auto Assignment Batch {selectedBatch ? ` ${selectedBatch.section}` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">
                Automatically assign subjects based on faculty preferences.
              </p>
            </div>
            <Button disabled={!yearId || autoAllocateMutation.isPending || allocations.length > 0} onClick={handleAutoAssign} >
              {autoAllocateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Auto Assigning...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" /> Auto Assign
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Allocated Subjects ({filteredAllocations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAllocations.length === 0 ? (
            <p className="py-4 text-muted-foreground text-center">No allocations found.</p>
          ) : (
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredAllocations.map((a, idx) => (
                <div
                  key={a.allocation_id}
                  className="relative bg-muted/50 hover:shadow-lg p-4 border-2 border-primary/30 rounded"
                >
                  <button onClick={() => handleEdit(idx)} className="top-2 right-2 absolute text-primary">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-gray-100 px-2 py-1 border rounded font-mono text-white dark:text-black text-xs">
                      {a.subject_code}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getTypeColor(a.subject_type)}`}>
                      {getTypeLabel(a.subject_type)}
                    </span>
                  </div>
                  <div className="font-semibold text-base">{a.subject_name}</div>
                  <div className="text-muted-foreground text-sm">Faculty: {a.faculty_name}</div>
                  <div className="text-muted-foreground text-sm">Faculty: {a.co_faculty_id}</div>
                  <div className="text-muted-foreground text-sm">venue: {a.venue}</div>
                  <div className="text-muted-foreground text-sm">Batch: {a.batch_section} ({a.batch_noOfStudent} students)</div>
                </div>
              ))}
            </div>
          )}
          {editingIdx !== null && editForm && (
            <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
              <Card className="mx-4 w-full max-w-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Edit Allocation</CardTitle>
                    <Button variant="ghost" size="sm" onClick={handleEditCancel}>
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
                      onValueChange={(val) => handleEditChange('faculty_id', Number(editForm.faculty_id))}
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
                        handleEditChange('co_faculty_id', val === '' ? null : Number(val))
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
                    <Button className="flex-1" onClick={handleEditSave}>Save</Button>
                    <Button variant="outline" className="flex-1" onClick={handleEditCancel}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end mt-8">
            <Button onClick={handleSendToHod} disabled={allocations.length === 0}>
              Notify HOD about Allocation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
