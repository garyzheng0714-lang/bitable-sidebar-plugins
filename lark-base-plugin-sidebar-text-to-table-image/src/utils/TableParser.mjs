
export class TableParser {
  constructor() {
    this.validUnits = ['千焦', '克', '毫克', 'kJ', 'g', 'mg', 'kcal', 'ml'];
  }

  /**
   * Main parse method
   * @param {string} text 
   * @returns {Object} { headers: string[], rows: string[][] }
   */
  parse(text) {
    if (!text) return { headers: [], rows: [] };

    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    let headers = [];
    const rows = [];
    let isMarkdown = false;

    for (const line of lines) {
      const content = line.trim();
      
      // 1. Handle Header
      if (content.startsWith('# header:')) {
        headers = this.parseHeader(content);
        continue;
      } 
      
      // 2. Handle Separator
      if (this.isSeparator(content)) {
        isMarkdown = true;
        continue;
      } 
      
      // 3. Handle Data Row
      if (content.includes('|')) {
        const row = this.parseDataRow(content);
        if (row && row.length > 0) {
            rows.push(row);
        }
      }
    }

    return { headers, rows, metadata: { isMarkdown } };
  }

  /**
   * Parse header line starting with # header:
   */
  parseHeader(line) {
    const raw = line.replace('# header:', '').trim();
    return this.splitAndClean(raw);
  }

  /**
   * Parse data row and validate/format
   */
  parseDataRow(line) {
    const cells = this.splitAndClean(line);
    // cells structure: [Item, Value, NRV]
    
    // Validate Units (Column 2 usually)
    if (cells.length >= 2) {
       this.validateUnits(cells[1]);
    }

    // Format NRV (Column 3 usually)
    if (cells.length >= 3) {
       cells[2] = this.calculateNRV(cells[2]);
    }
    
    return cells;
  }

  /**
   * Helper to split by | and clean whitespace
   */
  splitAndClean(line) {
    let content = line;
    // Remove outer pipes if present, but be careful not to remove needed empty columns
    // Only remove leading pipe if strictly present
    if (content.startsWith('|')) {
        content = content.substring(1);
    }
    
    // Only remove trailing pipe if it matches a leading pipe logic OR if it's a standard table format
    // But for cases like "Key |", we want "Key" and "" (empty value)
    // If we strip the trailing pipe, "Key |" becomes "Key", splitting gives ["Key"] -> missing empty cell
    // So we should NOT strip trailing pipe blindly.
    // However, standard markdown is "| A | B |". We stripped leading. Now " A | B |".
    // If we don't strip trailing, split gives [" A ", " B ", ""]. The last empty string is unwanted.
    
    // Compromise: Split first, then clean up.
    // Actually, let's revert to a simpler logic that handles the "Key |" case
    
    // If it ends with '|' AND the last segment is effectively empty, it might be an outer pipe.
    // But "Key |" means "Key" and "Empty".
    // "| Key | Value |" means "", "Key", "Value", "".
    
    const hasLeading = line.trim().startsWith('|');
    const hasTrailing = line.trim().endsWith('|');
    
    let parts = line.split('|').map(c => c.trim());
    
    // If it had a leading pipe, the first element is usually empty (before the pipe)
    if (hasLeading && parts.length > 0 && parts[0] === '') {
        parts.shift();
    }
    
    // If it had a trailing pipe, the last element is usually empty
    // BUT, does "Key |" count as having a trailing pipe that should be removed?
    // If I write "Key |", parts is ["Key", ""].
    // If I write "| Key |", parts is ["", "Key", ""]. After shift: ["Key", ""].
    // If I write "| Key | Value |", parts is ["", "Key", "Value", ""]. After shift: ["Key", "Value", ""].
    // It seems we SHOULD remove the last element if it's empty AND we think it's an outer pipe.
    // But for "Key |", the last element IS the data (empty).
    
    // Heuristic: If we have explicit header or separator structure, we might be stricter.
    // For now, let's look at the user example: "其中包括： |" -> We want ["其中包括：", ""].
    // My previous logic stripped the pipe, leaving "其中包括： ".
    
    // Let's try: Don't strip trailing pipe string. Just split.
    // Then decide whether to drop the last empty item.
    // If the original line ended with '|', split produces an empty string at the end.
    // If that empty string is "extra" (outer pipe) vs "data" (empty cell).
    // In "Key |", the pipe is a separator. "Key" is col1. "" is col2.
    // In "| Key |", "Key" is col1.
    // It seems impossible to distinguish "Key |" (2 cols) from "| Key |" (1 col) purely by split?
    // Wait, "| Key |" -> split -> ["", "Key", ""].
    // "Key |" -> split -> ["Key", ""].
    // If we treat leading empty as "Leading Pipe removal", we are left with:
    // "| Key |" -> ["Key", ""]
    // "Key |" -> ["Key", ""]
    // They look the same!
    // But usually "| Key |" means 1 column. "Key |" means 2 columns.
    // This ambiguity is why Markdown tables usually require consistency.
    
    // However, the user example "其中包括： |" clearly implies a 2-column layout because other rows have 2 columns.
    // So context matters. But `splitAndClean` is stateless.
    
    // Strategy: Don't remove the last empty element.
    // Why? Because `rows` are array of strings. If we have extra empty string, it just renders an empty cell.
    // In "Key | Value", we have 2 cells.
    // In "| Key | Value |", we have 3 cells? No.
    // Let's rely on the user's data.
    // If I stop stripping the trailing pipe char manually, and just use split:
    // "Key |" -> ["Key", ""] (2 items). Correct for user.
    // "| Key | Value |" -> ["", "Key", "Value", ""] (4 items).
    // If I remove leading empty (caused by leading pipe), I get ["Key", "Value", ""]. (3 items).
    // The last empty item is the problem for standard tables.
    
    // Fix: Check if line starts with `|`. If so, remove first split result (if empty).
    // Check if line ends with `|`. If so, remove last split result (if empty) ONLY IF it looks like a standard table (starts with |)?
    // No, "Key |" ends with `|`.
    
    // Let's look at the failing test case again.
    // "其中包括： |" -> I stripped the pipe -> "其中包括： ". Split -> ["其中包括： "].
    // If I DON'T strip: "其中包括： |". Split -> ["其中包括： ", ""].
    
    // So, stripping the string is bad.
    // I should handle the array.
    
    if (content.startsWith('|')) {
         // It was an outer pipe. Remove the empty string before it.
         // Actually, let's just use the array logic.
    }
    
    parts = line.split('|').map(c => c.trim());
    
    // If original line started with '|', the first part is empty. Remove it.
    if (line.trim().startsWith('|')) {
        if (parts.length > 0 && parts[0] === '') {
            parts.shift();
        }
    }
    
    // If original line ended with '|', the last part is empty.
    // Should we remove it?
    // For "Key |", we want to KEEP it.
    // For "| Key |", we want to REMOVE it?
    // How to decide?
    // Maybe we don't remove it?
    // If I leave it, "| Key |" -> ["Key", ""].
    // If rendered, it shows a second empty column.
    // Is that acceptable?
    // Given the user's specific "KV" format "Key | Value", they probably don't use leading pipes.
    // And for "Key |", they need the empty value.
    // So preserving it is safer for this use case.
    
    // BUT, for standard Markdown `| A | B |`, we get `A, B, empty`.
    // Maybe we can check if the line *starts* with `|` AND *ends* with `|`.
    // If both, we assume standard "enclosed" format and strip both ends.
    // If only ends with `|`, we assume "Key |" format and keep the end.
    
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        if (parts.length > 0 && parts[parts.length - 1] === '') {
            parts.pop();
        }
    }
    
