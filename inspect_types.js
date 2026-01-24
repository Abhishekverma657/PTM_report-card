import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';

XLSX.set_fs(fs);

try {
    const fileBuffer = fs.readFileSync('./src/assets/result.xlsx');
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const testTypes = new Set();
    const testNames = new Set();

    data.forEach(row => {
        if (row['Test Type']) testTypes.add(row['Test Type']);
        if (row['Test Name']) testNames.add(row['Test Name']);
    });

    console.log("Unique Test Types:", Array.from(testTypes));
    console.log("Sample Test Names:", Array.from(testNames).slice(0, 10)); // Just first 10
} catch (e) {
    console.error("Error reading file:", e);
}
