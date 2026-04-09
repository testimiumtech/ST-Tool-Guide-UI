const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the JSON data
const jsonPath = path.join(__dirname, 'public/data/commands.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Create a new workbook
const wb = XLSX.utils.book_new();

// Convert commands array to worksheet
const commands = jsonData.commands;

// Flatten the structure for better spreadsheet representation
const flattenedData = commands.map(cmd => ({
  'Command ID': cmd.command_id,
  'Category': cmd.category,
  'Title': cmd.title,
  'Description': cmd.description,
  'Is New': cmd.is_new ? 'YES' : 'NO',
  'Order': cmd.order_key || cmd.order,
  'Keywords': cmd.keywords ? cmd.keywords.join(', ') : '',
  'Purpose': cmd.purpose,
  'Syntax': cmd.syntax,
  'Detailed Usage': cmd.detailed_usage && (cmd.detailed_usage.label || cmd.detailed_usage.desc || cmd.detailed_usage.cmd)
    ? JSON.stringify(cmd.detailed_usage)
    : '',
  'Options Count': cmd.options ? cmd.options.length : 0,
  'Options': cmd.options && cmd.options.length > 0 ? JSON.stringify(cmd.options, null, 2) : '',
  'Use Cases': cmd.use_cases,
  'Example': cmd.examples && cmd.examples.length > 0 ? JSON.stringify({ examples: cmd.examples }, null, 2) : '',
  'When to Use': cmd.when_to_use,
  'Troubleshooting & Notes': cmd.troubleshooting_notes || '',
  'Related Commands': cmd.related_commands ? cmd.related_commands.join(', ') : '',
  'Last Updated': cmd.last_updated || '',
  'Other Feature': cmd.other_feature || '',
  'Assert Params': cmd.assert_params && cmd.assert_params.length > 0 ? JSON.stringify(cmd.assert_params, null, 2) : '',
  'Input Params': cmd.input_params && cmd.input_params.length > 0 ? JSON.stringify(cmd.input_params, null, 2) : '',
  'Exclude Patterns': cmd.exclude_patterns || ''
}));

// Add main sheet
const ws = XLSX.utils.json_to_sheet(flattenedData);
XLSX.utils.book_append_sheet(wb, ws, 'Commands');

// Add a metadata sheet
const metadata = [
  ['Property', 'Value'],
  ['Total Commands', commands.length],
  ['Generated', new Date().toISOString()],
  ['Format', 'XLSX'],
  ['Version', '1.0']
];
const metaWs = XLSX.utils.aoa_to_sheet(metadata);
XLSX.utils.book_append_sheet(wb, metaWs, 'Metadata');

// Set column widths
ws['!cols'] = [
  { wch: 18 }, // Command ID
  { wch: 15 }, // Category
  { wch: 25 }, // Title
  { wch: 35 }, // Description
  { wch: 8 },  // Is New
  { wch: 8 },  // Order
  { wch: 30 }, // Keywords
  { wch: 40 }, // Purpose
  { wch: 30 }, // Syntax
  { wch: 50 }, // Detailed Usage
  { wch: 12 }, // Options Count
  { wch: 40 }, // Options
  { wch: 40 }, // Use Cases
  { wch: 40 }, // Example
  { wch: 40 }, // When to Use
  { wch: 40 }, // Troubleshooting & Notes
  { wch: 30 }, // Related Commands
  { wch: 15 }, // Last Updated
  { wch: 30 }, // Other Feature
  { wch: 40 }, // Assert Params
  { wch: 40 }, // Input Params
  { wch: 30 }  // Exclude Patterns
];

// Save the workbook
const outputPath = path.join(__dirname, 'public/data/commands.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`✅ XLSX file generated successfully: ${outputPath}`);
console.log(`📊 Total commands: ${commands.length}`);
console.log(`📝 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
