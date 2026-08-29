'use client';

import React from 'react';
import { Logo } from '@/components/ui/Logo';

export interface CertificateData {
  id: string;
  courseTitle: string;
  courseCategory?: string;
  studentName: string;
  issueDate: string;
  verificationCode: string;
  instructorName: string;
  instructorTitle: string;
  partnerName?: string;
  grade?: string;
}

interface CourseraCertificateProps {
  data: CertificateData;
  className?: string;
}

export const CourseraCertificate: React.FC<CourseraCertificateProps> = ({ data, className = '' }) => {
  return (
    <div
      className={`relative w-full max-w-[860px] mx-auto bg-white text-zinc-900 aspect-[1.414/1] select-none p-6 sm:p-10 md:p-12 shadow-2xl flex flex-col justify-between overflow-hidden border border-zinc-200 ${className}`}
      style={{
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#18181b',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      {/* Outer Double Border with Corner Blocks (Coursera Style) */}
      <div className="absolute inset-2 sm:inset-3 border border-zinc-400/60 pointer-events-none" />
      <div className="absolute inset-3 sm:inset-4 border-2 border-zinc-500/70 pointer-events-none" />
      
      {/* Classic Corner Square Accents */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-3 h-3 bg-zinc-600 pointer-events-none" />
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-3 h-3 bg-zinc-600 pointer-events-none" />
      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-3 h-3 bg-zinc-600 pointer-events-none" />
      <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-3 h-3 bg-zinc-600 pointer-events-none" />

      {/* Main Grid: Left Column (~66%) & Right Column (~34%) */}
      <div className="relative z-10 grid grid-cols-12 gap-4 h-full">
        
        {/* LEFT COLUMN: Course info & Student */}
        <div className="col-span-8 flex flex-col justify-between pr-4 sm:pr-8 text-left">
          
          {/* Partner / Organization Logo */}
          <div className="pt-2">
            <div className="flex items-center space-x-2">
              <div className="text-xl sm:text-2xl font-black tracking-tighter text-blue-700 font-mono">
                MATHALAMA<span className="text-zinc-900 font-sans font-bold text-xs ml-1.5 uppercase tracking-widest px-1.5 py-0.5 border border-zinc-300 rounded">ACADEMY</span>
              </div>
            </div>
          </div>

          {/* Issue Date & Student Name */}
          <div className="space-y-4 my-auto py-2">
            <div className="text-[11px] sm:text-xs font-semibold text-zinc-500">
              {data.issueDate || 'August 28, 2026'}
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif text-zinc-900 tracking-tight font-normal leading-none" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
                {data.studentName}
              </h1>
              <p className="text-[11px] sm:text-xs text-zinc-500 font-sans uppercase tracking-widest pt-1">
                has successfully completed
              </p>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold font-sans text-zinc-950 tracking-tight leading-snug">
                {data.courseTitle}
              </h2>
              <p className="text-[10px] sm:text-xs text-zinc-600 font-sans leading-relaxed">
                an online course authorized by Mathalama Academic Board and offered through MathalamaEdu.
              </p>
            </div>
          </div>

          {/* Signatures Row */}
          <div className="pb-2">
            <div className="flex items-end space-x-6">
              {/* Signature 1 */}
              <div className="space-y-1">
                {/* SVG Simulated Cursive Signature */}
                <div className="h-7 sm:h-9 flex items-center">
                  <svg className="w-28 sm:w-36 h-6 text-zinc-800" viewBox="0 0 160 35" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M 5 22 Q 25 5, 45 20 T 75 10 T 105 28 T 130 12 T 155 25" />
                    <path d="M 20 28 Q 60 15, 140 18" strokeWidth="1" />
                  </svg>
                </div>
                <div className="w-32 sm:w-44 border-t border-zinc-300 pt-1">
                  <div className="text-[10px] sm:text-xs font-bold text-zinc-800 leading-tight">
                    {data.instructorName || 'Алексей Иванов'}
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-zinc-500 leading-tight">
                    {data.instructorTitle || 'Lead Instructor, Academic Curator'}
                  </div>
                </div>
              </div>

              {/* Signature 2 */}
              <div className="space-y-1 hidden sm:block">
                <div className="h-7 sm:h-9 flex items-center">
                  <svg className="w-28 sm:w-36 h-6 text-zinc-800" viewBox="0 0 160 35" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M 10 15 Q 35 32, 60 8 T 90 22 T 120 12 T 150 20" />
                    <path d="M 15 24 Q 80 8, 145 22" strokeWidth="1" />
                  </svg>
                </div>
                <div className="w-32 sm:w-44 border-t border-zinc-300 pt-1">
                  <div className="text-[10px] sm:text-xs font-bold text-zinc-800 leading-tight">
                    Dr. Dmitry Smirnov
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-zinc-500 leading-tight">
                    Dean of Academic Programs
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Official Certificate Seal & Verification (~34%) */}
        <div className="col-span-4 border-l border-zinc-200 pl-4 sm:pl-6 flex flex-col justify-between items-center text-center">
          
          {/* Top Title */}
          <div className="pt-2 text-center w-full">
            <span className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-[0.25em] text-zinc-700 block">
              COURSE
            </span>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-zinc-950 block">
              CERTIFICATE
            </span>
          </div>

          {/* Official Embossed Circular Stamp / Seal (Coursera Style) */}
          <div className="my-auto py-2">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-zinc-800 p-1 flex items-center justify-center relative shadow-inner bg-zinc-50/50">
              <div className="w-full h-full rounded-full border border-dashed border-zinc-400 flex flex-col items-center justify-center p-2 relative">
                
                {/* Circular Text */}
                <svg className="absolute inset-0 w-full h-full animate-none" viewBox="0 0 100 100">
                  <path
                    id="circlePath"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    fill="none"
                  />
                  <text className="text-[6.5px] font-black uppercase tracking-[0.18em] fill-zinc-700">
                    <textPath href="#circlePath" startOffset="0%">
                      • EDUCATION FOR EVERYONE • OFFICIAL COURSE CERTIFICATE •
                    </textPath>
                  </text>
                </svg>

                {/* Center Brand Monogram */}
                <div className="text-center z-10">
                  <div className="text-xs sm:text-sm font-black font-outfit text-brand tracking-tighter">
                    mathalama
                  </div>
                  <div className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest">
                    VERIFIED
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Verification Link and Code */}
          <div className="pb-2 text-center space-y-1 w-full">
            <div className="text-[8px] sm:text-[9px] text-zinc-500 font-sans">
              Verify at:
            </div>
            <a
              href={`https://mathalama.edu/verify/${data.verificationCode}`}
              target="_blank"
              rel="noreferrer"
              className="text-[8px] sm:text-[10px] font-semibold text-blue-600 hover:underline block break-all font-mono"
            >
              https://mathalama.edu/verify/{data.verificationCode}
            </a>
            <p className="text-[7px] sm:text-[8px] text-zinc-400 leading-tight pt-1 px-1">
              MathalamaEdu has confirmed the identity of this individual and their participation in the course.
            </p>
          </div>

        </div>

      </div>

      {/* Bottom Legal Disclaimer Footer */}
      <div className="relative z-10 pt-3 mt-2 border-t border-zinc-200 text-center">
        <p className="text-[7px] sm:text-[8px] text-zinc-400 leading-normal font-sans">
          This certificate attests to the learner’s completion of an online course delivered via MathalamaEdu. It does not constitute formal enrollment at any university or entity and does not itself grant academic degree credits unless specified by the participating institution.
        </p>
      </div>

    </div>
  );
};
