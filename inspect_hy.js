import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';

XLSX.set_fs(fs);

try {
    const fileBuffer = fs.readFileSync('./src/assets/result.xlsx');
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const halfYearlyVariants = data.filter(r => r['Test Type'] && r['Test Type'].toLowerCase().includes('half'));

    halfYearlyVariants.forEach(r => {
        console.log(`Type: '${r['Test Type']}', Name: '${r['Test Name']}'`);
    });

} catch (e) {
    console.error("Error reading file:", e);
}
