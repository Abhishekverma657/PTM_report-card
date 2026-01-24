import { Activity, User, Hash, Layers, GraduationCap, CalendarDays } from 'lucide-react';
import PerformanceChart from './PerformanceChart';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Visual Components
export const Card = ({ children, className }) => (
    <div className={cn("bg-white/90 backdrop-blur-md rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-100/20 overflow-hidden", className)}>
        {children}
    </div>
);

const Badge = ({ children, className, variant = 'primary' }) => {
    const variants = {
        primary: "bg-indigo-100 text-indigo-700 border-indigo-200",
        success: "bg-emerald-100 text-emerald-700 border-emerald-200",
        warning: "bg-amber-100 text-amber-700 border-amber-200",
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
    <Card className="mb-8 bg-linear-to-r from-indigo-600 to-violet-600 text-white border-none shadow-2xl shadow-indigo-500/20">
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20 shadow-inner">
                    <User className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2">{profile.name}</h2>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-indigo-100 text-sm font-medium">
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

const SubjectRow = ({ subject, isLast }) => (
    <tr className={cn(
        "transition-colors hover:bg-slate-50",
        !isLast && "border-b border-slate-100"
    )}>
        <td className="py-3 px-6 text-slate-700 font-medium">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></div>
                {subject.name}
            </div>
        </td>
        <td className="py-3 px-6 text-right">
            <div className="inline-flex items-center justify-end gap-1.5">
                <span className={cn(
                    "text-base font-bold tabular-nums",
                    typeof subject.obtained === 'number' && typeof subject.max === 'number' && subject.obtained < subject.max * 0.4 ? "text-rose-500" : "text-slate-700"
                )}>
                    {subject.obtained}
                </span>
                <span className="text-slate-300 text-xs font-medium select-none">/</span>
                <span className="text-slate-400 text-xs font-medium tabular-nums">{subject.max}</span>
            </div>
        </td>
    </tr>
);

const TestGroupCard = ({ group }) => {
    return (
        <Card className="flex flex-col h-full bg-white ring-1 ring-slate-900/5 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1">
            <div className="p-5 border-b border-slate-100 bg-linear-to-r from-slate-50/80 to-white flex items-start justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant={group.isConsolidated ? "primary" : "outline"}>
                            {group.typeTag}
                        </Badge>
                        {/* Show date for single tests (ST/OT), or if it's consolidated but we have a date field (less likely to be singular) */}
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
                            group.percentage >= 75 ? "text-indigo-600" :
                                group.percentage >= 50 ? "text-amber-500" : "text-rose-500"
                    )}>
                        {group.percentage}%
                    </div>
                </div>
            </div>

            <div className="p-0 grow">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-100">
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

            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-sm">
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

export default function ReportCard({ data }) {
    if (!data) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out max-w-6xl mx-auto">
            <StudentHeader profile={data.profile} />

            <div className="mb-4 flex items-center gap-3 text-slate-500">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <Activity className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider text-slate-700">Performance Trend</span>
                <div className="h-px bg-slate-200 grow ml-4"></div>
            </div>

            {/* Graphs Grid */}
            {/* Graphs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {data.graphs.st_ot && data.graphs.st_ot.length > 0 && (
                    <Card className="p-5 bg-white/60">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-800 mb-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div> ST / OT Trend
                        </h3>
                        <PerformanceChart data={data.graphs.st_ot} color="#6366f1" chartType="bar" />
                    </Card>
                )}

                {data.graphs.major && data.graphs.major.length > 0 && (
                    <Card className="p-5 bg-white/60">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Major Exams Trend (HY / Re-HY / Annual)
                        </h3>
                        <PerformanceChart data={data.graphs.major} color="#10b981" chartType="bar" />
                    </Card>
                )}
            </div>



            <div className="mb-8 flex items-center gap-3 text-slate-500">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <Layers className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider text-slate-700">Detailed Performance Record</span>
                <div className="h-px bg-slate-200 grow ml-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 w-full">
                {data.tests.map((test) => (
                    <TestGroupCard key={test.id} group={test} />
                ))}
            </div>

            {/* Subject Analysis Section */}
            {data.subjectPerformance && Object.keys(data.subjectPerformance).length > 0 && (
                <>
                    <div className="mb-4 flex items-center gap-3 text-slate-500">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Activity className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider text-slate-700">Subject-wise Performance Analysis</span>
                        <div className="h-px bg-slate-200 grow ml-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {Object.entries(data.subjectPerformance).map(([category, subjects]) => (
                            <Card key={category} className="p-5 flex flex-col h-full hover:shadow-lg transition-shadow">
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
                                                        sub.percentage >= 50 ? "text-indigo-600" : "text-rose-600"
                                                )}>{sub.percentage}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000 ease-out",
                                                        sub.percentage >= 90 ? "bg-emerald-500" :
                                                            sub.percentage >= 75 ? "bg-indigo-500" :
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
                </>
            )}
        </div>
    );
}
