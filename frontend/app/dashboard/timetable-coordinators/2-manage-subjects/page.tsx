'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit, X, Loader2 } from 'lucide-react';
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  createSubjectMutation, 
  updateSubjectMutation, 
  deleteSubjectMutation,
  getSubjectsByYearOptions,
  getYearsWithBatchesOptions
} from '@/app/client/@tanstack/react-query.gen';
import { toast } from 'sonner';
import type { SubjectResponse, SubjectTypeEnum } from '@/app/client/types.gen';

interface Subject {
  subject_name: string;
  subject_code: string;
  abbreviation: string;
  subject_type: SubjectTypeEnum;
  no_of_hours_required: number;
  year_id: number;
  subject_id: number;
  created_at: string;
}

export default function ManageSubjectsPage() {
  const { selectedYear } = useYearBatch();
  const queryClient = useQueryClient();
  const [newSubject, setNewSubject] = useState({
    subject_name: '',
    subject_code: '',
    abbreviation: '',
    subject_type: '' as SubjectTypeEnum | '',
    no_of_hours_required: 1
  });
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editForm, setEditForm] = useState({
    subject_name: '',
    subject_code: '',
    abbreviation: '',
    subject_type: '' as SubjectTypeEnum | '',
    no_of_hours_required: 1
  });

  const subjectTypes = [
    { value: 'CORE', label: 'Core Subject' },
    { value: 'ELECTIVE', label: 'Elective Subject' },
    { value: 'LAB', label: 'Laboratory' }
  ];

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

  // Mutations
  const createSubjectMutationHook = useMutation(createSubjectMutation());
  const updateSubjectMutationHook = useMutation(updateSubjectMutation());
  const deleteSubjectMutationHook = useMutation(deleteSubjectMutation());

  const handleAddSubject = async () => {
    if (!yearId || !newSubject.subject_name.trim() || !newSubject.subject_code.trim() || !newSubject.subject_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createSubjectMutationHook.mutateAsync({
        body: {
          subject_name: newSubject.subject_name.trim(),
          subject_code: newSubject.subject_code.trim().toUpperCase(),
          abbreviation: newSubject.abbreviation.trim(),
          subject_type: newSubject.subject_type,
          no_of_hours_required: newSubject.no_of_hours_required,
          year_id: yearId
        }
      });

      // Invalidate and refetch subjects
      if (yearId) {
        queryClient.invalidateQueries({ queryKey: getSubjectsByYearOptions({ path: { year_id: yearId } }).queryKey });
      }

      // Reset form
      setNewSubject({
        subject_name: '',
        subject_code: '',
        abbreviation: '',
        subject_type: '',
        no_of_hours_required: 1
      });

      toast.success('Subject added successfully!');
    } catch (error: any) {
      console.error('Error adding subject:', error);
      toast.error(error.response?.data?.detail || 'Failed to add subject');
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      await deleteSubjectMutationHook.mutateAsync({
        path: { subject_id: subjectId }
      });

      // Invalidate and refetch subjects
      if (yearId) {
        queryClient.invalidateQueries({ queryKey: getSubjectsByYearOptions({ path: { year_id: yearId } }).queryKey });
      }

      toast.success('Subject deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete subject');
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setEditForm({
      subject_name: subject.subject_name,
      subject_code: subject.subject_code,
      abbreviation: subject.abbreviation,
      subject_type: subject.subject_type,
      no_of_hours_required: subject.no_of_hours_required
    });
  };

  const handleSaveEdit = async () => {
    if (!editingSubject || !editForm.subject_name.trim() || !editForm.subject_code.trim() || !editForm.subject_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateSubjectMutationHook.mutateAsync({
        body: {
          subject_name: editForm.subject_name.trim(),
          subject_code: editForm.subject_code.trim().toUpperCase(),
          abbreviation: editForm.abbreviation.trim(),
          subject_type: editForm.subject_type,
          no_of_hours_required: editForm.no_of_hours_required
        },
        path: { subject_id: editingSubject.subject_id }
      });

      // Invalidate and refetch subjects
      if (yearId) {
        queryClient.invalidateQueries({ queryKey: getSubjectsByYearOptions({ path: { year_id: yearId } }).queryKey });
      }

      setEditingSubject(null);
      setEditForm({
        subject_name: '',
        subject_code: '',
        abbreviation: '',
        subject_type: '',
        no_of_hours_required: 1
      });

      toast.success('Subject updated successfully!');
    } catch (error: any) {
      console.error('Error updating subject:', error);
      toast.error(error.response?.data?.detail || 'Failed to update subject');
    }
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    setEditForm({
      subject_name: '',
      subject_code: '',
      abbreviation: '',
      subject_type: '',
      no_of_hours_required: 1
    });
  };

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

  return (
    <div className="p-6 space-y-6">
      {/* Year and Batch Information */}
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
              <div className="text-sm text-blue-600">Subjects loaded via TanStack Query</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {fetchError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-700">
              <strong>Error:</strong> Failed to fetch subjects
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Subjects</h2>
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

      {/* Add Subject Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input
                id="subject-name"
                placeholder="Enter subject name"
                value={newSubject.subject_name}
                onChange={(e) => setNewSubject({ ...newSubject, subject_name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject-code">Subject Code</Label>
              <Input
                id="subject-code"
                placeholder="e.g., CS101, MATH201"
                value={newSubject.subject_code}
                onChange={(e) => setNewSubject({ ...newSubject, subject_code: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject-abbreviation">Abbreviation</Label>
              <Input
                id="subject-abbreviation"
                placeholder="e.g., DS, ALG"
                value={newSubject.abbreviation}
                onChange={(e) => setNewSubject({ ...newSubject, abbreviation: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject-type">Subject Type</Label>
              <Select
                value={newSubject.subject_type}
                onValueChange={(value: SubjectTypeEnum) => setNewSubject({ ...newSubject, subject_type: value })}
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

            <div className="space-y-2">
              <Label htmlFor="subject-hours">Hours Required</Label>
              <Input
                id="subject-hours"
                type="number"
                min="1"
                placeholder="e.g., 3"
                value={newSubject.no_of_hours_required}
                onChange={(e) => setNewSubject({ ...newSubject, no_of_hours_required: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleAddSubject}
            className="mt-4"
            disabled={!newSubject.subject_name.trim() || !newSubject.subject_code.trim() || !newSubject.subject_type || !yearId || createSubjectMutationHook.isPending}
          >
            {createSubjectMutationHook.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding Subject...
              </>
            ) : (
              <>
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Edit Subject</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
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
                  onChange={(e) => setEditForm({ ...editForm, subject_name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-subject-code">Subject Code</Label>
                <Input
                  id="edit-subject-code"
                  placeholder="e.g., CS101, MATH201"
                  value={editForm.subject_code}
                  onChange={(e) => setEditForm({ ...editForm, subject_code: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subject-abbreviation">Abbreviation</Label>
                <Input
                  id="edit-subject-abbreviation"
                  placeholder="e.g., DS, ALG"
                  value={editForm.abbreviation}
                  onChange={(e) => setEditForm({ ...editForm, abbreviation: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-subject-type">Subject Type</Label>
                <Select
                  value={editForm.subject_type}
                  onValueChange={(value: SubjectTypeEnum) => setEditForm({ ...editForm, subject_type: value })}
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

              <div className="space-y-2">
                <Label htmlFor="edit-subject-hours">Hours Required</Label>
                <Input
                  id="edit-subject-hours"
                  type="number"
                  min="1"
                  placeholder="e.g., 3"
                  value={editForm.no_of_hours_required}
                  onChange={(e) => setEditForm({ ...editForm, no_of_hours_required: parseInt(e.target.value) || 1 })}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSaveEdit}
                  className="flex-1"
                  disabled={!editForm.subject_name.trim() || !editForm.subject_code.trim() || !editForm.subject_type || updateSubjectMutationHook.isPending}
                >
                  {updateSubjectMutationHook.isPending ? (
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
                  onClick={handleCancelEdit}
                  className="flex-1"
                  disabled={updateSubjectMutationHook.isPending}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subjects List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subjects List</CardTitle>
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
              <p className="text-sm">Add your first subject above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <div
                  key={subject.subject_id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{subject.subject_name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{subject.subject_code}</p>
                      <p className="text-xs text-muted-foreground">Abbr: {subject.abbreviation}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(subject.subject_type)}`}>
                          {getTypeLabel(subject.subject_type)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {subject.no_of_hours_required} hours
                      </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSubject(subject)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        disabled={deleteSubjectMutationHook.isPending}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubject(subject.subject_id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={deleteSubjectMutationHook.isPending}
                      >
                        {deleteSubjectMutationHook.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
