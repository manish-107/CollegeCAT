'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CreateYearPage = () => {
  return (
    <div className="flex items-center justify-center  p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Create Year and Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input id="academicYear" placeholder="e.g. 2024-2025" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch">Batch Name</Label>
              <Input id="batch" placeholder="e.g. Batch A / 3rd Year CSE" />
            </div>
            <Button type="submit" className="mt-4 w-full">
              Save
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateYearPage;
