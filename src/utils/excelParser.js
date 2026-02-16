import { read, utils } from 'xlsx';

export const SUBJECT_MAP = {
    'P': 'Physics',
    'C': 'Chemistry',
    'Math': 'Mathematics',
    'B': 'Biology',
    'MAT': 'Mental Ability',
    'E': 'English',
    'SST': 'Social Studies',
    'H': 'Hindi'
};

export const parseExcelDate = (serial) => {
    if (!serial) return null;
    // Excel base date is Dec 30 1899
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

export const fetchAndParseResults = async (url) => {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = utils.sheet_to_json(worksheet);
        return jsonData;
    } catch (error) {
        console.error("Error loading results:", error);
        return [];
    }
};

export const transformStudentData = (rawData) => {
    if (!rawData || rawData.length === 0) return null;

    // Identities from the first record
    const profile = {
        name: rawData[0]['Learner Name'],
        rollNo: rawData[0]['Roll No.'],
        batch: rawData[0]['Batch Name'],
        class: rawData[0]['Class'],
    };

    const groups = {};

    rawData.forEach((row, index) => {
        let type = (row['Test Type'] || 'Other').trim(); // Trim whitespace
        const testName = (row['Test Name'] || '').trim();

        // Specific fix for "Re half Yearly" which might be categorized as "half Yearly"
        if (testName.toLowerCase().includes('re half yearly') || testName.toLowerCase().includes('re-half yearly')) {
            type = 'Re-Half Yearly';
        } else if (type.toLowerCase() === 'half yearly') {
            type = 'Half Yearly'; // Normalize case/spacing
        }

        // Detect specific Pre Board numbering
        // Handles: "Pre Board 1", "Pre-Board 2", "Pre - Board - 3", etc.
        const pbMatch = testName.match(/pre\s*[-]?\s*board\s*[-]?\s*(\d+)/i);
        if (pbMatch) {
            type = `Pre Board ${pbMatch[1]}`;
        }
        // Detect specific Part Test numbering
        const ptMatch = testName.match(/part\s*[-]?\s*test\s*[-]?\s*(\d+)/i);
        if (ptMatch) {
            // Optional: normalize Part Tests if needed, or just type
            // type = `Part Test ${ptMatch[1]}`;
        }

        let groupKey;
        let isConsolidated = true;

        // Logic: ST/OT should be separate (Date-wise/Test-wise). Others (Annual, HY, Re-HY) merged or grouped by correct Name.
        if (type === 'ST/OT' || type.includes('ST') || type.includes('OT') || type.includes('AT') || type.toLowerCase().includes('part test')) {
            groupKey = `STOT_${testName}_${row['Test Date']}_${index}`;
            isConsolidated = false;
        } else {
            // Group other types (Annual, HY, Re-HY) by their type name
            groupKey = type;
            isConsolidated = true;
        }

        if (!groups[groupKey]) {
            groups[groupKey] = {
                id: groupKey,
                type: type,
                testName: testName,
                dateVal: row['Test Date'],
                isConsolidated: isConsolidated,
                subjects: [],
                totalObtained: 0,
                totalMax: 0
            };
        }

        // Extract subjects for this row
        Object.keys(SUBJECT_MAP).forEach(key => {
            const marks = row[key];
            const maxMarks = row[`${key}(MM)`];

            if (marks !== undefined || maxMarks !== undefined) {
                const numObtained = typeof marks === 'number' ? marks : 0;
                const numMax = typeof maxMarks === 'number' ? maxMarks : 0;

                groups[groupKey].subjects.push({
                    name: SUBJECT_MAP[key],
                    testName: row['Test Name'],
                    obtained: marks ?? '-',
                    max: maxMarks ?? '-'
                });

                // Always add max marks if defined, regardless of attendance
                if (typeof maxMarks === 'number' && maxMarks > 0) {
                    groups[groupKey].totalMax += maxMarks;
                    groups[groupKey].maxSubjectsCount = (groups[groupKey].maxSubjectsCount || 0) + 1;

                    if (typeof marks === 'number') {
                        groups[groupKey].totalObtained += marks;
                        groups[groupKey].attemptedSubjectsCount = (groups[groupKey].attemptedSubjectsCount || 0) + 1;
                    }
                }
            }
        });
    });

    // Convert groups object to array and calculate percentages
    const resultTests = Object.values(groups).map(group => {
        // Check if all subjects were attempted
        const isComplete = group.maxSubjectsCount > 0 &&
            (group.attemptedSubjectsCount || 0) === group.maxSubjectsCount;

        let percentage = '-';
        if (group.totalMax > 0) {
            const val = (group.totalObtained / group.totalMax) * 100;
            if (isComplete) {
                percentage = val.toFixed(2);
            } else {
                percentage = 'NA';
            }
        }

        return {
            id: group.id,
            displayTitle: group.isConsolidated ? `${group.type} Examination` : group.testName,
            isConsolidated: group.isConsolidated,
            typeTag: group.type,
            date: parseExcelDate(group.dateVal),
            totalObtained: parseFloat(group.totalObtained.toFixed(2)),
            totalMax: group.totalMax,
            percentage: percentage,
            subjects: group.subjects
        };
    }).filter(t => t.totalMax > 0); // Filter out tests where student didn't attempt anything (Total MM is 0)

    // Create a chronological history for the graph (ALL tests, no consolidation)
    const history = rawData.map(row => {
        let type = (row['Test Type'] || 'Other').trim();
        const testName = (row['Test Name'] || '').trim();

        // Match naming logic
        if (testName.toLowerCase().includes('re half yearly') || testName.toLowerCase().includes('re-half yearly')) {
            type = 'Re-Half Yearly';
        } else if (type.toLowerCase() === 'half yearly') {
            type = 'Half Yearly';
        }

        // Recalculate Totals and Percentage row-by-row to match the "available data" logic
        let rowObtained = 0;
        let rowMax = 0;

        Object.keys(SUBJECT_MAP).forEach(key => {
            const m = row[key];
            const mm = row[`${key}(MM)`];
            if (typeof m === 'number') {
                rowObtained += m;
                if (typeof mm === 'number') {
                    rowMax += mm;
                }
            }
        });

        // Skip if max marks is 0 (meaning no valid/attempted data for this test row)
        if (rowMax === 0) return null;

        let pctVal = 0;
        if (rowMax > 0) {
            pctVal = ((rowObtained / rowMax) * 100);
        } else if (row['%'] !== undefined) {
            // Fallback to sheet percentage if we failed to calc
            pctVal = parseFloat(row['%']);
        }

        const pct = pctVal.toFixed(2);

        return {
            date: parseExcelDate(row['Test Date']),
            rawDate: row['Test Date'], // For sorting
            type: type,
            testName: testName,
            percentage: parseFloat(pct)
        };
    }).filter(item => item && item.date && !isNaN(item.percentage)) // Filter valid only
        .sort((a, b) => (a.rawDate || 0) - (b.rawDate || 0)); // Sort by date ascending

    // Split history by broad categories for separate graphs
    // User requested merging Half Yearly, Re-Half Yearly, and Annual into one graph
    // Aggregate Major Exams (Half Yearly, Re-Half Yearly, Annual, Pre Board)
    const majorAggregates = {};
    const majorTypes = ['Half Yearly', 'Re-Half Yearly', 'Annual Exam', 'Pre Board'];

    rawData.forEach(row => {
        let type = (row['Test Type'] || 'Other').trim();
        const testName = (row['Test Name'] || '').trim();

        // Normalize Type
        let normalizedType = type;
        if (testName.toLowerCase().includes('re half yearly') || testName.toLowerCase().includes('re-half yearly')) {
            normalizedType = 'Re-Half Yearly';
        } else if (type.toLowerCase() === 'half yearly') {
            normalizedType = 'Half Yearly';
        } else if (type.toLowerCase().includes('annual')) {
            normalizedType = 'Annual Exam';
        } else if (type.toLowerCase().includes('pre board') || testName.toLowerCase().includes('pre board')) {
            const pbMatch = testName.match(/pre\s*[-]?\s*board\s*[-]?\s*(\d+)/i);
            normalizedType = pbMatch ? `Pre Board ${pbMatch[1]}` : 'Pre Board';
        }

        if (majorTypes.includes(normalizedType) || normalizedType.startsWith('Pre Board')) {
            if (!majorAggregates[normalizedType]) {
                majorAggregates[normalizedType] = {
                    totalObtained: 0,
                    totalMax: 0,
                    dateVal: row['Test Date'], // Capture first date found
                    label: normalizedType
                };
            }

            Object.keys(SUBJECT_MAP).forEach(key => {
                const m = row[key];
                const mm = row[`${key}(MM)`];
                // Always add max marks (fix denominator)
                if (typeof mm === 'number' && mm > 0) {
                    majorAggregates[normalizedType].totalMax += mm;
                    if (typeof m === 'number') {
                        majorAggregates[normalizedType].totalObtained += m;
                    }
                }
            });
        }
    });

    const majorExams = Object.values(majorAggregates).map(g => ({
        type: g.label,
        testName: g.label,
        date: parseExcelDate(g.dateVal),
        rawDate: g.dateVal,
        percentage: g.totalMax > 0 ? parseFloat(((g.totalObtained / g.totalMax) * 100).toFixed(2)) : 0
    })).sort((a, b) => (a.rawDate || 0) - (b.rawDate || 0));

    const graphs = {
        st_ot: history.filter(i =>
            i.type === 'ST/OT' ||
            i.type.includes('ST') ||
            i.type.includes('OT') ||
            i.type.includes('AT') ||
            i.type.toLowerCase().includes('part test')
        ),
        major: majorExams
    };

    // Subject-wise Aggregates
    // Structure: { 'ST/OT': { 'Physics': { obtained: x, max: y }, ... }, 'Part Test': ... }
    const subjectStats = {
        'ST/OT': {},
        'Part Test': {},
        'Major Exams': {} // Annual, HY, Re-HY, Pre-Board
    };

    rawData.forEach(row => {
        let type = (row['Test Type'] || 'Other').trim();
        const testName = (row['Test Name'] || '').trim();
        let category = null;

        // Categorize
        if (type === 'ST/OT' || type.includes('ST') || type.includes('OT') || type.includes('AT')) {
            category = 'ST/OT';
        } else if (type.toLowerCase().includes('part test')) {
            category = 'Part Test';
        } else {
            // Check if it's a Major Exam
            let normalizedType = type;
            if (testName.toLowerCase().includes('re half yearly') || testName.toLowerCase().includes('re-half yearly')) normalizedType = 'Re-Half Yearly';
            else if (type.toLowerCase() === 'half yearly') normalizedType = 'Half Yearly';
            else if (type.toLowerCase().includes('annual')) normalizedType = 'Annual Exam';
            else if (type.toLowerCase().includes('pre board') || testName.toLowerCase().includes('pre board')) {
                const pbMatch = testName.match(/pre\s*[-]?\s*board\s*[-]?\s*(\d+)/i);
                normalizedType = pbMatch ? `Pre Board ${pbMatch[1]}` : 'Pre Board';
            }

            if (['Half Yearly', 'Re-Half Yearly', 'Annual Exam'].includes(normalizedType) || normalizedType.startsWith('Pre Board')) {
                category = 'Major Exams';
            }
        }

        if (category) {
            Object.keys(SUBJECT_MAP).forEach(key => {
                const subjName = SUBJECT_MAP[key];
                const m = row[key];
                const mm = row[`${key}(MM)`];

                if (typeof m === 'number' && typeof mm === 'number' && mm > 0) {
                    if (!subjectStats[category][subjName]) {
                        subjectStats[category][subjName] = { obtained: 0, max: 0 };
                    }
                    subjectStats[category][subjName].obtained += m;
                    subjectStats[category][subjName].max += mm;
                }
            });
        }
    });

    // Calculate final percentages for Subject Stats
    const subjectPerformance = {};
    Object.keys(subjectStats).forEach(cat => {
        const subjects = subjectStats[cat];
        if (Object.keys(subjects).length > 0) {
            subjectPerformance[cat] = Object.keys(subjects).map(sub => {
                const data = subjects[sub];
                const pct = data.max > 0 ? ((data.obtained / data.max) * 100).toFixed(1) : 0;
                return {
                    subject: sub,
                    percentage: parseFloat(pct)
                };
            });
        }
    });

    return { profile, tests: resultTests, history, graphs, subjectPerformance };
};
