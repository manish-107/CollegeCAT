'use client';

import { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Subject {
  subjectCode: string;
  subjectName: string;
  lecturer: string;
  type: 'core' | 'elective';
}

interface AllocationData {
  year: string;
  batch: string;
  subjects: Subject[];
  finalized: boolean;
}

const allocationData: AllocationData[] = [
  {
    year: '2024-2025',
    batch: 'MCA-A',
    finalized: false,
    subjects: [
      { subjectCode: 'MCA101', subjectName: 'Advanced Programming', lecturer: 'Dr. Anita Sharma', type: 'core' },
      { subjectCode: 'MCA102', subjectName: 'Database Systems', lecturer: 'Dr. Rajiv Verma', type: 'core' },
      { subjectCode: 'MCA201', subjectName: 'Blockchain', lecturer: 'Dr. Anita Sharma', type: 'elective' },
      { subjectCode: 'MCA202', subjectName: 'AI & NLP', lecturer: 'Dr. Megha Rao', type: 'elective' },
    ],
  },
 
];

const getTypeColor = (type: Subject['type']) => {
  switch (type) {
    case 'core': return 'bg-blue-100 text-blue-800';
    case 'elective': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeLabel = (type: Subject['type']) => {
  switch (type) {
    case 'core': return 'Core';
    case 'elective': return 'Elective';
    default: return 'Unknown';
  }
};

export default function FinalizeSubjectsPage() {
  // For each batch, create a ref for the card content
  const cardRefs = allocationData.map(() => useRef<HTMLDivElement>(null));

  const handleDownloadPDF = async (idx: number, batch: string, year: string) => {
    const input = cardRefs[idx].current;
    if (!input) return;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape' });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Subject_Allocation_${batch}_${year}.pdf`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Finalize Subject Allocation</h2>
      <div className=" gap-8">
        {allocationData.map((batch, idx) => (
          <Card key={batch.batch + batch.year} className="border-2 border-primary/30 shadow-sm hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {batch.batch} <span className="text-muted-foreground font-normal">({batch.year})</span>
                </CardTitle>
                <Button onClick={() => handleDownloadPDF(idx, batch.batch, batch.year)} size="sm">
                  Download PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent ref={cardRefs[idx]}>
              {batch.subjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No subjects assigned.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {batch.subjects.map((subject) => (
                    <div
                      key={subject.subjectCode}
                      className="border rounded-lg p-4 bg-muted/50 flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700">
                          {subject.subjectCode}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(subject.type)}`}>{getTypeLabel(subject.type)}</span>
                      </div>
                      <div className="font-semibold text-base">{subject.subjectName}</div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Lecturer:</span> {subject.lecturer}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
