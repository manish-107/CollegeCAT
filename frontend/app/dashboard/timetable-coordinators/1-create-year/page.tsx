'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createYearWithBatchMutation, updateYearAndBatchesMutation, deleteYearMutation, getYearsWithBatchesOptions } from '@/app/client/@tanstack/react-query.gen';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, X, Save, Loader2 } from 'lucide-react';
import type { AcademicYearWithBatchesResponse, BatchResponse, BatchUpdate } from '@/app/client/types.gen';
import { useYearBatch } from "@/app/dashboard/context/YearBatchContext";

const CreateYearPage = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [batchSection, setBatchSection] = useState('');
  const [noOfStudents, setNoOfStudents] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYearWithBatchesResponse | null>(null);
  const [editForm, setEditForm] = useState({
    academic_year: '',
    batches: [] as BatchUpdate[]
  });
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedYear } = useYearBatch();

  // Fetch existing academic years and batches
  const { data: existingYearsData, isLoading } = useQuery(getYearsWithBatchesOptions());
  const existingYears = existingYearsData?.items || [];

  // Generate year suggestions (current year + next 5 years) excluding existing ones
  const currentYear = new Date().getFullYear();
  const allYearSuggestions = Array.from({ length: 6 }, (_, i) => {
    const year = currentYear + i;
    return `${year}-${year + 1}`;
  });

  // Filter out existing years from suggestions
  const existingYearNames = existingYears.map(item => item.academic_year);
  const yearSuggestions = allYearSuggestions.filter(year => !existingYearNames.includes(year));

  const createYearMutation = useMutation(createYearWithBatchMutation());
  const updateYearMutation = useMutation(updateYearAndBatchesMutation());
  const deleteYearMutationHook = useMutation(deleteYearMutation());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!academicYear || !batchSection || !noOfStudents) {
      toast.error('Please fill in all fields');
      return;
    }

    // Check if year already exists
    if (existingYearNames.includes(academicYear)) {
      toast.error(`Academic year ${academicYear} already exists. Please choose a different year.`);
      return;
    }

    // Extract the first year from the academic year format (e.g., "2024-2025" -> 2024)
    const yearNumber = parseInt(academicYear.split('-')[0]);

    if (isNaN(yearNumber)) {
      toast.error('Please enter a valid academic year format (e.g., 2024-2025)');
      return;
    }

    try {
      await createYearMutation.mutateAsync({
        body: {
          year: academicYear,
          batch: {
            section: batchSection,
            noOfStudent: parseInt(noOfStudents)
          }
        }
      });

      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: getYearsWithBatchesOptions().queryKey });

      toast.success('Year and batch created successfully!');

      // Reset form
      setAcademicYear('');
      setBatchSection('');
      setNoOfStudents('');

    } catch (error: any) {
      console.error('Error creating year and batch:', error);

      // Handle specific database integrity error for duplicate academic year
      if (error.response?.data?.detail?.includes('duplicate key value violates unique constraint') ||
        error.response?.data?.detail?.includes('already exists')) {
        toast.error(`Academic year ${academicYear} already exists. Please choose a different year.`);
      } else {
        toast.error(error.response?.data?.detail || 'Failed to create year and batch');
      }
    }
  };

  const handleEditYear = (yearData: AcademicYearWithBatchesResponse) => {
    setEditingYear(yearData);
    setEditForm({
      academic_year: yearData.academic_year,
      batches: yearData.batches.map(batch => ({
        id: batch.batch_id,
        section: batch.section || '',
        noOfStudent: batch.noOfStudent || 0
      }))
    });
  };

  const handleSaveEdit = async () => {
    if (!editingYear || !editForm.academic_year) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateYearMutation.mutateAsync({
        body: {
          academic_year: editForm.academic_year,
          batch: editForm.batches
        },
        path: {
          year_id: editingYear.year_id
        }
      });

      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: getYearsWithBatchesOptions().queryKey });

      toast.success('Year and batches updated successfully!');
      setEditingYear(null);
      setEditForm({ academic_year: '', batches: [] });

    } catch (error: any) {
      console.error('Error updating year and batches:', error);
      toast.error(error.response?.data?.detail || 'Failed to update year and batches');
    }
  };

  const handleCancelEdit = () => {
    setEditingYear(null);
    setEditForm({ academic_year: '', batches: [] });
  };

  const handleAddBatchToEdit = () => {
    setEditForm(prev => ({
      ...prev,
      batches: [...prev.batches, { id: null, section: '', noOfStudent: 0 }]
    }));
  };

  const handleUpdateBatchInEdit = (index: number, field: keyof BatchUpdate, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      batches: prev.batches.map((batch, i) =>
        i === index ? { ...batch, [field]: value } : batch
      )
    }));
  };

  const handleRemoveBatchFromEdit = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      batches: prev.batches.filter((_, i) => i !== index)
    }));
  };

  const handleDeleteYear = async (yearData: AcademicYearWithBatchesResponse) => {
    if (!confirm(`Are you sure you want to delete the academic year "${yearData.academic_year}" and all its batches? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteYearMutationHook.mutateAsync({
        path: { year_id: yearData.year_id }
      });

      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: getYearsWithBatchesOptions().queryKey });

      toast.success(`Academic year "${yearData.academic_year}" deleted successfully!`);

    } catch (error: any) {
      console.error('Error deleting year:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete academic year');
    }
  };

  const handleYearInputChange = (value: string) => {
    setAcademicYear(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setAcademicYear(suggestion);
    setShowSuggestions(false);
  };

  // Filter years based on selectedYear
  const filteredYears = selectedYear
    ? existingYears.filter((year) => year.academic_year === selectedYear)
    : existingYears;

  return (
    <div className="space-y-6 p-6">
      {/* Create New Year Section */}
      <Card>
        <CardHeader>
          <CardTitle className="font-semibold text-lg">Create New Year and Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                placeholder="e.g. 2024-2025"
                value={academicYear}
                onChange={(e) => handleYearInputChange(e.target.value)}
                onFocus={() => setShowSuggestions(academicYear.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && (
                <div className="top-full right-0 left-0 z-10 absolute bg-background shadow-lg border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                  {yearSuggestions
                    .filter(suggestion => suggestion.toLowerCase().includes(academicYear.toLowerCase()))
                    .map((suggestion, index) => (
                      <div
                        key={index}
                        className="hover:bg-[var(--sidebar-accent)] px-3 py-2 text-sm cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  {yearSuggestions.filter(suggestion => suggestion.toLowerCase().includes(academicYear.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-muted-foreground text-sm">
                      No available years found
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch">Batch Section</Label>
              <Input
                id="batch"
                placeholder="e.g. A, B, C or 3rd Year CSE"
                value={batchSection}
                onChange={(e) => setBatchSection(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noOfStudents">Number of Students</Label>
              <Input
                id="noOfStudents"
                type="number"
                placeholder="e.g. 60"
                value={noOfStudents}
                onChange={(e) => setNoOfStudents(e.target.value)}
                min="1"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createYearMutation.isPending}
            >
              {createYearMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Year & Batch'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Years and Batches Section */}
      <Card>
        <CardHeader>
          <CardTitle className="font-semibold text-lg">Existing Years and Batches</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Loading years and batches...</span>
              </div>
            </div>
          ) : filteredYears.length === 0 ? (
            <div className="py-8 text-muted-foreground text-center">
              <p>No academic years created yet.</p>
              <p className="text-sm">Create your first year above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredYears.map((yearData) => (
                <div key={yearData.year_id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg">{yearData.academic_year}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditYear(yearData)}
                        disabled={editingYear?.year_id === yearData.year_id || deleteYearMutationHook.isPending}
                      >
                        <Edit className="mr-1 w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteYear(yearData)}
                        disabled={editingYear?.year_id === yearData.year_id || deleteYearMutationHook.isPending}
                        className="hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700"
                      >
                        {deleteYearMutationHook.isPending ? (
                          <>
                            <Loader2 className="mr-1 w-4 h-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-1 w-4 h-4" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="gap-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {yearData.batches.map((batch) => (
                      <div key={batch.batch_id} className="p-3 border rounded-lg">
                        <div className="font-medium">{batch.section || 'N/A'}</div>
                        <div className="text-muted-foreground text-sm">
                          {batch.noOfStudent || 0} students
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingYear && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <Card className="mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Edit Year and Batches</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="p-0 w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-academic-year">Academic Year</Label>
                <Input
                  id="edit-academic-year"
                  value={editForm.academic_year}
                  onChange={(e) => setEditForm({ ...editForm, academic_year: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Batches</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddBatchToEdit}
                  >
                    <Plus className="mr-1 w-4 h-4" />
                    Add Batch
                  </Button>
                </div>

                {editForm.batches.map((batch, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label>Section</Label>
                      <Input
                        placeholder="e.g. A, B, C"
                        value={batch.section || ''}
                        onChange={(e) => handleUpdateBatchInEdit(index, 'section', e.target.value)}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Students</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 60"
                        value={batch.noOfStudent || ''}
                        onChange={(e) => handleUpdateBatchInEdit(index, 'noOfStudent', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBatchFromEdit(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveEdit}
                  className="flex-1"
                  disabled={updateYearMutation.isPending}
                >
                  {updateYearMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1"
                  disabled={updateYearMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CreateYearPage;
