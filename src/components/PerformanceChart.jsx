import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, LabelList } from 'recharts';
import { Card } from './ReportCard';

const PerformanceChart = ({ data, color = "#6366f1", chartType = "line" }) => {
    if (!data || data.length === 0) return (
        <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm italic">
            No data available for this category
        </div>
    );

    const CustomDot = (props) => {
        const { cx, cy, payload } = props;
        const r = 4;

        return (
            <svg x={cx - r} y={cy - r} width={2 * r} height={2 * r} className="drop-shadow-sm">
                <circle cx={r} cy={r} r={r} fill={color} stroke="white" strokeWidth={2} />
            </svg>
        );
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="bg-white/95 backdrop-blur-sm border border-slate-100 p-3 rounded-xl shadow-xl text-xs z-50">
                    <p className="font-bold text-slate-800 mb-1">{d.date}</p>
                    <p className="font-semibold text-indigo-600 text-sm mb-1">{d.testName || d.type}</p>
                    {d.testName !== d.type && <p className="text-slate-500 mb-2">{d.type}</p>}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <span className="font-bold text-slate-800 text-base">{d.percentage}%</span>
                        <span className="text-slate-400">Score</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const COLORS = ['#10b981', '#14b8a6', '#059669', '#0d9488', '#f59e0b', '#84cc16', '#ef4444', '#6366f1'];

    return (
        <div className="w-full max-w-[190mm] mx-auto h-[300px] print:h-[260px] mt-4 mb-2">
            <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                    <BarChart data={data} margin={{ top: 20, right: 40, left: 10, bottom: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="testName"
                            stroke="#94a3b8"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            interval={0}
                            angle={-30}
                            textAnchor="end"
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                            dx={-10}
                        />
                        <Bar dataKey="percentage" radius={[8, 8, 0, 0]} maxBarSize={60} isAnimationActive={false}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.9} />
                            ))}
                            <LabelList
                                dataKey="percentage"
                                position="top"
                                formatter={(val) => `${val}%`}
                                fill="#64748b"
                                fontSize={10}
                                fontWeight="bold"
                            />
                        </Bar>
                    </BarChart>
                ) : (
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Line
                            type="monotone"
                            dataKey="percentage"
                            stroke={color}
                            strokeWidth={3}
                            dot={<CustomDot />}
                            activeDot={{ r: 6, fill: color, stroke: "white", strokeWidth: 3 }}
                            isAnimationActive={false}
                            strokeOpacity={1}
                        />
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

export default PerformanceChart;
