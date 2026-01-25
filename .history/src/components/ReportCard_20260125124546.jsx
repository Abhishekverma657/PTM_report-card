import { useRef } from 'react';
import { Activity, User, Hash, Layers, GraduationCap, CalendarDays, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PerformanceChart from './PerformanceChart';
import logo from '../assets/logo.png';
import seal from '../assets/seal.png';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Visual Components
export const Card = ({ children, className }) => (
    <div className={cn("bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-100/20 overflow-hidden print:overflow-visible print:shadow-none print:border print:border-slate-200 print:rounded-lg", className)}>
        {children}
    </div>
);

const Badge = ({ children, className, variant = 'primary' }) => {
    const variants = {
        primary: "bg-emerald-100 text-emerald-700 border-emerald-200 print:bg-slate-100 print:text-slate-800 print:border-slate-300",
        success: "bg-emerald-100 text-emerald-700 border-emerald-200 print:bg-slate-100 print:text-slate-800 print:border-slate-300",
        warning: "bg-amber-100 text-amber-700 border-amber-200 print:bg-slate-100 print:text-slate-800 print:border-slate-300",
        outline: "bg-white border-slate-200 text-slate-500 shadow-sm"
    };
    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide", variants[variant], className)}>
            {children}
        </span>
    );
};

// Sub-components
const StudentHeader = ({ profile }) => (
    <Card className="mb-8 bg-linear-to-r from-emerald-600 to-teal-600 text-white border-none shadow-2xl shadow-emerald-500/20 print:hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20 shadow-inner">
                    <User className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2">{profile.name}</h2>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-emerald-100 text-sm font-medium">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                            <Hash className="w-3.5 h-3.5" /> Roll: {profile.rollNo}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                            <Layers className="w-3.5 h-3.5" /> Class {profile.class}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                            <GraduationCap className="w-3.5 h-3.5" /> {profile.batch}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </Card>
);

const PrintHeader = ({ profile }) => (
    <div className="only-print mb-6 font-sans">
        {/* Top Header Bar */}
        <div className="flex items-stretch justify-between bg-slate-700 border border-slate-700 mb-2 overflow-hidden print:bg-slate-700 print:text-white">
            <div className="flex items-center px-4 py-3">
                <h1 className="text-xl font-bold uppercase tracking-wide text-white m-0 p-0 leading-none">
                    Unacademy Foundation School
                </h1>
            </div>
            <div className="bg-white px-4 flex items-center justify-center min-w-[80px]">
                <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
            </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-6">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Result Card</h2>
            <p className="text-sm font-semibold text-slate-600 mt-1">Academic Session: 2025-26</p>
        </div>

        {/* Student Details Section */}
        <div className="space-y-4 px-1 text-sm text-slate-700">
            {/* Row 1: Name and Roll No */}
            <div className="flex items-end gap-6 w-full">
                <div className="flex items-end grow">
                    <span className="shrink-0 font-medium pb-1">Student Name:</span>
                    <div className="grow border-b border-slate-400 ml-3 px-2 pb-1 relative top-0.5">
                        <span className="font-bold text-lg text-slate-900">{profile.name}</span>
                    </div>
                </div>
                <div className="flex items-end w-[30%]">
                    <span className="shrink-0 font-medium pb-1">Roll No.:</span>
                    <div className="grow border-b border-slate-400 ml-3 px-2 pb-1 relative top-0.5">
                        <span className="font-bold text-base text-slate-900">{profile.rollNo}</span>
                    </div>
                </div>
            </div>

            {/* Row 2: Class and Batch */}
            <div className="flex items-end gap-6 w-full">
                <div className="flex items-end w-[40%]">
                    <span className="shrink-0 font-medium pb-1">Class:</span>
                    <div className="grow border-b border-slate-400 ml-3 px-2 pb-1 relative top-0.5">
                        <span className="font-bold text-base text-slate-900">{profile.class}</span>
                    </div>
                </div>
                <div className="flex items-end grow">
                    <span className="shrink-0 font-medium pb-1">Batch:</span>
                    <div className="grow border-b border-slate-400 ml-3 px-2 pb-1 relative top-0.5">
                        <span className="font-bold text-base text-slate-900">{profile.batch}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Separator */}
        <div className="mt-6 border-b-2 border-slate-800 mb-2"></div>
    </div>
);

