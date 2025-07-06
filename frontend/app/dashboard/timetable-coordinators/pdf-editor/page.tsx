'use client';

import Image from 'next/image';
import collegelogo from '@/components/icons/collegelogo.png';
import { useMemo, useState } from 'react';

const formatData = {
  monday: [1, 1, 1, 1, 3],
  tuesday: [1, 3, 1, 1],
  wednesday: [1, 1, 1, 1, 3],
  thursday: [1, 1, 1, 1, 3],
  friday: [1, 1, 1, 1, 3],
  saturday: [1, 1, 1, 1, 1, 1, 1],
};

const timetable_data = {
  friday: ['IoT', 'NoSQL', 'C#.NET', 'AWT', 'Project'],
  monday: ['NoSQL', 'C#.NET', 'AWT', 'CN', 'Lab'],
  saturday: ['', '', '', '', '', '', ''],
  thursday: ['C#.NET', 'CN', 'NoSQL', 'Lab', 'Project'],
  tuesday: ['CN', 'IoT', 'AWT', 'C#.NET', 'Lab'],
  wednesday: ['AWT', 'Lab', 'CN', 'AWT'],
};

const allocations = [
  {
    allocation_id: 36,
    faculty_name: 'Prof. Faculty 1',
    subject_name: 'Computer Networks',
    subject_code: 'CN2025',
    subject_type: 'CORE',
    abbreviation: 'CN',
    venue: '1402',
    co_faculty_name: 'Prof. Faculty 17',
  },
  {
    allocation_id: 48,
    faculty_name: 'Prof. Faculty 2',
    subject_name: 'Data Structures and Algorithms',
    subject_code: 'DSA2025',
    subject_type: 'CORE',
    abbreviation: 'DSA',
    venue: '1402',
    co_faculty_name: 'Prof. Faculty 16',
  },
  {
    allocation_id: 45,
    faculty_name: 'Prof. Faculty 5',
    subject_name: 'Machine Learning',
    subject_code: 'ML2025',
    subject_type: 'ELECTIVE',
    abbreviation: 'ML',
    venue: '1402',
    co_faculty_name: 'Prof. Faculty 15',
  },
  {
    allocation_id: 39,
    faculty_name: 'Prof. Faculty 9',
    subject_name: 'Database Management Systems',
    subject_code: 'DBMS2025',
    subject_type: 'CORE',
    abbreviation: 'DBMS',
    venue: '1402',
    co_faculty_name: '',
  },
  {
    allocation_id: 47,
    faculty_name: 'Prof. Faculty 10',
    subject_name: 'Operating Systems',
    subject_code: 'OS2025',
    subject_type: 'CORE',
    abbreviation: 'OS',
    venue: '1402',
    co_faculty_name: '',
  },
  {
    allocation_id: 49,
    faculty_name: 'Prof. Faculty 11',
    subject_name: 'Artificial Intelligence',
    subject_code: 'AI2025',
    subject_type: 'CORE',
    abbreviation: 'AI',
    venue: '1402',
    co_faculty_name: '',
  },
  {
    allocation_id: 46,
    faculty_name: 'Prof. Faculty 12',
    subject_name: 'Data Mining',
    subject_code: 'DM2025',
    subject_type: 'CORE',
    abbreviation: 'DM',
    venue: '1402',
    co_faculty_name: 'Prof. Faculty 17',
    }
];

export default function PdfEditorPage() {
  const [section, setSection] = useState('II Semester A Section');
  const [semester, setSemester] = useState('(Even Semester 2024-25)');
  const [wef, setWef] = useState('w.e.f. 28-04-2025');
  const [hod, setHod] = useState('HOD-MCA');
  const [principal, setPrincipal] = useState('Principal');

  const uniqueSubjects = useMemo(() => {
    const seen = new Set();
    return allocations.filter((sub) => {
      const key = `${sub.subject_code}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  return (
    <div className="bg-white shadow-lg mx-auto p-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <Image src={collegelogo} alt="College Logo" width={100} height={100} />
        <div className="flex-1 text-center">
          <h1 className="mb-1 font-extrabold text-black text-2xl tracking-wide">ST JOSEPH ENGINEERING COLLEGE, MANGALURU</h1>
          <div className="mb-1 font-extrabold text-black text-black text-2xl">An Autonomous Institution</div>
          <div className="font-bold text-black text-lg">DEPARTMENT OF COMPUTER APPLICATIONS</div> 
        </div>
        <div style={{ width: 100 }} />
      </div>
          <div className="mt-5 mb-2 border-1 border-t border-black" />

      <div className="flex justify-between items-center mt-4">
        <div>
          <input className="bg-white mr-2 px-3 py-1 border-black w-64 font-bold text-black text-lg" value={section} onChange={(e) => setSection(e.target.value)} />
          <input className="bg-white px-3 py-1 border-black w-64 font-bold text-black text-lg" value={semester} onChange={(e) => setSemester(e.target.value)} />
        </div>
        <input className="bg-white px-3 py-1 border-black w-56 font-bold text-black text-lg" value={wef} onChange={(e) => setWef(e.target.value)} />
      </div>

      <div className="mb-6 overflow-x-auto">
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
                  const daySubjects = timetable_data[day as keyof typeof timetable_data] || [];
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

      <div className="my-8 overflow-x-auto">
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
                <td className="px-2 py-1 border">{item.co_faculty_name}</td>
                <td className="px-2 py-1 border whitespace-pre-wrap">{item.venue || '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-20">
        <input className="bg-white px-3 py-1 border-b-2 border-black w-40 font-bold text-black text-lg" value={hod} onChange={(e) => setHod(e.target.value)} />
        <input className="bg-white px-3 py-1 border-b-2 border-black w-40 font-bold text-black text-lg" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
      </div>
    </div>
  );
}
