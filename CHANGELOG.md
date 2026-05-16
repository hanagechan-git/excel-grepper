# Change Log

All notable changes to the "excel-grepper" extension will be documented in this file.

# 1.9.0
## Regex Search
- Added support for JavaScript‑compatible regular expressions

## 1.8.0
### Performance Improvements
- Added parallel search that processes multiple files simultaneously
- Automatically selects the optimal number of workers based on CPU cores
- Significant speed improvements in environments with large numbers of files  
  (1.5× to 3× faster depending on the system)

## 1.7.0
- It supports multiple languages... probably. Depends on the environment.

## 1.6.0
- Date search results now show human-readable dates instead of Excel serial numbers.  
  (YYYY/MM/DD for Japanese locale, YYYY-MM-DD for others)

## 1.5.0
### Date cell search
- Added support for searching date‑typed cells using Excel‑compatible date serial logic
- Accepts 8‑digit date masks using numbers and *
- Examples: 20260420, 202604**, 2026****, ****0420, ******20
- Matches only true date‑typed cells, not text-formatted dates
- Fully compatible with Excel’s internal date system (including the 1900‑02‑29 behavior)

## 1.4.0
### Added real‑time search progress display.
- The number of scanned files and the file currently being processed are now shown during searches, making progress easier to understand.

### Added a results‑area notice for Excel files with abnormally large internal structures.
- Files that could not be processed due to extremely large internal XML structures are now listed with their relative paths so users can identify them easily.

## 1.3.0
- You can now select folders located on a file server when starting a search

## 1.2.0
- Improved behavior when switching tabs  
  Search status (searching / search results) is now correctly restored after switching tabs
- Internal code cleanup for improved stability  

## 1.1.0
- Bug fix

## 1.0.2
- Fully bundled extension to reduce VSIX size
- Improved packaging structure using esbuild
- Updated .vscodeignore to exclude unnecessary files

## 1.0.1
- Fixed minor typo in README
- Updated documentation wording for clarity

## 1.0.0 - 2026-03-24
- Initial release