const SubjectRow = ({ subject, isLast }) => (
    <tr className={cn(
        "transition-colors hover:bg-slate-50",
        !isLast && "border-b border-slate-100"
    )}>
        <td className="py-3 px-6 text-slate-700 font-medium">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 print:bg-slate-400"></div>
                {subject.name}
            </div>
        </td>
        <td className="py-3 px-6 text-right">
            <div className="inline-flex items-center justify-end gap-1.5">
                <span className={cn(
                    "text-base font-bold tabular-nums",
                    typeof subject.obtained === 'number' && typeof subject.max === 'number' && subject.obtained < subject.max * 0.4 ? "text-rose-500 print:text-slate-900" : "text-slate-700"
                )}>
                    {subject.obtained}
                </span>
                <span className="text-slate-400 text-xs font-medium select-none">/</span>
                <span className="text-slate-600 text-xs font-bold tabular-nums">{subject.max}</span>
            </div>
        </td>
    </tr>
);

const TestGroupCard = ({ group }) => {
    return (
        <Card className="flex flex-col h-full bg-white ring-1 ring-slate-900/5 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 break-inside-avoid">
            <div className="p-5 border-b border-slate-100 bg-linear-to-r from-slate-50/80 to-white print:bg-none flex items-start justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant={group.isConsolidated ? "primary" : "outline"}>
                            {group.typeTag}
                        </Badge>
                        {!group.isConsolidated && group.date && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                <CalendarDays className="w-3 h-3" /> {group.date}
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">
                        {group.displayTitle}
                    </h3>
                </div>

                <div className="text-right">
                    <div className={cn(
                        "text-2xl font-black tracking-tight",
                        group.percentage >= 90 ? "text-emerald-500" :
                            group.percentage >= 75 ? "text-emerald-600" :
                                group.percentage >= 50 ? "text-amber-500" : "text-rose-500"
                    )}>
                        {group.percentage}%
                    </div>
                </div>
            </div>

            <div className="p-0 grow">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-100 print:bg-white print:border-b-2 print:border-slate-300">
                            <tr>
                                <th className="py-2.5 px-6">Subject</th>
                                <th className="py-2.5 px-6 text-right">Marks / MM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {group.subjects.map((sub, idx) => (
                                <SubjectRow key={idx} subject={sub} isLast={idx === group.subjects.length - 1} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-sm print:bg-slate-100/50">
                <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Total</span>
                <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                    <span className="font-bold text-slate-800 tabular-nums">
                        {group.totalObtained}
                    </span>
                    <span className="text-slate-400 text-xs">/ {group.totalMax}</span>
                </div>
            </div>
        </Card>
    );
};

const SHORT_SUBJECTS = {
    'Physics': 'P',
    'Chemistry': 'C',
    'Mathematics': 'M',
    'Biology': 'B',
    'Social Studies': 'SS',
    'Hindi': 'H',
    'English': 'E',
    'Mental Ability': 'MAT'
};

const SUBJECT_ORDER = ['Physics', 'Chemistry', 'Biology', 'Hindi', 'English', 'Mathematics', 'Social Studies', 'Mental Ability'];

const PrintResultSummary = ({ tests, classNumber }) => {
    const sortedTests = [...tests].sort((a, b) => (a.date ? new Date(a.date).getTime() : 0) - (b.date ? new Date(b.date).getTime() : 0));
    
    // Find tests
    const hyTest = sortedTests.find(t => t.typeTag === 'Half Yearly');
    const hyPercentage = hyTest ? `${hyTest.percentage}%` : '-';

    const reHyTest = sortedTests.find(t => t.typeTag === 'Re-Half Yearly');
    const reHyPercentage = reHyTest ? `${reHyTest.percentage}%` : '-';

    const annualTest = sortedTests.find(t => t.typeTag === 'Annual Exam');
    const annualPercentage = annualTest ? `${annualTest.percentage}%` : '-';

    const preTest = sortedTests.find(t =>
        t.typeTag === 'Pre Board' ||
        t.typeTag === 'Pre Board' ||
        (t.displayTitle && t.displayTitle.toLowerCase().includes('Pre Board'))
    );
    const prePercentage = preTest ? `${preTest.percentage}%` : '-';

    // Calculate overall percentage and status
    const cumulativeTotalObtained = sortedTests.reduce((acc, t) => acc + t.totalObtained, 0);
    const cumulativeTotalMax = sortedTests.reduce((acc, t) => acc + t.totalMax, 0);
    const overallVal = cumulativeTotalMax > 0 ? (cumulativeTotalObtained / cumulativeTotalMax) * 100 : 0;
    const resultStatus = overallVal >= 33 ? 'PASS' : 'FAIL';

    // Get remarks based on performance
    const getRemarks = (percentage) => {
        if (percentage < 33) {
            return "Performance is below expectations and needs significant improvement.";
        } else if (percentage < 60) {
            return "Needs improvement through regular practice and focused effort.";
        } else if (percentage < 75) {
            return "Has shown satisfactory progress and can perform better with consistency.";
        } else if (percentage < 90) {
            return "Has demonstrated very good understanding and consistent performance.";
        } else {
            return "Has shown excellent academic performance and commendable consistency.";
        }
    };

    const remarks = getRemarks(overallVal);

    const ResultCard = ({ title, value, subtext, highlight }) => (
        <div className={cn(
            "rounded-xl border p-4 flex flex-col justify-between h-full",
            highlight ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"
        )}>
            <span className={cn("text-[10px] uppercase tracking-wider font-bold mb-1", highlight ? "text-emerald-700" : "text-slate-500")}>{title}</span>
            <div className="flex items-baseline gap-1">
                <span className={cn("text-2xl font-black tracking-tight", highlight ? "text-emerald-600" : "text-slate-800")}>{value}</span>
                {subtext && <span className="text-xs font-semibold text-slate-400">{subtext}</span>}
            </div>
        </div>
    );

    // Determine which tests to show based on class
    const is10thClass = classNumber === '10' || classNumber === 10;

return (
    <div className="only-print w-full mb-8 break-inside-avoid font-sans">
        <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            Performance Summary
        </h2>

        <div className={cn("gap-3", is10thClass ? "grid grid-cols-4" : "grid grid-cols-3")}>

    {!is10thClass && (
        <>
            <ResultCard title="Half Yearly" value={hyPercentage} />
            <ResultCard title="Re-Half Yearly" value={reHyPercentage} />
            <ResultCard title="Annual Exam" value={annualPercentage} />
        </>
    )}

    {is10thClass && (
        <>
            <ResultCard title="Half Yearly" value={hyPercentage} />
            <ResultCard title="Re-Half Yearly" value={reHyPercentage} />
            <ResultCard title="Annual Exam" value={annualPercentage} />
            <ResultCard title="Pre Board" value={prePercentage} />
        </>
    )}



            <div className="col-span-1">
                <div className="rounded-xl border p-4 flex flex-col justify-center items-center h-full bg-slate-900 border-slate-800 text-white">
                    <span className="text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-400">
                        Final Result
                    </span>
                    <span
                        className={cn(
                            "text-2xl font-black tracking-tight",
                            resultStatus === 'PASS'
                                ? "text-emerald-400"
                                : "text-rose-400"
                        )}
                    >
                        {resultStatus}
                    </span>
                </div>
            </div>
        </div>

        {/* Remarks */}
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-sm font-semibold text-slate-700">
                <span className="font-bold text-slate-800">Remarks: </span>
                {remarks}
            </p>
        </div>
    </div>
);

};

const PrintPerformanceTable = ({ tests }) => {
    const formatTestName = (name) => {
        if (!name) return '';
        return name
            .replace(/\bST\b/g, 'Subjective Test')
            .replace(/\bOT\b/g, 'Objective Test')
            .replace(/\bPT\b/g, 'Part Test')
            .replace(/\bAT\b/g, 'Advance Test');
    };

    const sortedTests = [...tests].sort((a, b) => {
        const priorityOrder = [
            'Part Test',
            'Half Yearly',
            'Re-Half Yearly',
            'Annual Exam',
            'Pre Board'
        ];

        const getPriority = (t) => {
            const title = t.displayTitle || t.typeTag || '';
            for (let i = 0; i < priorityOrder.length; i++) {
                if (title.toLowerCase().includes(priorityOrder[i].toLowerCase())) return i + 1;
            }
            return 0;
        };

        const pA = getPriority(a);
        const pB = getPriority(b);

        if (pA !== pB) return pA - pB;

        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
    });

    const activeSubjects = SUBJECT_ORDER.filter(subject => {
        return tests.some(test => {
            const sub = test.subjects.find(s => s.name === subject);
            return sub && (typeof sub.obtained === 'number' || typeof sub.max === 'number');
        });
    });

    return (
        <div className="only-print w-full mb-6 break-inside-avoid font-sans">
            <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Detailed Performance Record
            </h2>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-[10px] border-collapse table-fixed">
                    <thead>
                        <tr className="bg-emerald-600 text-white font-bold uppercase text-center">
                            <th className="px-1 py-2 text-left w-24">Test Name</th>
                            {activeSubjects.map(subj => (
                                <th key={subj} className="px-1 py-2 border-l border-emerald-500/50 break-words w-auto align-bottom leading-tight">{subj}</th>
                            ))}
                            <th className="px-1 py-2 w-14 bg-emerald-700">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTests.map((test, idx) => {
                            const subjectMap = {};
                            test.subjects.forEach(s => {
                                subjectMap[s.name] = { obtained: s.obtained, max: s.max };
                            });

                            return (
                                <tr key={idx} className="text-center text-slate-700 border-b border-slate-100 last:border-0 hover:bg-emerald-50/10">
                                    <td className="px-1 py-2 text-left font-bold text-slate-800 break-words leading-tight max-w-[120px] border-r border-slate-100">
                                        {formatTestName(test.displayTitle)}
                                    </td>
                                    {activeSubjects.map(subj => {
                                        const data = subjectMap[subj];
                                        return (
                                            <td key={subj} className="px-1 py-2 border-r border-slate-100 tabular-nums">
                                                {data ? (
                                                    <span>
                                                        <span className="font-bold text-slate-700">{data.obtained}</span>
                                                        <span className="text-slate-600 text-[9px] font-bold">/{data.max}</span>
                                                    </span>
                                                ) : <span className="text-slate-300">-</span>}
                                            </td>
                                        );
                                    })}
                                    <td className="px-1 py-2 font-bold bg-slate-50 text-emerald-700 tabular-nums">
                                        {test.totalObtained} <span className="text-slate-600 text-[9px] font-bold">/{test.totalMax}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PrintDeclaration = ({ tests }) => {
    const cumulativeTotalObtained = tests?.reduce((acc, t) => acc + t.totalObtained, 0) || 0;
    const cumulativeTotalMax = tests?.reduce((acc, t) => acc + t.totalMax, 0) || 0;
    const overallVal = cumulativeTotalMax > 0 ? (cumulativeTotalObtained / cumulativeTotalMax) * 100 : 0;

    let performanceStatus = "Satisfactory progress";

    if (overallVal < 33) {
        performanceStatus = "Needs improvement";
    } else if (overallVal < 60) {
        performanceStatus = "Needs improvement";
    } else if (overallVal < 75) {
        performanceStatus = "Satisfactory progress";
    } else if (overallVal < 90) {
        performanceStatus = "Consistent and commendable";
    } else {
        performanceStatus = "Outstanding Achievement";
    }

    return (
        <div className="only-print w-full mt-4 pt-4 break-inside-avoid font-sans page-break-before-auto">
            <div className="flex justify-end pt-2 pr-12 pb-4">
                <div className="flex flex-col items-center">
                    <img src={seal} alt="Official Seal" className="w-24 h-24 object-contain mix-blend-multiply" />
                </div>
            </div>
        </div>
    );
};

export default function ReportCard({ data }) {
    const printRef = useRef();
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Report_${data?.profile?.name || 'Student'}`,
    });

    if (!data) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out max-w-6xl mx-auto">
            {/* Print Button */}
            <div className="flex justify-end mb-4 no-print">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-lg font-medium text-sm"
                >
                    <Printer className="w-4 h-4" /> Print Report
                </button>
            </div>

            <div ref={printRef} className="print:p-4 print:w-[210mm] print:mx-auto print:overflow-hidden flex flex-col min-h-[295mm]">
                <PrintHeader profile={data.profile} />
                <StudentHeader profile={data.profile} />

                {/* Print Result Summary - NOW ON TOP */}
                <PrintResultSummary
                    tests={data.tests}
                    classNumber={data.profile.class}
                />


                {/* Detailed Table */}
                <PrintPerformanceTable tests={data.tests} />

                <div className="mb-8 flex items-center gap-3 text-slate-500 no-print">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <Layers className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-700">Detailed Performance Record</span>
                    <div className="h-px bg-slate-200 grow ml-4"></div>
                </div>



                {/* Screen View: Cards (Hidden in Print) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 w-full print:hidden">
                    {data.tests.map((test) => (
                        <TestGroupCard key={test.id} group={test} />
                    ))}
                </div>

                {/* Subject Analysis Section */}
                {data.subjectPerformance && Object.keys(data.subjectPerformance).length > 0 && (
                    <>
                        <div className="break-inside-avoid print:hidden">
                            <div className="mb-4 flex items-center gap-3 text-slate-500 no-print">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <Activity className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-sm font-bold uppercase tracking-wider text-slate-700">Subject-wise Performance Analysis</span>
                                <div className="h-px bg-slate-200 grow ml-4"></div>
                            </div>

                            {/* In print, maybe hide Subject Analysis cards if table covers it? User didn't ask to remove. 
                                But user said "table aayega ... then graph aayega". The subject analysis cards are extra. 
                                I'll keep them but make them smaller/cleaner or hide them if user insists on "just table then graph".
                                User said "scot ka sare test ka table aayega tphir percnetage and aise sbka then graph aayega"
                                "Percentge and aise sbka" might mean the subject analysis. I will keep it.
                            */}
                            <div className="only-print mt-8 mb-4 border-b border-slate-200 pb-2 page-break-before-auto">
                                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Subject Analysis</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6 mb-12">
                                {Object.entries(data.subjectPerformance).map(([category, subjects]) => (
                                    <Card key={category} className="p-5 flex flex-col h-full hover:shadow-lg transition-shadow break-inside-avoid">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 pb-2 border-b border-slate-100">
                                            {category} Average
                                        </h3>
                                        <div className="space-y-4 grow">
                                            {subjects.map((sub, idx) => (
                                                <div key={idx}>
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className="text-xs font-semibold text-slate-600">{sub.subject}</span>
                                                        <span className={cn(
                                                            "text-xs font-bold tabular-nums",
                                                            sub.percentage >= 75 ? "text-emerald-600" :
                                                                sub.percentage >= 50 ? "text-emerald-600" : "text-rose-600"
                                                        )}>{sub.percentage}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-1000 ease-out print:opacity-50",
                                                                sub.percentage >= 90 ? "bg-emerald-500" :
                                                                    sub.percentage >= 75 ? "bg-emerald-500" :
                                                                        sub.percentage >= 50 ? "bg-amber-500" : "bg-rose-500"
                                                            )}
                                                            style={{ width: `${sub.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <div className="break-inside-avoid print:break-inside-avoid">
                    <div className="mb-4 flex items-center gap-3 text-slate-500 no-print">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <Activity className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider text-slate-700">Performance Trend</span>
                        <div className="h-px bg-slate-200 grow ml-4"></div>
                    </div>
                    <div className="only-print mt-8 mb-4 border-b border-slate-200 pb-2">
                        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Performance Trend Graphs</h2>
                    </div>

                    {/* Graphs Grid */}
                    <div className="grid grid-cols-1 gap-6 mb-4">
                        {data.graphs.st_ot && data.graphs.st_ot.length > 0 && (
                            <Card className="p-5 bg-white/60 break-inside-avoid">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Subjective / Objective Test Trend
                                </h3>
                                <PerformanceChart data={data.graphs.st_ot} color="#10b981" chartType="bar" />
                            </Card>
                        )}

                        {data.graphs.major && data.graphs.major.length > 0 && (
                            <Card className="p-5 bg-white/60 break-inside-avoid">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 mb-2 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-teal-500"></div> Major Exams Trend (Half Yearly / Re-Half Yearly / Annual / Pre - Board)
                                </h3>
                                <PerformanceChart data={data.graphs.major} color="#14b8a6" chartType="bar" />
                            </Card>
                        )}
                    </div>

                    {/* Declaration Footer - Bottom of Print */}
                    <PrintDeclaration tests={data.tests} />
                </div>
            </div>
        </div>
    );
}
