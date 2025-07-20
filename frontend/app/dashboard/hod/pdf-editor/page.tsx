'use client';

import Image from 'next/image';
import collegelogo from '@/components/icons/collegelogo.png';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import {
  getTimetableByYearAndBatchOptions,
  getAllocationsByYearOptions,
  getYearsWithBatchesOptions
} from '@/app/client/@tanstack/react-query.gen';
import { useYearBatch } from '@/app/dashboard/context/YearBatchContext';

export default function PdfEditorPage() {
  const { selectedYear, selectedBatch } = useYearBatch();

  const { data: yearsData } = useQuery(getYearsWithBatchesOptions());
  const selectedYearData = yearsData?.items?.find(item => item.academic_year === selectedYear);
  const yearId = selectedYearData?.year_id;

  const { data: timetableData, isLoading: timetableLoading, error } = useQuery({
    ...getTimetableByYearAndBatchOptions({
      path: { year_id: yearId!, batch_id: selectedBatch?.batch_id! },
    }),
    enabled: !!yearId && !!selectedBatch?.batch_id,
  });

  const { data: allocationsData } = useQuery({
    ...getAllocationsByYearOptions({ path: { year_id: yearId! } }),
    enabled: !!yearId,
  });

  const timetable = timetableData?.timetable_data || {};
  const formatData = timetableData?.format_details?.format_data || {};
  const allAllocations = allocationsData?.allocations || [];

  const filteredAllocations = selectedBatch
    ? allAllocations.filter(a => a.batch_section === selectedBatch.section)
    : allAllocations;

  const uniqueSubjects = useMemo(() => {
    const seen = new Set();
    return filteredAllocations.filter((sub) => {
      const key = `${sub.subject_code}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredAllocations]);

  const [section, setSection] = useState('II Semester A Section');
  const [semester, setSemester] = useState('(Even Semester 2024-25)');
  const [wef, setWef] = useState('w.e.f. 28-04-2025');
  const [hod, setHod] = useState('HOD-MCA');
  const [principal, setPrincipal] = useState('Principal');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-50 py-4 min-h-screen">
      {/* Print Styles - Optimized for single page */}
      <style jsx global>{`
        @media print {
          /* Hide everything */
          body * {
            visibility: hidden;
          }
          
          /* Show only printable content */
          .printable-content,
          .printable-content * {
            visibility: visible;
          }
          
          /* Position printable content */
          .printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 15px !important;
            font-size: 11px !important;
          }
          
          /* Single page optimization */
          @page {
            size: A4 landscape;
            margin: 0.3in;
          }
          
          /* Reduce spacing for single page */
          .print-header {
            margin-bottom: 8px !important;
          }
          
          .print-section-info {
            margin-top: 8px !important;
            margin-bottom: 10px !important;
          }
          
          .print-timetable {
            margin-bottom: 12px !important;
          }
          
          .print-subjects-table {
            margin-top: 10px !important;
            margin-bottom: 12px !important;
          }
          
          .print-signatures {
            margin-top: 15px !important;
          }
          
          /* Scale down tables for better fit */
          .print-timetable table {
            font-size: 9px !important;
          }
          
          .print-subjects-table table {
            font-size: 8px !important;
          }
          
          .print-subjects-table th,
          .print-subjects-table td {
            padding: 2px 4px !important;
          }
          
          /* Header scaling */
          .print-header h1 {
            font-size: 18px !important;
            margin-bottom: 2px !important;
          }
          
          .print-header .institution {
            font-size: 16px !important;
            margin-bottom: 2px !important;
          }
          
          .print-header .department {
            font-size: 14px !important;
          }
          
          /* Input fields in print */
          input {
            border: none !important;
            background: transparent !important;
            -webkit-appearance: none;
          }
          
          /* Prevent page breaks */
          * {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Action Buttons - Hidden during print */}
      <div className="print:hidden mx-auto mb-4 px-4 max-w-7xl">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-black text-2xl">Timetable PDF Editor</h1>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print Timetable
            </Button>
          </div>
        </div>
        <p className="mt-2 text-gray-600">
          Single page optimized. Edit the fields below and click print to generate a PDF.
        </p>
      </div>

      {/* Printable Content */}
      <div className="bg-white shadow-lg mx-auto p-8 max-w-7xl printable-content">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 print-header">
          <Image src={collegelogo} alt="College Logo" width={80} height={80} />
          <div className="flex-1 text-center">
            <h1 className="mb-1 font-extrabold text-black text-2xl tracking-wide">ST JOSEPH ENGINEERING COLLEGE, MANGALURU</h1>
            <div className="mb-1 font-extrabold text-black text-2xl institution">An Autonomous Institution</div>
            <div className="font-bold text-black text-lg department">DEPARTMENT OF COMPUTER APPLICATIONS</div> 
          </div>
          <div style={{ width: 80 }} />
        </div>

        <div className="mt-5 mb-2 border-1 border-t border-black" />

        {/* Section and Date Info */}
        <div className="flex justify-between items-center mt-4 print-section-info">
          <div>
            <input className="bg-white mr-2 px-3 py-1 border-black w-64 font-bold text-black text-lg" value={section} onChange={(e) => setSection(e.target.value)} />
            <input className="bg-white px-3 py-1 border-black w-64 font-bold text-black text-lg" value={semester} onChange={(e) => setSemester(e.target.value)} />
          </div>
          <input className="bg-white px-3 py-1 border-black w-56 font-bold text-black text-lg" value={wef} onChange={(e) => setWef(e.target.value)} />
        </div>

        {/* Timetable Table */}
        <div className="mb-6 overflow-x-auto print-timetable">
          <table className="border border-black w-full text-black text-sm text-center">
            <thead>
              <tr>
                <th className="border font-bold text-base" rowSpan={2}>
                  <div className="font-bold text-base">TIME</div>
                  <div className="border-t border-black" />
                  <div className="font-bold text-base">DAY</div>
                </th>
                <th className="px-3 py-2 border font-bold text-base">9:00-9:55</th>
                <th className="px-3 py-2 border font-bold text-base">9:55-10:50</th>
                <th className="px-3 py-2 border font-bold text-base">11:10-12:05</th>
                <th className="px-3 py-2 border font-bold text-base">12:05-1:00</th>
                <th className="px-3 py-2 border font-bold text-base"></th>
                <th className="px-3 py-2 border font-bold text-base">2:00-3:00</th>
                <th className="px-3 py-2 border font-bold text-base">3:00-4:00</th>
                <th className="px-3 py-2 border font-bold text-base">4:00-5:00</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(formatData).map(([day, periods], rowIndex) => (
                <tr key={day}>
                  <th className="px-2 py-1 border font-bold">{day.charAt(0).toUpperCase() + day.slice(1)}</th>
                  {(() => {
                    const cells = [];
                    let slotIndex = 0;
                    let count = 0;
                    const daySubjects = timetable[day] || [];
                    let subjectIndex = 0;

                    while (slotIndex < periods.length) {
                      const span = periods[slotIndex];
                      const value = daySubjects[subjectIndex] || '';

                      cells.push(
                        <td key={`${day}-${slotIndex}`} className="px-2 py-1 border whitespace-pre-wrap" colSpan={span}>
                          {value}
                        </td>
                      );

                      count += span;
                      subjectIndex++;

                      if (count === 4 && rowIndex === 0) {
                        cells.push(
                          <td
                            key="break-column"
                            className="px-2 py-1 border font-semibold text-[10px]"
                            rowSpan={6}
                          >
                            {'LUNCH'.split('').map((l, i) => (
                              <div key={`l${i}`}>{l}</div>
                            ))}
                            <br />
                            {'BREAK'.split('').map((b, i) => (
                              <div key={`b${i}`}>{b}</div>
                            ))}
                          </td>
                        );
                      }

                      slotIndex++;
                    }
                    return cells;
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subject Details Table */}
        <div className="print-subjects-table my-8 overflow-x-auto">
          <table className="border border-black w-full text-black text-sm text-center">
            <thead className="bg-gray-100 font-bold">
              <tr>
                <th className="px-3 py-2 border">Sl No</th>
                <th className="px-3 py-2 border">Abbreviation</th>
                <th className="px-3 py-2 border">Subject Code</th>
                <th className="px-3 py-2 border">Title of Subject</th>
                <th className="px-3 py-2 border">Faculty In-charge</th>
                <th className="px-3 py-2 border">Co Faculty In-charge</th>
                <th className="px-3 py-2 border">Venue</th>
              </tr>
            </thead>
            <tbody>
              {uniqueSubjects.map((item, i) => (
                <tr key={item.allocation_id}>
                  <td className="px-2 py-1 border">{i + 1}</td>
                  <td className="px-2 py-1 border">{item.abbreviation}</td>
                  <td className="px-2 py-1 border">{item.subject_code}</td>
                  <td className="px-2 py-1 border text-left">{item.subject_name}</td>
                  <td className="px-2 py-1 border">{item.faculty_name}</td>
                  <td className="px-2 py-1 border">{item.co_faculty_id}</td>
                  <td className="px-2 py-1 border whitespace-pre-wrap">{item.venue || '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature Section */}
        <div className="flex justify-between mt-20 print-signatures">
          <input className="bg-white px-3 py-1 border-b-2 border-black w-40 font-bold text-black text-lg" value={hod} onChange={(e) => setHod(e.target.value)} />
          <input className="bg-white px-3 py-1 border-b-2 border-black w-40 font-bold text-black text-lg" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
