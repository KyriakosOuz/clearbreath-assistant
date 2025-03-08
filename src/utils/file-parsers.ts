
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
  return JSON.parse(jsonContent);
}

// Handle data file parsing based on file type
export function parseDataFile(fileContent: string, fileType: string) {
  if (fileType === 'json') {
    return parseJSON(fileContent);
  } else if (fileType === 'csv') {
    return parseCSV(fileContent);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}
