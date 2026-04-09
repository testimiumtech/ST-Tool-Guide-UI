# Data Management Guide: XLSX & JSON Workflow

## Overview
This application uses **JSON** as the primary data source for fast, reliable loading. Users can edit data in **Excel (XLSX)** and automatically convert it to JSON using simple commands.

## File Locations
- **XLSX File (Edit here)**: `public/data/commands.xlsx`
- **JSON File (App loads this)**: `public/data/commands.json`
- **Conversion Scripts**: `generate-xlsx.js` and `xlsx-to-json.js`

### Worksheet Name Rule
- Preferred sheet name: `Commands`
- Fallback behavior: if `Commands` is missing, converter uses the first worksheet and logs a warning.

## How It Works

### Workflow Diagram
```
Your Excel File
    ↓ (Edit in Excel)
commands.xlsx
    ↓ (npm run xlsx-to-json)
Conversion Process
    ↓
commands.json (Generated)
    ↓ (App loads)
Browser Display
```

## Two Ways to Manage Data

### Method 1: Direct JSON Editing (Fastest)
For quick changes:

```bash
# 1. Edit public/data/commands.json directly
# 2. Save the file
npm start
# 3. Changes appear instantly!
```

### Method 2: Excel Editing (User-Friendly) ⭐ RECOMMENDED
For non-technical users:

```bash
# 1. Open public/data/commands.xlsx in Excel/Google Sheets
# 2. Edit the "Commands" sheet
# 3. Save the file
npm run xlsx-to-json
# 4. JSON updates automatically
npm start
# 5. Changes appear instantly!
```

## XLSX File Structure

### Sheet 1: "Commands" (Main Data)
Contains all command documentation with these columns:

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| Command ID | Text | ✅ | Unique identifier (lowercase, no spaces) |
| Category | Text | ✅ | Browser, Navigation, Interaction, etc. |
| Title | Text | ✅ | Display name of the command |
| Description | Text | ✅ | One-line description |
| Is New | Text | ❌ | Enter `YES` for new commands, empty otherwise |
| Order | Number / Hierarchical Number | ✅ | Supports `1`, `2`, and child format like `1.1`, `1.2`, `2.1` |
| Keywords | Text | ❌ | Comma-separated: `exit, quit, terminate` |
| Purpose | Text | ✅ | What does this command do? |
| Syntax | Text | ✅ | Code syntax example |
| Detailed Usage | JSON | ❌ | JSON object: `{"label": "...", "desc": "...", "cmd": "..."}` |
| Options Count | Number | ❌ | Auto-calculated |
| Options | JSON Array | ❌ | JSON array of option objects (see below) |
| Use Cases | Text | ✅ | When to use this command |
| Example | JSON | ✅ | JSON object with `examples` array (see below) |
| When to Use | Text | ✅ | Practical usage guidance |
| Troubleshooting & Notes | Text | ❌ | Tips, edge cases, or common issues |
| Related Commands | Text | ❌ | Comma-separated command IDs |
| Last Updated | Date | ❌ | YYYY-MM-DD format |
| Other Feature | Text | ❌ | Extra details or optional features |
| Assert Params | JSON | ❌ | JSON blocks for assert params (see below) |
| Input Params | JSON | ❌ | JSON blocks for input params (see below) |
| Exclude Patterns | Text | ❌ | Patterns excluded during comparisons |

### Sheet 2: "Metadata" (Read-Only)
Contains file information:
- Total Commands
- Generated date
- Format version

## Step-by-Step: Adding a New Command

### In Excel/Google Sheets:

1. **Open** `public/data/commands.xlsx`
2. **Go to** "Commands" sheet
3. **Add new row** at the end
4. **Fill in required fields**:
   ```
   Command ID:     new-command
   Category:       Browser
   Title:          New Command Name
   Description:    Brief description here
   Order:          7 (next sequential)
   Purpose:        ✅ What it does
   Syntax:         ✅ browser.newCommand()
   Use Cases:      ✅ When to use it
   Example:        ✅ await browser.newCommand();
   When to Use:    ✅ Usage guidance
   ```