    return parts;
  }

  /**
   * Check if line is a markdown separator
   */
  isSeparator(line) {
    // Matches |---|---| or | :--- | etc.
    return /^\|?[\s\-:|]+\|?$/.test(line) && line.includes('-');
  }

  /**
   * Validate unit presence
   */
  validateUnits(valueStr) {
    // Try to match number + unit
    // This regex matches "87千焦", "1.2克", "0g"
    // It's a loose check
    const match = valueStr.match(/^[\d.]+\s*(.+)$/);
    if (match) {
       const unit = match[1];
       // Check if unit is in valid list (or part of it)
       const isValid = this.validUnits.some(u => unit.includes(u));
       if (!isValid) {
          console.warn(`[TableParser] Potential invalid unit: ${unit} in value ${valueStr}`);
       }
    }
    return true;
  }

  /**
   * Calculate/Format NRV
   * Converts 0.01 -> 1%
   */
  calculateNRV(value) {
    // Check if it's a decimal number like 0.01, 0.15
    if (/^0\.\d+$/.test(value)) {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            return Math.round(num * 100) + '%';
        }
    }
    return value;
  }
}

// Simple Test Runner
export const runTests = () => {
    const parser = new TableParser();
    console.log('--- Starting TableParser Tests ---');

    const input = `# header: 项目 | 每份（15毫升） | 营养素参考值%
能量 | 87千焦 | 0.01
蛋白质 | 1.2克 | 0.02
脂肪 | 0克 | 0.0
碳水化合物 | 3.9克 | 0.01
钠 | 1298毫克 | 0.65`;

    const result = parser.parse(input);
    
    console.assert(result.headers.length === 3, 'Header length should be 3');
    console.assert(result.headers[0] === '项目', 'Header 1 match');
    console.assert(result.rows.length === 5, 'Rows length should be 5');
    
    // Check Row 1: 能量 | 87千焦 | 0.01 -> 1%
    console.assert(result.rows[0][0] === '能量', 'Row 1 Item match');
    console.assert(result.rows[0][1] === '87千焦', 'Row 1 Value match');
    console.assert(result.rows[0][2] === '1%', 'Row 1 NRV format match (0.01 -> 1%)');

    console.log('Test Result:', result);
    console.log('--- Tests Completed ---');
}
