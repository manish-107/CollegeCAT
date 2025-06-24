'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit, X } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'core' | 'elective' | 'lab' | 'project';
}

export default function ManageSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    type: '' as Subject['type'] | ''
  });
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    type: '' as Subject['type'] | ''
  });

  const subjectTypes = [
    { value: 'core', label: 'Core Subject' },
    { value: 'elective', label: 'Elective Subject' },
    { value: 'lab', label: 'Laboratory' },
    { value: 'project', label: 'Project' }
  ];

  const handleAddSubject = () => {
    if (newSubject.name.trim() && newSubject.code.trim() && newSubject.type) {
      const subject: Subject = {
        id: Date.now().toString(),
        name: newSubject.name.trim(),
        code: newSubject.code.trim().toUpperCase(),
        type: newSubject.type
      };
      
      setSubjects([...subjects, subject]);
      setNewSubject({ name: '', code: '', type: '' });
    }
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setEditForm({
      name: subject.name,
      code: subject.code,
      type: subject.type
    });
  };

  const handleSaveEdit = () => {
    if (editForm.name.trim() && editForm.code.trim() && editForm.type && editForm.type !== '') {
      const updatedSubjects = subjects.map(subject => 
        subject.id === editingSubject?.id 
          ? {
              ...subject,
              name: editForm.name.trim(),
              code: editForm.code.trim().toUpperCase(),
              type: editForm.type as 'core' | 'elective' | 'lab' | 'project'
            }
          : subject
      );
      setSubjects(updatedSubjects);
      setEditingSubject(null);
      setEditForm({ name: '', code: '', type: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    setEditForm({ name: '', code: '', type: '' });
  };

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Subjects</h2>
        <div className="text-sm text-muted-foreground">
          Total Subjects: {subjects.length}
        </div>
      </div>

      {/* Add Subject Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input
                id="subject-name"
                placeholder="Enter subject name"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject-code">Subject Code</Label>
              <Input
                id="subject-code"
                placeholder="e.g., CS101, MATH201"
                value={newSubject.code}
                onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject-type">Subject Type</Label>
              <Select
                value={newSubject.type}
                onValueChange={(value: Subject['type']) => setNewSubject({ ...newSubject, type: value })}
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
          </div>
          
          <Button 
            onClick={handleAddSubject}
            className="mt-4"
            disabled={!newSubject.name.trim() || !newSubject.code.trim() || !newSubject.type}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
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
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-subject-code">Subject Code</Label>
                <Input
                  id="edit-subject-code"
                  placeholder="e.g., CS101, MATH201"
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-subject-type">Subject Type</Label>
                <Select
                  value={editForm.type}
                  onValueChange={(value: Subject['type']) => setEditForm({ ...editForm, type: value })}
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
                  onClick={handleSaveEdit}
                  className="flex-1"
                  disabled={!editForm.name.trim() || !editForm.code.trim() || !editForm.type}
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  className="flex-1"
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
          {subjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No subjects added yet. Add your first subject above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{subject.code}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getTypeColor(subject.type)}`}>
                        {getTypeLabel(subject.type)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSubject(subject)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
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