5. **Save** the file
6. **Run conversion**:
   ```bash
   npm run xlsx-to-json
   ```
7. **Start/refresh** app:
   ```bash
   npm start
   ```

## Special Field Formats

### Order (Parent / Child Structure)
Use hierarchical numbering to represent parent-child relationships.

Examples:
```
1
1.1
1.2
2
2.1
```

Conversion output includes:
- `order` (numeric parent, backward compatible)
- `order_key` (full hierarchical key like `1.2`)
- `parent_order_key` (parent key like `1` for `1.2`)
- `hierarchy` metadata (`depth`, `path`, `segments`)

This lets UI and code handle parent/child rows reliably.

### Keywords
Separate with commas:
```
exit, quit, session, terminate, kill
```

### Options
Options must be a JSON array of objects:

```json
[
   {
      "label": "Default Behavior",
      "desc": "Closes all opened tabs except the main tab.",
      "cmd": "CloseAllBrowserTab",
      "usage_example": "CloseAllBrowserTab"
   }
]
```

### Detailed Usage
Enter as a JSON object with three fields:
```json
{"label": "Tab Closure", "desc": "Closes the active tab by default. If an index is specified, then it closes the tab with that index.", "cmd": "CloseBrowserTab 2"}
```

**Format:**
- `label`: Short title for the usage scenario
- `desc`: Detailed description of what it does
- `cmd`: Example command with parameters

**Example:**
```json
{"label": "Close Specific Tab", "desc": "Closes tab at index 2", "cmd": "CloseBrowserTab 2"}
```

**Leave empty if not needed:**
```
(empty cell)
```

### Example (JSON)

The `Example` column expects JSON with an `examples` array:

```json
{
   "examples": [
      {
         "example_id": "1.1",
         "command": "OpenUrl http://localhost:8080",
         "description": "Opens the BackOffice app directly.",
         "output": "PASS: URL opened successfully.\nFAIL: Unable to open URL."
      }
   ]
}
```

`example_id` is optional. If omitted, it is auto-generated using row order (`order_key`) + index.

### Assert Params / Input Params

These fields support JSON blocks. Each block should contain `label`, `desc`, and `example`:

```json
{
   "label": "Assert Params (Direct Expected Values)",
   "desc": "Compares SQL results against expected values.",
   "example": {
      "assertParams": {
         "verifyExpected-1": {
            "expectedParams": {
               "CUSTOMER_ID": "2",
               "PRICE_CODE": "AB"
            }
         }
      }
   }
}
```

Multiple blocks can be placed in the same cell separated by blank lines.

### Related Commands
Comma-separated command IDs:
```
open-tab, refresh-page, switch-tab
```

### Is New
Enter exactly `YES` for new commands (case-insensitive):
```
YES        ← Shows "NEW" badge
NO         ← Normal badge
(empty)    ← Normal badge
```

## Commands Available

### Generate XLSX from JSON
Use this if you manually edited JSON and want to create an XLSX file:
```bash
npm run generate-xlsx
```

### Convert XLSX to JSON
Use this after editing the XLSX file:
```bash
npm run xlsx-to-json
```

### Start Dev Server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

## Troubleshooting

### Issue: Changes not appearing
```bash
# 1. Make sure you ran the conversion
npm run xlsx-to-json

# 2. Check if conversion succeeded (should show ✅)
# 3. Refresh browser (Ctrl+R or Cmd+R)
# 4. Check browser console for errors (F12)
```

### Issue: JSON has merge conflicts
```bash
# Regenerate from XLSX
npm run xlsx-to-json

# Or regenerate from JSON to XLSX
npm run generate-xlsx
```

### Issue: XLSX file corrupted
```bash
# Regenerate from current JSON
npm run generate-xlsx

# This creates a fresh XLSX file
```

