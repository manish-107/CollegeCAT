'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface BatchData {
  [key: string]: {
    name: string;
    coreSubjects: string[];
    electiveSubjects: string[];
  };
}

const availableBatches = ['Batch A', 'Batch B', 'Batch C'];

const initialBatchData: BatchData = {
  'Batch A': { name: 'Batch A', coreSubjects: [], electiveSubjects: [] },
  'Batch B': { name: 'Batch B', coreSubjects: [], electiveSubjects: [] },
  'Batch C': { name: 'Batch C', coreSubjects: [], electiveSubjects: [] },
};

export default function ManageSubjectsPage() {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [batchData, setBatchData] = useState<BatchData>(initialBatchData);
  const [coreSubjectCount, setCoreSubjectCount] = useState<number>(0);
  const [electiveSubjectCount, setElectiveSubjectCount] = useState<number>(0);
  const [coreSubjectsInput, setCoreSubjectsInput] = useState<string[]>([]);
  const [electiveSubjectsInput, setElectiveSubjectsInput] = useState<string[]>([]);
  const [step, setStep] = useState<number>(1); 

  const handleBatchSelect = (batchName: string) => {
    setSelectedBatch(batchName);
    setStep(1); 
  };

  const handleCoreSubjectCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoreSubjectCount(parseInt(e.target.value, 10));
    setCoreSubjectsInput(new Array(parseInt(e.target.value, 10)).fill(''));
  };

  const handleElectiveSubjectCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setElectiveSubjectCount(parseInt(e.target.value, 10));
    setElectiveSubjectsInput(new Array(parseInt(e.target.value, 10)).fill(''));
  };

  const handleSubjectChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    type: 'core' | 'elective'
  ) => {
    if (type === 'core') {
      const updatedCoreSubjects = [...coreSubjectsInput];
      updatedCoreSubjects[index] = e.target.value;
      setCoreSubjectsInput(updatedCoreSubjects);
    } else {
      const updatedElectiveSubjects = [...electiveSubjectsInput];
      updatedElectiveSubjects[index] = e.target.value;
      setElectiveSubjectsInput(updatedElectiveSubjects);
    }
  };

  const handleAddSubjects = () => {
    
    const updatedBatchData = { ...batchData };
    updatedBatchData[selectedBatch!].coreSubjects = coreSubjectsInput.filter(subject => subject.trim() !== '');
    updatedBatchData[selectedBatch!].electiveSubjects = electiveSubjectsInput.filter(subject => subject.trim() !== '');
    setBatchData(updatedBatchData);
    setStep(3); 
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-lg font-semibold">Manage Subjects</h2>

   
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableBatches.map((batchName) => (
          <div
            key={batchName}
            onClick={() => handleBatchSelect(batchName)}
            className="cursor-pointer bg-card rounded-md p-6 border text-center hover:shadow-lg transition duration-200"
          >
            <h3 className="text-lg font-semibold">{batchName}</h3>
            <p className="mt-2 text-sm text-muted-foreground">Click to select</p>
          </div>
        ))}
      </div>

    
      {step === 1 && selectedBatch && (
        <div>
          <div className="mt-4">
            <label className="block text-sm font-medium">Enter Number of Core Subjects:</label>
            <input
              type="number"
              value={coreSubjectCount}
              onChange={handleCoreSubjectCountChange}
              className="mt-2 p-2 border rounded-md"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium">Enter Number of Elective Subjects:</label>
            <input
              type="number"
              value={electiveSubjectCount}
              onChange={handleElectiveSubjectCountChange}
              className="mt-2 p-2 border rounded-md"
            />
          </div>

          <Button
            onClick={() => setStep(2)} 
            className="mt-4 rounded-md"
          >
            Next
          </Button>
        </div>
      )}

     
      {step === 2 && selectedBatch && (
        <div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Enter Core Subjects</h3>
            {coreSubjectsInput.map((_, index) => (
              <input
                key={index}
                type="text"
                value={coreSubjectsInput[index]}
                onChange={(e) => handleSubjectChange(e, index, 'core')}
                className="mt-2 p-2 border rounded-md w-full"
                placeholder={`Core Subject ${index + 1}`}
              />
            ))}
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold">Enter Elective Subjects</h3>
            {electiveSubjectsInput.map((_, index) => (
              <input
                key={index}
                type="text"
                value={electiveSubjectsInput[index]}
                onChange={(e) => handleSubjectChange(e, index, 'elective')}
                className="mt-2 p-2 border rounded-md w-full"
                placeholder={`Elective Subject ${index + 1}`}
              />
            ))}
          </div>

          <Button
            onClick={handleAddSubjects}
            className="mt-4 p-2  rounded-md"
          >
            Add Subjects
          </Button>
        </div>
      )}

    
      {step === 3 && selectedBatch && (
        <div>
          <h3 className="text-lg font-semibold">Subjects for {selectedBatch}</h3>

          {/* Core Subjects */}
          <div className="mt-4">
            <h4 className="text-md font-semibold">Core Subjects</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {batchData[selectedBatch].coreSubjects.length === 0 ? (
                <p>No core subjects added yet.</p>
              ) : (
                batchData[selectedBatch].coreSubjects.map((subject, index) => (
                  <div key={index} className="bg-card rounded-md p-3 border text-sm">
                    <h5 className="font-medium">{subject}</h5>
                    <p className="text-xs text-muted-foreground mb-2">Core Subject</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Elective Subjects */}
          <div className="mt-4">
            <h4 className="text-md font-semibold">Elective Subjects</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {batchData[selectedBatch].electiveSubjects.length === 0 ? (
                <p>No elective subjects added yet.</p>
              ) : (
                batchData[selectedBatch].electiveSubjects.map((subject, index) => (
                  <div key={index} className="bg-card rounded-md p-3 border text-sm">
                    <h5 className="font-medium">{subject}</h5>
                    <p className="text-xs text-muted-foreground mb-2">Elective Subject</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
