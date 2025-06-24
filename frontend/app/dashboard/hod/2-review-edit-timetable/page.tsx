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
  const [timetable, setTimetable] = useState<Timetable>(() => generateDummyTimetable());

  const moveSlot = (
    slot: TimetableSlot,
    oldDay: string,
    oldIdx: number,
    newDay: string,
    newIdx: number,
    length: number = 1
  ) => {
    setTimetable((prevTimetable) => {
      if (!prevTimetable) return prevTimetable;
      if (oldIdx + length > 8 || newIdx + length > 8) return prevTimetable;
      const updatedTimetable = { ...prevTimetable };
      if (oldDay === newDay) {
        const daySlots = [...updatedTimetable[oldDay]];
        const sourceBlock = daySlots.slice(oldIdx, oldIdx + length);
        const targetBlock = daySlots.slice(newIdx, newIdx + length);
        for (let i = 0; i < length; i++) {
          const temp = daySlots[oldIdx + i];
          daySlots[oldIdx + i] = targetBlock[i] || { type: 'break' };
          daySlots[newIdx + i] = sourceBlock[i] || { type: 'break' };
        }
        updatedTimetable[oldDay] = daySlots;
      } else {
        const sourceSlots = [...updatedTimetable[oldDay]];
        const targetSlots = [...updatedTimetable[newDay]];
        const sourceBlock = sourceSlots.slice(oldIdx, oldIdx + length);
        const targetBlock = targetSlots.slice(newIdx, newIdx + length);
        for (let i = 0; i < length; i++) {
          sourceSlots[oldIdx + i] = targetBlock[i] || { type: 'break' };
          targetSlots[newIdx + i] = sourceBlock[i] || { type: 'break' };
        }
        updatedTimetable[oldDay] = sourceSlots;
        updatedTimetable[newDay] = targetSlots;
      }
      return updatedTimetable;
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Review and Edit Timetable</CardTitle>
        </CardHeader>
        <CardContent>
          <DndProvider backend={HTML5Backend}>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border px-4 py-2">Day/Time</th>
                    {timeSlots.map((slot) => (
                      <th key={slot} className="border px-4 py-2">{slot}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(timetable).map(([day, slots]) => (
                    <tr key={day}>
                      <td className="border px-4 py-2 font-semibold bg-muted/50">{day}</td>
                      {(() => {
                        const cells = [];
                        for (let idx = 0; idx < slots.length; ) {
                          const slot = slots[idx];
                          // Check if this is the start of a lab block
                          const isLabStart =
                            slot.type === 'lab' &&
                            idx <= slots.length - 3 &&
                            slots[idx + 1]?.type === 'lab' &&
                            slots[idx + 2]?.type === 'lab';
                          if (isLabStart) {
                            cells.push(
                              <td key={idx} colSpan={3} className="border px-4 py-2 min-w-[140px] bg-yellow">
                                <DropSlot day={day} idx={idx} moveSlot={moveSlot}>
                                  <DraggableSlot slot={slot} day={day} idx={idx} moveSlot={moveSlot} slots={slots} />
                                </DropSlot>
                              </td>
                            );
                            idx += 3;
                          } else {
                            cells.push(
                              <td key={idx} className="border px-4 py-2 min-w-[140px]">
                                <DropSlot day={day} idx={idx} moveSlot={moveSlot}>
                                  <DraggableSlot slot={slot} day={day} idx={idx} moveSlot={moveSlot} slots={slots} />
                                </DropSlot>
                              </td>
                            );
                            idx++;
                          }
                        }
                        return cells;
                      })()}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DndProvider>
        </CardContent>
      </Card>
    </div>
  );
} 