### Issue: Conversion fails
```bash
# Check Node.js is installed
node --version

# Reinstall dependencies
npm install

# Try conversion again
npm run xlsx-to-json
```

## Performance & File Sizes

| File | Size | Load Time | Browser Parse |
|------|------|-----------|---|
| commands.json | ~10 KB | <50ms | Native (instant) |
| commands.xlsx | ~27 KB | ~200ms | Conversion needed |

**Why JSON is used in app:**
- ✅ Native JavaScript format
- ✅ Instant parsing
- ✅ No external dependencies needed
- ✅ Works offline

**Why XLSX for editing:**
- ✅ Familiar Excel interface
- ✅ Easy for non-technical users
- ✅ Better for large datasets
- ✅ Built-in validation

## Best Practices

### Do ✅
- Use lowercase command IDs with hyphens: `my-command`
- Keep descriptions under 100 characters
- Use consistent category names
- Fill all required fields
- Use YYYY-MM-DD date format
- Back up XLSX before major changes
- Test changes before committing

### Don't ❌
- Change column headers
- Leave required fields empty
- Use special characters in Command ID
- Delete entire sheets
- Rename sheets
- Change the order of columns
- Use inconsistent formatting

## Recommended Workflow for Teams

1. **Primary Editor** maintains `public/data/commands.xlsx` in Excel
2. **Run conversion** when changes are made:
   ```bash
   npm run xlsx-to-json
   ```
3. **Commit both files** to version control:
   ```bash
   git add public/data/commands.*
   git add package.json
   git commit -m "Update: add new command"
   ```
4. **Other developers** pull changes:
   ```bash
   git pull
   npm start  # JSON is ready to use
   ```

## File Sync Process

When you run conversion:
```
Input: commands.xlsx
  ↓
Process:
  - Read Excel file
  - Extract "Commands" sheet
  - Parse all rows
  - Transform to JSON objects
  - Sort by order
  - Validate fields
  ↓
Output: commands.json
  - Pretty-printed (2-space indent)
  - Sorted by order field
  - All fields included
  - Ready for app to load
```

## Support

**Issue**: File won't open in Excel
- Try LibreOffice Calc or Google Sheets
- Check file isn't locked by another app
- Regenerate: `npm run generate-xlsx`

**Issue**: Conversion errors
- Check Excel file has "Commands" sheet
- Verify headers match exactly (case-sensitive)
- Look for invalid characters
- Check browser console for details

**Issue**: Data not updating
- Verify conversion succeeded
- Check JSON file timestamp updated
- Refresh browser multiple times
- Clear browser cache (Ctrl+Shift+Delete)

## Tips & Tricks

### Quick JSON Edit
For fast updates without Excel:
```bash
# Edit the JSON directly
nano public/data/commands.json

# Or use your editor
code public/data/commands.json
```

### Batch Operations
To add multiple commands:
1. Edit XLSX file
2. Add all rows
3. Run conversion once
4. All update together

### Backup Strategy
```bash
# Before major changes
cp public/data/commands.xlsx public/data/commands.xlsx.backup
cp public/data/commands.json public/data/commands.json.backup
```

### Git Ignore Pattern
```gitignore
# If you want JSON auto-generated
public/data/commands.json

# Or track both
# (Keep both in version control)
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024 | Initial XLSX + JSON workflow |

## Summary

**The easiest way:**
1. Edit `public/data/commands.xlsx` in Excel
2. Run `npm run xlsx-to-json`
3. Changes appear instantly!

**For developers:**
1. Edit `public/data/commands.json` directly
2. Save and refresh browser
3. That's it!

---

**For questions or issues**, check the troubleshooting section above or create an issue in the repository.

**Last Updated**: February 2024  
**Supported Formats**: JSON (primary), XLSX (for editing)  
**Node Version**: 14+  
**Package**: xlsx@^0.18.5
