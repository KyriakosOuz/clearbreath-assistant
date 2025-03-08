
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
