# Security Bank Foundation: Integrated Education Program Monitoring, Reporting, and Impact Assessment System

An interactive enterprise web dashboard built specifically to demonstrate all 10 core modules, status matrices, and key questions outlined in the **Security Bank Foundation** program framework (*"Better Education. Brighter Futures."*).

---

## 🚀 How to Launch the Dashboard

### Option 1: Direct File Opening (Zero Install)
Simply double-click `index.html` in Windows Explorer to open the dashboard immediately in Google Chrome, Microsoft Edge, or any modern web browser.

### Option 2: Python Local Server (Recommended)
Double-click `start_dashboard.bat` or run:
```powershell
python run_dashboard.py
```
This serves the application on `http://localhost:8080/index.html` and automatically opens your default browser.

---

## 🌟 Key Features & Modules Implemented

### 1. School Building Condition Monitoring
- School profiles, classroom inventories, and structural ratings (0-100).
- Condition badges: `Good`, `Needs Monitoring`, `Needs Repair`, `Critical`.
- Interactive photo documentation gallery and inspection logs.
- "New Condition Assessment" form modal with live score calculations.

### 2. Teacher Competency & Training Monitoring
- Profiles for master educators in partnership with Ateneo de Manila and DLSU.
- Pre-Test vs Post-Test diagnostic scores and calculated % improvement gains.
- Competency statuses: `Improved`, `Maintained`, `Minimal Improvement`, `Requires Follow-up Training`.
- Radar breakdown across Pedagogy, Subject Mastery, and Digital Literacy.

### 3. Disaster Damage Reporting & Response
- Immediate calamity logging (Typhoons, Earthquakes, Flash Floods).
- Affected school and facility tagging with damage classifications.
- Severity matrix: `Minor`, `Moderate`, `Major`, `Critical`.
- Estimated repair cost in Philippine Pesos (PHP) and contractor rehabilitation status tracking.

### 4. Teacher Learning Cascade Tracking
- Measures the **SBF Knowledge Multiplier Effect**: 1 Master Teacher trained echoes into tens of peer teachers and hundreds of students through School-Based Learning Action Cells (LAC).
- Session tracking, duration, recipient teachers, topics shared, and student impact reach.

### 5. Scholar Tracer System
- College scholarship alumni directory with graduation batches and degrees.
- Employment status badges: `Employed`, `Seeking Employment`, `Further Studies`, `Unemployed`, `Information Not Updated`.
- Degree-to-job alignment tracking, employers, and annual tracer compliance reminders.

### 6. Dashboard & Analytics
- Executive KPI cards with sparkline statistics.
- Interactive Chart.js charts:
  - School Facility Condition Health Distribution (Doughnut)
  - Pre vs Post-Test Competency Gains (Bar)
  - Cascade Reach Multiplier by Division (Horizontal Bar & Line)
  - Scholar Tracer Employment Status Distribution (Doughnut)

### 7. Automated Reporting
- One-click PDF print-ready reports and CSV data export for:
  - School Infrastructure Audits
  - Teacher Competency Evaluations
  - Knowledge Cascade Multiplier Dossiers
  - Post-Disaster Calamity Summaries
  - Scholar Employability Reports
  - Annual Board Executive Impact Statements

### 8. Notifications & Alerts Center
- Real-time notification drawer with badge counters.
- Urgent disaster flags, critical facility submersion alerts, overdue 6-month reassessments, and stale scholar records.

### 9. User & Access Management (RBAC)
- Role Switcher in header: Switch active simulation between **Administrator**, **Foundation Staff**, **School Principal**, **Teacher / Master Trainer**, and **Scholar**.
- Tailored access permissions and action buttons per role.

### 10. Data Repository & Document Vault
- Centralized archive for architectural blueprints, DepEd Memoranda of Agreement (MOA), assessment guidelines, and photo evidence.

---

## 🎯 "Answer Key Questions" 1-Click Drilldowns
Located directly below the header bar, providing instant answers to the 7 core questions from the infographic:
1. **"Which schools need repair?"** &rarr; Filters to schools requiring repair or critical intervention.
2. **"Affected by recent disasters?"** &rarr; Jumps to active typhoon and flood disaster dockets.
3. **"Largest teacher improvement?"** &rarr; Ranks educators by highest pre-to-post test score gain.
4. **"Teachers cascaded training?"** &rarr; Shows master teachers with verified echo sessions.
5. **"Reached through cascading?"** &rarr; Displays cumulative teacher reach (175) and student impact (6,990+).
6. **"% Scholars employed?"** &rarr; Highlights current 83.3% graduate employment rate.
7. **"Scholar records needing update?"** &rarr; Filters to scholar profiles overdue for annual tracer check (>12 months).

---

## 📁 File Structure
```
sbf-education-system/
├── index.html              # Main single-page application
├── run_dashboard.py        # Python local web server launcher
├── start_dashboard.bat     # 1-click Windows batch launcher
├── README.md               # System documentation
├── css/
│   └── styles.css          # SBF brand tokens, status styles, print CSS
└── js/
    ├── data.js             # Comprehensive realistic Philippine seed dataset
    ├── charts.js           # Chart.js visualization engine
    └── app.js              # State management, view router, modals & RBAC
```
