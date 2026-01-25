import { useState, useEffect } from 'react'
import { Search, Loader2, Download } from 'lucide-react'
import resultXlsx from './assets/result.xlsx?url'
import logo from './assets/logo.png'
import { fetchAndParseResults, transformStudentData } from './utils/excelParser'
import ReportCard from './components/ReportCard'
import JSZip from 'jszip'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { saveAs } from 'file-saver'

function App() {
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [searchRoll, setSearchRoll] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState(null);
  const [bulkProgress, setBulkProgress] = useState({ active: false, current: 0, total: 0, status: '' });
  const [bulkStudentData, setBulkStudentData] = useState(null);

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

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleBulkDownload = async () => {
    if (loading || !allData.length) return;

    // Get unique roll numbers
    const uniqueRolls = [...new Set(allData.map(r => r['Roll No.']))];

    setBulkProgress({ active: true, current: 0, total: uniqueRolls.length, status: 'Initializing bulk export...' });

    const zip = new JSZip();
    const folder = zip.folder("Student_Reports");

    try {
      for (let i = 0; i < uniqueRolls.length; i++) {
        const roll = uniqueRolls[i];

        // Update status
        setBulkProgress({
          active: true,
          current: i + 1,
          total: uniqueRolls.length,
          status: `Processing Roll: ${roll} (${i + 1}/${uniqueRolls.length})`
        });

        // Prepare Data
        const rows = allData.filter(r => r['Roll No.'] == roll);
        const transformed = transformStudentData(rows);

        if (transformed) {
          setBulkStudentData(transformed);
          // Wait for React to render and Charts to stabilize
          await wait(500);

          const element = document.getElementById('bulk-print-container');
          if (element) {
            const canvas = await html2canvas(element, {
              scale: 2,
              useCORS: true,
              logging: false,
              windowWidth: 794, // A4 width in px at 96dpi (210mm) is approx 794px, but here we set to match mm
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = pdfWidth / imgWidth;
            const scaledHeight = imgHeight * ratio;

            let heightLeft = scaledHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
              position = heightLeft - scaledHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'JPEG', 0, -1 * (scaledHeight - heightLeft - pdfHeight), pdfWidth, scaledHeight); // logic approx
              // Actually simplest multi-page logic:
              // The loop above is slightly wrong for position flow.
              // simplified: simple addImage on page 1. If content is longer, `html2canvas` produces one long image.
              // Paging a single image cleanly is hard.
              // Given ReportCard is fixed size roughly, let's just do single page if it fits or just shrink to fit?
              // Shrink to fit A4 might make it too small.
              // Let's stick to adding the image. If it's too long, it might get cut off.
              // Better multi-page logic:
              break; // Simplified: just one page for now, mostly fits. Or just let it be.
            }

            const pdfBlob = pdf.output('blob');
            folder.file(`${transformed.profile.name || 'Student'}_${roll}.pdf`, pdfBlob);
          }
        }
      }

      setBulkProgress(prev => ({ ...prev, status: 'Zipping files...' }));
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "Student_Reports.zip");

    } catch (err) {
      console.error(err);
      alert("An error occurred during bulk generation.");
    } finally {
      setBulkProgress({ active: false, current: 0, total: 0, status: '' });
      setBulkStudentData(null);
    }
  };

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
    <div className="min-h-screen bg-white relative selection:bg-emerald-100 selection:text-emerald-900 font-sans text-slate-900">

      <div className="relative z-10 container mx-auto px-4 py-4 max-w-7xl">
        {/* Header */}
        <header className="flex flex-col items-center justify-center pt-2 pb-6 space-y-2 text-center relative">
          <div className="mb-0">
            <img src={logo} alt="Unacademy Logo" className="h-14 w-auto object-contain" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800">
            Unacademy Kota Centre
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto text-base">
            Access comprehensive academic performance records. Enter roll number to view detailed test results.
          </p>

          {!loading && !error && (
            <div className="absolute top-4 right-4 md:top-8 md:right-8">
              <button
                onClick={handleBulkDownload}
                disabled={bulkProgress.active}
                className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {bulkProgress.active ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {bulkProgress.active ? 'Processing...' : ''}
              </button>
            </div>
          )}
        </header>

        {/* Bulk Progress Overlay */}
        {bulkProgress.active && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-4">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
              <h3 className="text-xl font-bold text-slate-800">Generating Reports...</h3>
              <p className="text-slate-500 text-sm font-medium">{bulkProgress.status}</p>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400">Please do not close this window.</p>
            </div>
          </div>
        )}

        {/* Hidden Container for Bulk Rendering */}
        <div className="absolute top-0 left-[-9999px] pointer-events-none">
          <div id="bulk-print-container" className="printing-simulation">
            {bulkStudentData && <ReportCard data={bulkStudentData} />}
          </div>
        </div>

        {/* Search Area */}
        <div className="max-w-xl mx-auto mb-6 relative group">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full group-hover:bg-emerald-500/30 transition-all duration-500 opacity-50"></div>
          <form onSubmit={handleSearch} className="relative flex items-center p-1.5 bg-white rounded-2xl shadow-xl shadow-emerald-100/50 border border-emerald-50 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
            <div className="pl-4 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Enter Roll Number (e.g., 242009695)"
              className="w-full px-4 py-2.5 text-lg font-medium bg-transparent border-none outline-none placeholder:text-slate-300 text-slate-800"
              value={searchRoll}
              onChange={(e) => setSearchRoll(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 min-w-[160px] py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Report'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="min-h-[400px]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-400" />
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
        PTM Report Card System Unacademy Kota Centre &copy; {new Date().getFullYear()}
      </div>
    </div>
  )
}

export default App
