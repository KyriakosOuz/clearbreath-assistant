
// File parsers for different file formats

import * as XLSX from "https://esm.sh/xlsx@0.18.5";

// Parse CSV data
export function parseCSV(csvContent: string) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      
      return row;
    });
}

// Parse JSON data
export function parseJSON(jsonContent: string) {
  try {
    const data = JSON.parse(jsonContent);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return [];
  }
}

// Parse XLSX data
export function parseXLSX(fileData: ArrayBuffer) {
  try {
    const workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' });
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with headers
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    console.error("Error parsing XLSX:", error);
    return [];
  }
}
