import { useState, useEffect } from 'react'
import { Search, Loader2 } from 'lucide-react'
import resultXlsx from './assets/result.xlsx?url'
import { fetchAndParseResults, transformStudentData } from './utils/excelParser'
import ReportCard from './components/ReportCard'

function App() {
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [searchRoll, setSearchRoll] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchAndParseResults(resultXlsx);
        setAllData(data);
      } catch (e) {
        setError("Failed to load result data.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchRoll) return;

    // Filter rows for this roll number
    // Excel parser returns raw json rows. We filter first, then transform.
    // Ensure loose comparison for string/number roll nos
    const studentRows = allData.filter(row => row['Roll No.'] == searchRoll);

    if (studentRows.length > 0) {
      const transformed = transformStudentData(studentRows);
      setStudentData(transformed);
    } else {
      setStudentData(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative selection:bg-indigo-100 selection:text-indigo-900 font-sans text-slate-900">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-linear-to-b from-indigo-50 to-transparent"></div>
        <div className="absolute -top-[20%] left-[20%] w-[500px] h-[500px] bg-purple-200/40 blur-[100px] rounded-full mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-blue-200/40 blur-[100px] rounded-full mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[30%] w-[600px] h-[600px] bg-pink-200/30 blur-[120px] rounded-full mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="flex flex-col items-center justify-center pt-8 pb-12 space-y-4 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-lg shadow-indigo-100 ring-1 ring-slate-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-indigo-600">
              <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.949 49.949 0 0 0-9.902 3.912l-.003.002-.34.18a.75.75 0 0 1-.707 0A50.009 50.009 0 0 0 7.5 12.174v-.224c0-.131.067-.248.182-.311a51.002 51.002 0 0 1 6.882-3.342.75.75 0 0 0-.707-1.345 49.497 49.497 0 0 0-6.882 3.343.375.375 0 0 0-.182.311v.224c0 5.883 4.223 10.748 9.92 11.666a.75.75 0 0 1-.225 1.483C10.15 23.01 5.25 17.512 5.25 11.25v-.27a.75.75 0 0 0-.182-.472 50.016 50.016 0 0 0-3.908-3.09.75.75 0 0 1 .244-1.334A60.675 60.675 0 0 1 11.7 2.805Z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800">
            Student Report Portal
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto text-lg">
            Access comprehensive academic performance records. Enter roll number to view detailed test results.
          </p>
        </header>

        {/* Search Area */}
        <div className="max-w-xl mx-auto mb-16 relative group">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full group-hover:bg-indigo-500/30 transition-all duration-500 opacity-50"></div>
          <form onSubmit={handleSearch} className="relative flex items-center p-2 bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-50 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
            <div className="pl-4 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              placeholder="Enter Roll Number (e.g., 242009695)"
              className="w-full px-4 py-4 text-lg font-medium bg-transparent border-none outline-none placeholder:text-slate-300 text-slate-800"
              value={searchRoll}
              onChange={(e) => setSearchRoll(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Report'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="min-h-[400px]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-400" />
              <p>Loading database...</p>
            </div>
          )}

          {!loading && !studentData && searchRoll && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
              <div className="bg-white p-6 rounded-full shadow-lg mb-6 ring-1 ring-slate-100">
                <Search className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Records Found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                We couldn't find any student with Roll No <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{searchRoll}</span>. Please check and try again.
              </p>
            </div>
          )}

          {!loading && !studentData && !searchRoll && (
            <div className="text-center py-20 opacity-40 select-none pointer-events-none">
              <p className="font-medium text-slate-400">Waiting for input...</p>
            </div>
          )}

          {studentData && (
            <ReportCard data={studentData} />
          )}
        </div>
      </div>

      <div className="text-center py-8 text-slate-400 text-sm font-medium">
        PTM Report Card System &copy; {new Date().getFullYear()}
      </div>
    </div>
  )
}

export default App
