"use client";
import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';
import { useQuery } from '@tanstack/react-query';
import { getYearsWithBatchesOptions, getTimetableByYearAndBatchOptions, getSubjectsByYearOptions, getAllocationsByYearOptions } from '@/app/client/@tanstack/react-query.gen';
import type { TimetableModuleResponse, SubjectResponse, FacultySubjectAllocationResponse } from '@/app/client/types.gen';

type TimetableSlot = {
  type: 'class' | 'lab' | 'break';
  subject?: string;
};

type Timetable = {
  [day: string]: TimetableSlot[];
};

const timeSlots = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
];

const generateDummyTimetable = (): Timetable => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const subjects = ['Math', 'AI', 'DSA', 'Cloud', 'ML', 'Networks', 'Elective'];
  const labSubjects = ['OS Lab', 'AI Lab', 'DB Lab', 'Network Lab'];
  const timetable: Timetable = {};

  let labCount = 0;

  for (const day of days) {
    const slots: TimetableSlot[] = Array(8).fill(null).map(() => ({
      type: 'class',
      subject: subjects[Math.floor(Math.random() * subjects.length)],
    }));

    // For labs
    if (labCount < 3) {
      const possibleStartIndexes = [0, 1, 2, 3, 4];
      const startIdx = possibleStartIndexes[Math.floor(Math.random() * possibleStartIndexes.length)];
      const canPlaceLab = slots.slice(startIdx, startIdx + 3).every((s) => s.type === 'class');
      if (canPlaceLab) {
        const labSubject = labSubjects[labCount % labSubjects.length];
        for (let i = 0; i < 3; i++) {
          slots[startIdx + i] = {
            type: 'lab',
            subject: labSubject,
          };
        }
        labCount++;
      }
    }

    timetable[day] = slots;
  }

  return timetable;
};

const DraggableSlot = ({ slot, day, idx, moveSlot, slots }: any) => {
  const isStartOfLab =
    slot.type === 'lab' &&
    idx <= 5 &&
    slots[idx + 1]?.type === 'lab' &&
    slots[idx + 2]?.type === 'lab';

  const [, drag] = useDrag(() => ({
    type: 'SLOT',
    item: {
      slot,
      day,
      idx,
      isLab: isStartOfLab,
      length: isStartOfLab ? 3 : 1,
    },
  }));

  return (
    <div
      ref={drag as unknown as React.RefObject<HTMLDivElement>}
      className={`border-input dark:bg-input/30 dark:hover:bg-input/50 text-center gap-2 rounded-md border bg-transparent px-2 py-2 ${isStartOfLab ? 'cursor-move' : ''}`}
    >
      <p className={`text-xs italic ${slot.type === 'lab' ? 'text-yellow-300' : 'text-green-300'}`}>
        {slot.type.toUpperCase()}
      </p>
      {slot.subject ? (
        <p className="text-sm">{slot.subject}</p>
      ) : (
        <p className="text-sm text-gray-400">No Subject</p>
      )}
    </div>
  );
};

const DropSlot = ({ day, idx, moveSlot, children }: any) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'SLOT',
    drop: (item: any) => {
      moveSlot(item.slot, item.day, item.idx, day, idx, item.isLab ? 3 : 1);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop as unknown as React.RefObject<HTMLDivElement>}>
      {children}
    </div>
  );
};

