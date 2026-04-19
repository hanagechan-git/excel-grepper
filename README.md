# Excel Grepper

Search inside Excel files (.xlsx / .xlsm) directly from VS Code.

---

## ✨ Features
![Excel Grepper Demo](https://raw.githubusercontent.com/hanagechan-git/excel-grepper/main/images/demo.gif)
* 🔍 Search text inside Excel files (cells & shapes)
* 📁 Recursive search in folders
* 🔡 Case-insensitive search option
* 📅 Date cell search (Excel‑compatible date matching)
* 📊 Results displayed in a table view
* 🔗 Click to open Excel file
* 📤 Export results to CSV (with hyperlinks)
* 🌐 Multi-language support (English / Japanese)

---

## 📦 Usage

1. Run command:

```
Excel Grepper: Run
```

2. Enter:

   * Folder path
   * Keyword
   * Case sensitivity option
   * (Optional) Enable Date search

3. Click **Search**

---

## 📅 Date Search
Excel Grepper can search date‑typed cells using Excel’s internal date serial system.

### Supported formats
Date search accepts 8‑digit date masks using numbers and *.

Examples:
* `20260420` — exact date
* `202604**` — any day in April 2026
* `2026****` — any date in 2026
* `****0420` — any year, April 20
* `******20` — any day ending with 20

Rules
* Exactly 8 characters
* Allowed characters: 0–9 and *
* `*` must be used in year / month / day units
  * e.g., YYYYMM**, YYYY****, ****MMDD
* Patterns like 20*6*1* are not supported
* Only date‑typed cells are matched
  * (text cells containing date-like strings are not included)

---

## 🔍 Result View

* Displays:

  * File name
  * Sheet name
  * Cell address
  * Matched text
  * Shape number (if applicable)

* Click a result → Opens the Excel file

---

## 📤 Export CSV

* Export search results as CSV
* Includes clickable Excel hyperlinks

---

## ⚠️ Notes

* Supports:

  * `.xlsx`
  * `.xlsm`
* Does NOT support:

  * `.xls` (legacy format)
* Large folders may take time to process

---

## 🧪 Known Limitations

* Direct cell jump in Excel is not implemented yet
* Very large Excel files may impact performance

---

## 🛠 Development

Built with:

* TypeScript
* VS Code Extension API
* JSZip

---

## 📄 License

MIT License
