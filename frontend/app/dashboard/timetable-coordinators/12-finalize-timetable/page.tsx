"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getSubjectsByYearOptions,
  getTimetableByYearAndBatchOptions,
  getYearsWithBatchesOptions,
} from "@/app/client/@tanstack/react-query.gen";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useYearBatch } from "@/app/dashboard/context/YearBatchContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const breakPeriods = [2, 5];

const defaultTimings = [
  ["9:00 AM", "9:55 AM"],
  ["9:55 AM", "10:50 AM"],
  ["10:50 AM", "11:05 AM"],
  ["11:05 AM", "12:00 PM"],
  ["12:00 PM", "12:55 PM"],
  ["12:55 PM", "2:00 PM"],
  ["2:00 PM", "2:55 PM"],
  ["2:55 PM", "3:50 PM"],
  ["3:50 PM", "4:45 PM"],
];

const decompressPeriods = (compressed: number[]): string[] => {
  const periods: string[] = [];
  let index = 0;

  for (let i = 0; i < compressed.length && index < 9;) {
    if (breakPeriods.includes(index)) {
      periods.push("break");
      index++;
      continue;
    }

    const value = compressed[i];
    if (value === 3) {
      let labFilled = 0;
      while (labFilled < 3 && index < 9) {
        if (!breakPeriods.includes(index)) {
          periods.push("lab");
          labFilled++;
        } else {
          periods.push("break");
        }
        index++;
      }
    } else if (value === 1) {
      while (index < 9 && breakPeriods.includes(index)) {
        periods.push("break");
        index++;
      }
      if (index < 9) {
        periods.push("class");
        index++;
      }
    }
    i++;
  }

  while (periods.length < 9) {
    if (breakPeriods.includes(periods.length)) {
      periods.push("break");
    } else {
      periods.push("empty");
    }
  }

  return periods;
};

const expandSubjectsToMatchFormat = (compressed: number[], subjects: string[]) => {
  const expanded: string[] = [];
  let subjectIndex = 0;

  for (let i = 0, periodIndex = 0; i < compressed.length && periodIndex < 9; i++) {
    const value = compressed[i];

    if (value === 3) {
      let count = 0;
      while (count < 3 && periodIndex < 9) {
        if (!breakPeriods.includes(periodIndex)) {
          expanded[periodIndex] = subjects[subjectIndex];
          count++;
        }
        periodIndex++;
      }
      subjectIndex++;
    } else if (value === 1) {
      while (periodIndex < 9 && breakPeriods.includes(periodIndex)) periodIndex++;
      if (periodIndex < 9) {
        expanded[periodIndex] = subjects[subjectIndex];
        periodIndex++;
      }
      subjectIndex++;
    }
  }

  return expanded;
};

export default function FinalizeTimetablePage() {
  const { selectedYear, selectedBatch } = useYearBatch();

  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());

  const selectedYearData = yearsData?.items?.find(
    (item) => item.academic_year === selectedYear
  );
  const yearId = selectedYearData?.year_id;

  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    ...getSubjectsByYearOptions({ path: { year_id: yearId! } }),
    enabled: !!yearId,
  });

  const { data: timetableData, isLoading: timetableLoading, error } = useQuery({
    ...getTimetableByYearAndBatchOptions({
      path: { year_id: yearId!, batch_id: selectedBatch?.batch_id! },
    }),
    enabled: !!yearId && !!selectedBatch?.batch_id,
  });

const selectedFormat = timetableData?.format_details;
  const subjects = subjectsData?.subjects || [];
  const timetable = timetableData?.timetable_data || null;
  const isLoading = subjectsLoading || timetableLoading;

  const getSubjectDetails = (subjectName: string) =>
    subjects.find((subject) => subject.subject_name === subjectName);

  const getAbbreviation = (subjectName: string) => {
    const subject = getSubjectDetails(subjectName);
    return subject?.abbreviation || subjectName;
  };

  return (
    <div className="space-y-6 mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subjects and Faculty Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">Loading subjects...</div>
          ) : subjects.length === 0 ? (
            <div className="py-8 text-muted-foreground text-center">
              No subjects found for this year.
            </div>
          ) : (
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <div
                  key={subject.subject_id}
                  className="space-y-2 p-4 border rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm">
                      {subject.subject_name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        subject.subject_type === "CORE"
                          ? "bg-blue-100 text-blue-800"
                          : subject.subject_type === "ELECTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {subject.subject_type}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    <div>Code: {subject.subject_code}</div>
                    <div>Abbreviation: {subject.abbreviation}</div>
                    <div>Hours: {subject.no_of_hours_required}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="py-8 text-center">Loading timetable...</CardContent>
        </Card>
      )}
      {error && (
        <Card>
          <CardContent className="py-8 text-red-500 text-center">
            Failed to load timetable.
          </CardContent>
        </Card>
      )}

      {timetable && selectedFormat && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Timetable: {selectedBatch?.section} - {selectedYear}
            </CardTitle>
            <div>
            <Link href="/dashboard/timetable-coordinators/pdf-editor">
              <Button variant="outline" size="sm">Download PDF file</Button>
            </Link>
          </div>
          </CardHeader>
          <CardContent>
            <div className="gap-2 grid grid-cols-9 pb-2 border-b font-semibold text-xs text-center">
              {defaultTimings.map((slot, idx) => (
                <div key={idx}>
                  {slot[0]} - {slot[1]}
                </div>
              ))}
            </div>
            {Object.entries(timetable).map(([day, subjectList]) => {
              const compressed = selectedFormat.format_data[day.toLowerCase()];
              const periodTypes = decompressPeriods(compressed as number[]);
              const expandedSubjects = expandSubjectsToMatchFormat(
                compressed as number[],
                subjectList
              );

              return (
                <div key={day}>
                  <h3 className="mt-6 mb-2 font-medium text-sm">{day}</h3>
                  <div className="gap-2 grid grid-cols-9">
                    {periodTypes.map((type, idx) => {
                      const subject = expandedSubjects[idx];
                      const subjectDetails = subject
                        ? getSubjectDetails(subject)
                        : null;
                      const isBreak = type === "break";

                      const style = isBreak
                        ? "text-yellow-500 border-yellow-500"
                        : type === "lab"
                        ? "text-green-500 border-green-500"
                        : type === "class"
                        ? "text-blue-500 border-blue-500"
                        : "text-muted-foreground border-gray-300";

                      return (
                        <div
                          key={idx}
                          className={`rounded-md border px-2 py-2 text-xs text-center ${style}`}
                        >
                          <div className="font-semibold italic">
                            {isBreak
                              ? defaultTimings[idx][0] === "10:50 AM"
                                ? "Morning Break"
                                : "Lunch Break"
                              : type.toUpperCase()}
                          </div>
                          {!isBreak && subject && (
                            <>
                              <p className="mt-1 font-medium text-sm">
                                {getAbbreviation(subject)}
                              </p>
                              {subjectDetails && (
                                <div className="text-muted-foreground text-xs">
                                  {subjectDetails.subject_code}
                                  <br />
                                  {subjectDetails.subject_type}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