export default function HODReviewEditTimetablePage() {
  const { selectedYear, selectedBatch } = useYearBatch();
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  // Fetch academic years to get year_id
  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  // Fetch subjects for the selected year
  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    ...getSubjectsByYearOptions({ path: { year_id: yearId! } }),
    enabled: !!yearId
  });

  // Fetch allocations for the selected year
  const { data: allocationsData } = useQuery({
    ...getAllocationsByYearOptions({ path: { year_id: yearId! } }),
    enabled: !!yearId
  });

  // Fetch timetable for the selected year and batch
  const { data: timetableData, isLoading: timetableLoading, error } = useQuery({
    ...getTimetableByYearAndBatchOptions({
      path: { year_id: yearId!, batch_id: selectedBatch?.batch_id! }
    }),
    enabled: !!yearId && !!selectedBatch?.batch_id
  });

  const subjects = subjectsData?.subjects || [];
  const allocations: FacultySubjectAllocationResponse[] = allocationsData?.allocations || [];
  const isLoading = subjectsLoading || timetableLoading;

  // Helper to get subject details by name
  const getSubjectDetails = (subjectName: string) => {
    return subjects.find(subject => subject.subject_name === subjectName);
  };

  // Helper to get abbreviation or fallback to subject name
  const getAbbreviation = (subject: string) => {
    const subjectDetails = getSubjectDetails(subject);
    return subjectDetails?.abbreviation || subject;
  };

  // Helper to get lecturer for a subject and batch
  const getLecturer = (subjectName: string) => {
    const allocation = allocations.find(
      a => a.subject_name === subjectName && a.batch_id === selectedBatch?.batch_id
    );
    return allocation?.faculty_name || '-';
  };

  let timetable: TimetableModuleResponse['timetable_data'] | null = null;
  if (timetableData && timetableData.timetable_data) {
    timetable = timetableData.timetable_data;
  }

  const handleFinalize = () => {
    setIsFinalizing(true);
    setTimeout(() => {
      setIsFinalizing(false);
      setIsFinalized(true);
    }, 2000);
  };

  if (isFinalized) {
    return (
      <Card className="text-center mt-12">
        <CardContent className="p-12">
          <span className="text-2xl font-bold mb-2 block">Timetable Finalized!</span>
          <p className="text-muted-foreground">
            The timetable has been successfully finalized and is now visible to all faculty members.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Subjects and Faculty Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subjects and Faculty Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading subjects...</div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No subjects found for this year.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <div key={subject.subject_id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{subject.subject_name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      subject.subject_type === 'CORE' ? 'bg-blue-100 text-blue-800' :
                      subject.subject_type === 'ELECTIVE' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {subject.subject_type}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div>Code: {subject.subject_code}</div>
                    <div>Abbreviation: {subject.abbreviation}</div>
                    <div>Hours: {subject.no_of_hours_required}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div>Lecturer: {getLecturer(subject.subject_name)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <Card><CardContent className="py-8 text-center">Loading timetable...</CardContent></Card>
      )}
      {error && (
        <Card><CardContent className="py-8 text-center text-red-500">Failed to load timetable.</CardContent></Card>
      )}
      {timetable && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Timetable: {selectedBatch?.section} - {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-2 text-xs font-semibold border-b pb-2 text-center">
              {timeSlots.map((slot, idx) => (
                <div key={idx}>{slot}</div>
              ))}
            </div>
            {Object.entries(timetable).map(([day, slots]) => (
              <div key={day}>
                <h3 className="mt-6 mb-2 font-medium text-sm">{day}</h3>
                <div className="grid grid-cols-8 gap-2">
                  {slots.map((subject, idx) => {
                    const subjectDetails = getSubjectDetails(subject);
                    return (
                      <div
                        key={idx}
                        className="border-input dark:bg-input/30 dark:hover:bg-input/50 text-center gap-2 rounded-md border bg-transparent px-2 py-2"
                      >
                        <p className="text-xs italic text-green-300">{getAbbreviation(subject)}</p>
                        {subjectDetails && (
                          <div className="text-xs text-muted-foreground mt-1">
                            <div>{subjectDetails.subject_code}</div>
                            <div>{subjectDetails.subject_type}</div>
                            <div>Lecturer: {getLecturer(subjectDetails.subject_name)}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {/* Finalize Button */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={handleFinalize}
          disabled={isFinalizing}
          className="px-8"
        >
          {isFinalizing ? "Finalizing..." : "Finalize Timetable"}
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          This action will make the timetable final and visible to all faculty members.
        </p>
      </div>
    </div>
  );
} 