// Security Bank Foundation - Integrated Education Program Monitoring System
// Main Application Controller

const App = {
  currentModule: 'overview',
  currentRole: 'Administrator',
  searchQuery: '',
  filterStatus: 'ALL',

  init() {
    this.bindEvents();
    this.updateRoleUI();
    this.updateNotificationBadge();
    this.renderCurrentView();
  },

  bindEvents() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const module = tab.dataset.module;
        this.switchModule(module);
      });
    });

    // Role switcher
    const roleSelect = document.getElementById('roleSelector');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        this.currentRole = e.target.value;
        this.updateRoleUI();
        this.renderCurrentView();
        this.showToast(`Switched active role to: ${this.currentRole}`);
      });
    }

    // Global Search
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderCurrentView();
      });
    }

    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAllModals();
    });
  },

  switchModule(moduleId) {
    this.currentModule = moduleId;
    this.filterStatus = 'ALL';
    this.searchQuery = '';
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) searchInput.value = '';

    // Update active nav tab
    document.querySelectorAll('.nav-tab').forEach(t => {
      if (t.dataset.module === moduleId) {
        t.classList.add('active', 'bg-emerald-50', 'text-emerald-800', 'font-bold', 'border-l-4', 'border-emerald-600');
        t.classList.remove('text-slate-600', 'hover:bg-slate-100');
      } else {
        t.classList.remove('active', 'bg-emerald-50', 'text-emerald-800', 'font-bold', 'border-l-4', 'border-emerald-600');
        t.classList.add('text-slate-600', 'hover:bg-slate-100');
      }
    });

    // Mobile menu close if exists
    const mobileSidebar = document.getElementById('mobileSidebar');
    if (mobileSidebar && !mobileSidebar.classList.contains('hidden')) {
      mobileSidebar.classList.add('hidden');
    }

    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  updateRoleUI() {
    const roleDisplay = document.getElementById('currentRoleDisplay');
    const roleBadge = document.getElementById('currentRoleBadge');
    if (roleDisplay) roleDisplay.textContent = this.currentRole;
    if (roleBadge) {
      const colors = {
        'Administrator': 'bg-purple-100 text-purple-800 border-purple-200',
        'Foundation Staff': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'School Principal': 'bg-blue-100 text-blue-800 border-blue-200',
        'Teacher / Master Trainer': 'bg-amber-100 text-amber-800 border-amber-200',
        'Scholar': 'bg-teal-100 text-teal-800 border-teal-200'
      };
      roleBadge.className = `text-xs px-2.5 py-1 rounded-full border font-medium ${colors[this.currentRole] || 'bg-slate-100 text-slate-700'}`;
      roleBadge.textContent = this.currentRole;
    }
  },

  updateNotificationBadge() {
    const unreadCount = SBF_DATA.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notifBadge');
    if (badge) {
      badge.textContent = unreadCount;
      if (unreadCount === 0) {
        badge.classList.add('hidden');
      } else {
        badge.classList.remove('hidden');
      }
    }
  },

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const bg = type === 'success' ? 'bg-emerald-700' : type === 'info' ? 'bg-[#002B49]' : 'bg-rose-700';
    toast.className = `fixed bottom-5 right-5 z-50 flex items-center gap-3 text-white px-5 py-3 rounded-lg shadow-xl text-sm transition-all transform duration-300 translate-y-10 opacity-0 ${bg}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'} text-lg"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-4');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // ----------------------------------------------------
  // "Answer Key Questions" Preset Handler
  // Corresponds to the 7 core questions at the bottom of the infographic
  // ----------------------------------------------------
  answerKeyQuestion(questionKey) {
    switch (questionKey) {
      case 'q1_schools_repair':
        // "Which schools need repair?"
        this.switchModule('schools');
        this.filterStatus = 'REPAIR_NEEDED';
        this.renderSchoolsView();
        this.showToast("Filtered to schools tagged as 'Needs Repair' or 'Critical' condition.", 'info');
        break;

      case 'q2_disaster_affected':
        // "Which schools were affected by recent disasters?"
        this.switchModule('disaster');
        this.renderDisasterView();
        this.showToast("Showing all schools impacted by recent Typhoons, Earthquakes, and Flooding.", 'info');
        break;

      case 'q3_teachers_improvement':
        // "Which teachers showed the largest improvement?"
        this.switchModule('teachers');
        this.filterStatus = 'TOP_IMPROVEMENT';
        this.renderTeachersView();
        this.showToast("Sorted teachers by highest Pre-to-Post test gain percentage.", 'info');
        break;

      case 'q4_teachers_cascaded':
        // "Which teachers have cascaded their training?"
        this.switchModule('cascade');
        this.renderCascadeView();
        this.showToast("Displaying master teachers who have completed echo/cascade sessions.", 'info');
        break;

      case 'q5_cascade_reach':
        // "How many teachers were reached through cascading?"
        this.switchModule('cascade');
        this.renderCascadeView();
        const totalReached = SBF_DATA.cascadeActivities.reduce((acc, c) => acc + c.recipientTeacherCount, 0);
        const totalStudents = SBF_DATA.cascadeActivities.reduce((acc, c) => acc + c.recipientStudentImpact, 0);
        this.showToast(`Total reach: ${totalReached} teachers trained; ${totalStudents.toLocaleString()} students impacted!`, 'success');
        break;

      case 'q6_scholar_employment':
        // "What percentage of scholars are employed?"
        this.switchModule('scholars');
        const employed = SBF_DATA.scholars.filter(s => s.employmentStatus === 'Employed').length;
        const totalScholars = SBF_DATA.scholars.length;
        const empRate = Math.round((employed / totalScholars) * 100);
        this.renderScholarsView();
        this.showToast(`Scholar Employment Rate: ${empRate}% (${employed} of ${totalScholars} tracked graduates employed).`, 'success');
        break;

      case 'q7_scholar_updates_needed':
        // "Which scholar records need updating?"
        this.switchModule('scholars');
        this.filterStatus = 'Information Not Updated';
        this.renderScholarsView();
        this.showToast("Filtered to scholars with outdated records (>12 months without update).", 'info');
        break;

      default:
        this.switchModule('overview');
    }
  },

  // ----------------------------------------------------
  // View Router
  // ----------------------------------------------------
  renderCurrentView() {
    const main = document.getElementById('mainContentArea');
    if (!main) return;

    switch (this.currentModule) {
      case 'overview':
        this.renderOverviewView();
        break;
      case 'schools':
        this.renderSchoolsView();
        break;
      case 'teachers':
        this.renderTeachersView();
        break;
      case 'disaster':
        this.renderDisasterView();
        break;
      case 'cascade':
        this.renderCascadeView();
        break;
      case 'scholars':
        this.renderScholarsView();
        break;
      case 'prioritization':
        this.renderPrioritizationView();
        break;
      case 'reporting':
        this.renderReportingView();
        break;
      case 'notifications':
        this.renderNotificationsView();
        break;
      case 'repository':
        this.renderRepositoryView();
        break;
      case 'users':
        this.renderUsersView();
        break;
      default:
        this.renderOverviewView();
    }
  },

  // ====================================================
  // VIEW: Module 6 & Executive Overview
  // ====================================================
  renderOverviewView() {
    const main = document.getElementById('mainContentArea');
    const totalSchools = SBF_DATA.schools.length;
    const criticalSchools = SBF_DATA.schools.filter(s => s.conditionStatus === 'Critical').length;
    const totalTeachers = SBF_DATA.teachers.length;
    const teachersCascaded = SBF_DATA.teachers.filter(t => t.cascaded).length;
    const totalCascadedTeachers = SBF_DATA.cascadeActivities.reduce((a, b) => a + b.recipientTeacherCount, 0);
    const totalStudentsImpacted = SBF_DATA.cascadeActivities.reduce((a, b) => a + b.recipientStudentImpact, 0);
    const employedScholars = SBF_DATA.scholars.filter(s => s.employmentStatus === 'Employed').length;
    const scholarEmploymentRate = Math.round((employedScholars / SBF_DATA.scholars.length) * 100);
    const totalDisasters = SBF_DATA.disasterReports.length;
    const activeRepairCost = SBF_DATA.disasterReports.reduce((acc, d) => acc + d.estimatedRepairCostPHP, 0);

    main.innerHTML = `
      <!-- Program Header Banner -->
      <div class="bg-gradient-to-r from-[#002B49] via-[#083c66] to-[#008752] text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-lg relative overflow-hidden">
        <div class="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-6">
          <i class="fa-solid fa-graduation-cap text-9xl"></i>
        </div>
        <div class="relative z-10 max-w-3xl">
          <div class="flex items-center gap-2 mb-2">
            <span class="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full">
              SBF Enterprise Monitoring Portal
            </span>
            <span class="text-xs text-slate-300">Live Academic Year 2026</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Integrated Education Program Monitoring, Reporting, and Impact Assessment System
          </h1>
          <p class="text-slate-200 text-sm sm:text-base leading-relaxed">
            Empowering <strong>Security Bank Foundation</strong> with centralized real-time intelligence across classroom infrastructure health, teacher pedagogical competency gains, cascade multiplier reach, disaster rehabilitation, and graduate scholar employability.
          </p>
          <div class="flex flex-wrap gap-3 mt-5">
            <button onclick="App.openModal('reportModal')" class="bg-[#008752] hover:bg-[#00683f] text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow transition">
              <i class="fa-solid fa-file-arrow-down"></i> Generate Consolidated Impact Report
            </button>
            <button onclick="App.switchModule('prioritization')" class="bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur transition border border-white/20">
              <i class="fa-solid fa-bullseye"></i> View Urgent Prioritization Matrix
            </button>
          </div>
        </div>
      </div>

      <!-- High-Impact KPI Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <!-- KPI 1: Schools Monitored -->
        <div class="kpi-card bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm relative overflow-hidden cursor-pointer" onclick="App.switchModule('schools')">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">School Infrastructure</p>
              <h3 class="text-2xl font-bold text-slate-800 mt-1">${totalSchools} Schools</h3>
            </div>
            <div class="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              <i class="fa-solid fa-school"></i>
            </div>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
              ${criticalSchools} Critical
            </span>
            <span class="text-slate-500">68 Total Classrooms</span>
          </div>
          <div class="mt-3 text-xs text-blue-600 font-medium flex items-center gap-1">
            <span>View condition logs</span> <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </div>
        </div>

        <!-- KPI 2: Teacher Competency Gain -->
        <div class="kpi-card bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm relative overflow-hidden cursor-pointer" onclick="App.switchModule('teachers')">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Teacher Competency</p>
              <h3 class="text-2xl font-bold text-slate-800 mt-1">${totalTeachers} Master Teachers</h3>
            </div>
            <div class="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              <i class="fa-solid fa-chalkboard-user"></i>
            </div>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              +42.8% Avg Gain
            </span>
            <span class="text-slate-500">Pre vs Post Test</span>
          </div>
          <div class="mt-3 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span>Explore training records</span> <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </div>
        </div>

        <!-- KPI 3: Cascade Knowledge Multiplier -->
        <div class="kpi-card bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm relative overflow-hidden cursor-pointer" onclick="App.switchModule('cascade')">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cascade Multiplier</p>
              <h3 class="text-2xl font-bold text-slate-800 mt-1">${totalCascadedTeachers} Teachers Reached</h3>
            </div>
            <div class="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
              <i class="fa-solid fa-people-arrows"></i>
            </div>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              ${totalStudentsImpacted.toLocaleString()} Students
            </span>
            <span class="text-slate-500">Beneficiary Reach</span>
          </div>
          <div class="mt-3 text-xs text-amber-600 font-medium flex items-center gap-1">
            <span>Review cascade sessions</span> <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </div>
        </div>

        <!-- KPI 4: Scholar Employment Rate -->
        <div class="kpi-card bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm relative overflow-hidden cursor-pointer" onclick="App.switchModule('scholars')">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scholar Tracer</p>
              <h3 class="text-2xl font-bold text-slate-800 mt-1">${scholarEmploymentRate}% Employed</h3>
            </div>
            <div class="w-11 h-11 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-lg">
              <i class="fa-solid fa-user-graduate"></i>
            </div>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
              ${employedScholars} of ${SBF_DATA.scholars.length} Graduates
            </span>
            <span class="text-slate-500">100% Degree Aligned</span>
          </div>
          <div class="mt-3 text-xs text-teal-600 font-medium flex items-center gap-1">
            <span>Track alumni careers</span> <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </div>
        </div>
      </div>

      <!-- Interactive Charts Grid (Module 6) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Chart 1: School Condition Status -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h3 class="font-bold text-slate-800 text-base">School Facility Condition Distribution</h3>
              <p class="text-xs text-slate-500">Building structural health across surveyed regions</p>
            </div>
            <button onclick="App.switchModule('schools')" class="text-xs text-emerald-700 font-semibold hover:underline">
              Inspect All &rarr;
            </button>
          </div>
          <div class="h-64 relative">
            <canvas id="facilityStatusChart"></canvas>
          </div>
          <div class="grid grid-cols-4 gap-2 text-center mt-3 pt-3 border-t border-slate-100 text-xs">
            <div><span class="inline-block w-2.5 h-2.5 rounded-full bg-[#22c55e] mr-1"></span>Good: <strong>2</strong></div>
            <div><span class="inline-block w-2.5 h-2.5 rounded-full bg-[#eab308] mr-1"></span>Monitoring: <strong>2</strong></div>
            <div><span class="inline-block w-2.5 h-2.5 rounded-full bg-[#f97316] mr-1"></span>Repair: <strong>2</strong></div>
            <div><span class="inline-block w-2.5 h-2.5 rounded-full bg-[#ef4444] mr-1"></span>Critical: <strong>2</strong></div>
          </div>
        </div>

        <!-- Chart 2: Pre vs Post Training Gains -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h3 class="font-bold text-slate-800 text-base">Teacher Competency Gains (Pre vs Post Test)</h3>
              <p class="text-xs text-slate-500">Measured improvements in STEM, Math, and Literacy cohorts</p>
            </div>
            <button onclick="App.switchModule('teachers')" class="text-xs text-emerald-700 font-semibold hover:underline">
              View Roster &rarr;
            </button>
          </div>
          <div class="h-64 relative">
            <canvas id="teacherCompetencyChart"></canvas>
          </div>
        </div>

        <!-- Chart 3: Cascade Reach Multiplier by Division -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h3 class="font-bold text-slate-800 text-base">Teacher Learning Cascade Reach by Division</h3>
              <p class="text-xs text-slate-500">Knowledge transfer from trained teachers to peer educators & students</p>
            </div>
            <button onclick="App.switchModule('cascade')" class="text-xs text-emerald-700 font-semibold hover:underline">
              Cascade Details &rarr;
            </button>
          </div>
          <div class="h-64 relative">
            <canvas id="cascadeReachChart"></canvas>
          </div>
        </div>

        <!-- Chart 4: Scholar Employment & Industry Breakdown -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h3 class="font-bold text-slate-800 text-base">Scholar Tracer: Post-Graduation Status</h3>
              <p class="text-xs text-slate-500">Employment, advanced studies, and compliance update tracking</p>
            </div>
            <button onclick="App.switchModule('scholars')" class="text-xs text-emerald-700 font-semibold hover:underline">
              View Directory &rarr;
            </button>
          </div>
          <div class="h-64 relative">
            <canvas id="scholarEmploymentChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Urgent Active Disasters & Quick Prioritization Strip -->
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
              <h3 class="font-bold text-slate-800 text-base">Active Disaster & Intervention Action Center</h3>
            </div>
            <p class="text-xs text-slate-500">Recent disaster incidents requiring budget release or contractor mobilization</p>
          </div>
          <div class="flex gap-2">
            <button onclick="App.openModal('disasterModal')" class="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition">
              <i class="fa-solid fa-triangle-exclamation"></i> Log Disaster Incident
            </button>
            <button onclick="App.switchModule('disaster')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg transition">
              View All (${totalDisasters})
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
              <tr>
                <th class="p-3">Incident / Calamity</th>
                <th class="p-3">Affected School</th>
                <th class="p-3">Damage Classification</th>
                <th class="p-3">Severity</th>
                <th class="p-3">Est. Repair (PHP)</th>
                <th class="p-3">Status</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${SBF_DATA.disasterReports.map(d => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="p-3 font-semibold text-slate-800 flex items-center gap-2">
                    <i class="fa-solid ${d.severity === 'Critical' ? 'fa-bolt text-red-500' : 'fa-cloud-showers-heavy text-amber-500'}"></i>
                    ${d.incidentName}
                  </td>
                  <td class="p-3 text-slate-700">${d.schoolName}</td>
                  <td class="p-3 text-slate-600">${d.damageType}</td>
                  <td class="p-3">
                    <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      d.severity === 'Critical' ? 'badge-damage-critical' :
                      d.severity === 'Major' ? 'badge-damage-major' :
                      d.severity === 'Moderate' ? 'badge-damage-moderate' : 'badge-damage-minor'
                    }">
                      ${d.severity}
                    </span>
                  </td>
                  <td class="p-3 font-mono font-medium text-slate-800">₱${d.estimatedRepairCostPHP.toLocaleString()}</td>
                  <td class="p-3">
                    <span class="inline-flex items-center gap-1 font-medium text-slate-700">
                      <span class="w-2 h-2 rounded-full ${d.repairStatus === 'Restored' ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                      ${d.repairStatus}
                    </span>
                  </td>
                  <td class="p-3 text-right">
                    <button onclick="App.viewDisasterDetail('${d.id}')" class="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Inspect &rarr;
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Render charts after HTML injection
    setTimeout(() => {
      SBFCharts.initAll();
    }, 50);
  },

  // ====================================================
  // VIEW: Module 1 - School Building Condition Monitoring
  // ====================================================
  renderSchoolsView() {
    const main = document.getElementById('mainContentArea');
    let filtered = SBF_DATA.schools;

    if (this.filterStatus === 'REPAIR_NEEDED') {
      filtered = filtered.filter(s => s.conditionStatus === 'Critical' || s.conditionStatus === 'Needs Repair');
    } else if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(s => s.conditionStatus === this.filterStatus);
    }

    if (this.searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(this.searchQuery) ||
        s.division.toLowerCase().includes(this.searchQuery) ||
        s.region.toLowerCase().includes(this.searchQuery)
      );
    }

    main.innerHTML = `
      <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">1</span>
            <h1 class="text-2xl font-bold text-slate-900">School Building Condition Monitoring</h1>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            Facility inventory, inspection logs, and structural repair prioritization for SBF-donated school buildings.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button onclick="App.openModal('schoolModal')" class="bg-[#008752] hover:bg-[#00683f] text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition">
            <i class="fa-solid fa-plus"></i> New Condition Assessment
          </button>
          <button onclick="App.exportToCSV('schools')" class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition">
            <i class="fa-solid fa-download"></i> Export CSV
          </button>
        </div>
      </div>

      <!-- Filter Bar & Status Chips -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold text-slate-500 mr-1">Condition Status:</span>
          <button onclick="App.setSchoolFilter('ALL')" class="text-xs px-3 py-1.5 rounded-full font-medium transition ${this.filterStatus === 'ALL' ? 'bg-[#002B49] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
            All (${SBF_DATA.schools.length})
          </button>
          <button onclick="App.setSchoolFilter('Good')" class="text-xs px-3 py-1.5 rounded-full font-medium transition ${this.filterStatus === 'Good' ? 'bg-emerald-700 text-white' : 'badge-school-good hover:opacity-80'}">
            Good (2)
          </button>
          <button onclick="App.setSchoolFilter('Needs Monitoring')" class="text-xs px-3 py-1.5 rounded-full font-medium transition ${this.filterStatus === 'Needs Monitoring' ? 'bg-amber-600 text-white' : 'badge-school-monitoring hover:opacity-80'}">
            Needs Monitoring (2)
          </button>
          <button onclick="App.setSchoolFilter('Needs Repair')" class="text-xs px-3 py-1.5 rounded-full font-medium transition ${this.filterStatus === 'Needs Repair' ? 'bg-orange-600 text-white' : 'badge-school-repair hover:opacity-80'}">
            Needs Repair (2)
          </button>
          <button onclick="App.setSchoolFilter('Critical')" class="text-xs px-3 py-1.5 rounded-full font-medium transition ${this.filterStatus === 'Critical' ? 'bg-rose-700 text-white' : 'badge-school-critical hover:opacity-80'}">
            Critical (2)
          </button>
          <button onclick="App.setSchoolFilter('REPAIR_NEEDED')" class="text-xs px-3 py-1.5 rounded-full font-bold transition ${this.filterStatus === 'REPAIR_NEEDED' ? 'bg-red-700 text-white ring-2 ring-red-400' : 'bg-red-50 text-red-700 border border-red-200'}">
            <i class="fa-solid fa-wrench mr-1"></i> Requires Immediate Repair (${SBF_DATA.schools.filter(s => s.conditionStatus === 'Critical' || s.conditionStatus === 'Needs Repair').length})
          </button>
        </div>
        <div class="text-xs text-slate-400">
          Showing <strong>${filtered.length}</strong> of ${SBF_DATA.schools.length} schools
        </div>
      </div>

      <!-- Schools Grid Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        ${filtered.map(s => `
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between">
            <div>
              <div class="relative h-44 overflow-hidden bg-slate-100">
                <img src="${s.photoUrl}" alt="${s.name}" class="w-full h-full object-cover">
                <div class="absolute top-3 right-3">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                    s.conditionStatus === 'Good' ? 'badge-school-good' :
                    s.conditionStatus === 'Needs Monitoring' ? 'badge-school-monitoring' :
                    s.conditionStatus === 'Needs Repair' ? 'badge-school-repair' : 'badge-school-critical'
                  }">
                    ${s.conditionStatus}
                  </span>
                </div>
                <div class="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[11px]">
                  Turnover Year: ${s.buildingTurnoverYear} • ${s.sbfClassrooms} Classrooms
                </div>
              </div>

              <div class="p-4">
                <div class="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mb-1">
                  <i class="fa-solid fa-location-dot"></i> ${s.division}, ${s.region.split('(')[0]}
                </div>
                <h3 class="font-bold text-slate-800 text-base mb-1 leading-snug">${s.name}</h3>
                <p class="text-xs text-slate-500 mb-3">${s.studentCount.toLocaleString()} Students Enrolled</p>

                <!-- Health Bar -->
                <div class="mb-3">
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-500 font-medium">Structural Health Index</span>
                    <span class="font-bold ${s.structuralRating < 60 ? 'text-rose-600' : s.structuralRating < 80 ? 'text-amber-600' : 'text-emerald-600'}">${s.structuralRating}/100</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div class="h-2 rounded-full ${s.structuralRating < 60 ? 'bg-rose-500' : s.structuralRating < 80 ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${s.structuralRating}%"></div>
                  </div>
                </div>

                <!-- Needs Snippet -->
                <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                  <div class="font-semibold text-slate-700 mb-0.5 flex items-center gap-1">
                    <i class="fa-solid fa-clipboard-check text-slate-400"></i> Urgent Needs:
                  </div>
                  <p class="text-slate-600 line-clamp-2">${s.urgentNeeds}</p>
                </div>
              </div>
            </div>

            <div class="p-4 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Inspected: ${s.lastInspectionDate}</span>
              <button onclick="App.viewSchoolDetail('${s.id}')" class="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1">
                Full Profile &rarr;
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  setSchoolFilter(status) {
    this.filterStatus = status;
    this.renderSchoolsView();
  },

  // ====================================================
  // VIEW: Module 2 - Teacher Competency & Training
  // ====================================================
  renderTeachersView() {
    const main = document.getElementById('mainContentArea');
    let filtered = [...SBF_DATA.teachers];

    if (this.filterStatus === 'TOP_IMPROVEMENT') {
      filtered.sort((a, b) => b.gainPercent - a.gainPercent);
    } else if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(t => t.competencyStatus === this.filterStatus);
    }

    if (this.searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(this.searchQuery) ||
        t.school.toLowerCase().includes(this.searchQuery) ||
        t.subject.toLowerCase().includes(this.searchQuery) ||
        t.trainingProgram.toLowerCase().includes(this.searchQuery)
      );
    }

    main.innerHTML = `
      <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">2</span>
            <h1 class="text-2xl font-bold text-slate-900">Teacher Competency & Training Monitoring</h1>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            Tracking pre/post-test pedagogical scores, domain competencies, and follow-up coaching needs.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button onclick="App.openModal('teacherModal')" class="bg-[#008752] hover:bg-[#00683f] text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition">
            <i class="fa-solid fa-user-plus"></i> Record Teacher Evaluation
          </button>
          <button onclick="App.exportToCSV('teachers')" class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition">
            <i class="fa-solid fa-download"></i> Export CSV
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold text-slate-500 mr-1">Competency Status:</span>
          <button onclick="App.setTeacherFilter('ALL')" class="text-xs px-3 py-1.5 rounded-full font-medium transition ${this.filterStatus === 'ALL' ? 'bg-[#002B49] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
            All (${SBF_DATA.teachers.length})
          </button>
          <button onclick="App.setTeacherFilter('Improved')" class="text-xs px-3 py-1.5 rounded-full font-medium transition ${this.filterStatus === 'Improved' ? 'bg-emerald-700 text-white' : 'badge-teacher-improved'}">
            Improved
          </button>
          <button onclick="App.setTeacherFilter('Maintained')" class="text-xs px-3 py-1.5 rounded-full font-medium transition ${this.filterStatus === 'Maintained' ? 'bg-amber-600 text-white' : 'badge-teacher-maintained'}">
            Maintained
          </button>
          <button onclick="App.setTeacherFilter('Minimal Improvement')" class="text-xs px-3 py-1.5 rounded-full font-medium transition ${this.filterStatus === 'Minimal Improvement' ? 'bg-orange-600 text-white' : 'badge-teacher-minimal'}">
            Minimal Improvement
          </button>
          <button onclick="App.setTeacherFilter('Requires Follow-up Training')" class="text-xs px-3 py-1.5 rounded-full font-medium transition ${this.filterStatus === 'Requires Follow-up Training' ? 'bg-rose-700 text-white' : 'badge-teacher-followup'}">
            Requires Follow-up Training
          </button>
          <button onclick="App.setTeacherFilter('TOP_IMPROVEMENT')" class="text-xs px-3 py-1.5 rounded-full font-bold transition ${this.filterStatus === 'TOP_IMPROVEMENT' ? 'bg-emerald-800 text-white ring-2 ring-emerald-400' : 'bg-emerald-50 text-emerald-800 border border-emerald-300'}">
            <i class="fa-solid fa-arrow-trend-up mr-1"></i> Highest Gainers First
          </button>
        </div>
      </div>

      <!-- Teachers Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
              <tr>
                <th class="p-3.5">Teacher / Subject</th>
                <th class="p-3.5">Assigned School</th>
                <th class="p-3.5">Training Program & Batch</th>
                <th class="p-3.5 text-center">Pre-Test</th>
                <th class="p-3.5 text-center">Post-Test</th>
                <th class="p-3.5 text-center">Score Gain</th>
                <th class="p-3.5">Competency Status</th>
                <th class="p-3.5 text-center">Cascaded?</th>
                <th class="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${filtered.map(t => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="p-3.5">
                    <div class="font-bold text-slate-800 text-sm">${t.name}</div>
                    <div class="text-slate-500">${t.subject} • ${t.gradeLevel}</div>
                  </td>
                  <td class="p-3.5 text-slate-700 font-medium">${t.school}</td>
                  <td class="p-3.5">
                    <div class="font-medium text-slate-800">${t.trainingProgram}</div>
                    <div class="text-[11px] text-slate-400">${t.trainingBatch}</div>
                  </td>
                  <td class="p-3.5 text-center font-mono font-medium text-slate-500">${t.preTestScore}%</td>
                  <td class="p-3.5 text-center font-mono font-bold text-slate-800">${t.postTestScore}%</td>
                  <td class="p-3.5 text-center">
                    <span class="inline-flex items-center gap-0.5 font-bold font-mono ${t.gainPercent >= 20 ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded' : t.gainPercent > 0 ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded' : 'text-slate-500'}">
                      <i class="fa-solid fa-arrow-up text-[9px]"></i> +${t.gainPercent.toFixed(1)}%
                    </span>
                  </td>
                  <td class="p-3.5">
                    <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      t.competencyStatus === 'Improved' ? 'badge-teacher-improved' :
                      t.competencyStatus === 'Maintained' ? 'badge-teacher-maintained' :
                      t.competencyStatus === 'Minimal Improvement' ? 'badge-teacher-minimal' : 'badge-teacher-followup'
                    }">
                      ${t.competencyStatus}
                    </span>
                  </td>
                  <td class="p-3.5 text-center">
                    ${t.cascaded ?
                      '<span class="inline-flex items-center gap-1 text-emerald-700 font-semibold"><i class="fa-solid fa-check-circle"></i> Yes</span>' :
                      '<span class="inline-flex items-center gap-1 text-slate-400"><i class="fa-regular fa-clock"></i> Pending</span>'
                    }
                  </td>
                  <td class="p-3.5 text-right">
                    <button onclick="App.viewTeacherDetail('${t.id}')" class="text-emerald-700 hover:text-emerald-800 font-semibold">
                      View &rarr;
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  setTeacherFilter(status) {
    this.filterStatus = status;
    this.renderTeachersView();
  },

  // ====================================================
  // VIEW: Module 3 - Disaster Damage Reporting
  // ====================================================
  renderDisasterView() {
    const main = document.getElementById('mainContentArea');
    const totalReports = SBF_DATA.disasterReports.length;
    const totalRepairBudget = SBF_DATA.disasterReports.reduce((a, b) => a + b.estimatedRepairCostPHP, 0);

    main.innerHTML = `
      <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-sm">3</span>
            <h1 class="text-2xl font-bold text-slate-900">Disaster Damage Reporting & Response</h1>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            Real-time documentation of typhoons, earthquakes, and flood impacts with contractor rehabilitation pipelines.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button onclick="App.openModal('disasterModal')" class="bg-rose-700 hover:bg-rose-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition">
            <i class="fa-solid fa-triangle-exclamation"></i> Submit Disaster Incident Report
          </button>
          <button onclick="App.exportToCSV('disasters')" class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition">
            <i class="fa-solid fa-download"></i> Export CSV
          </button>
        </div>
      </div>

      <!-- Disaster Overview Banner -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-lg">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <div class="text-xs text-slate-500 uppercase font-semibold">Total Calamity Incidents</div>
            <div class="text-xl font-bold text-slate-800">${totalReports} Active Reports</div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
            <i class="fa-solid fa-peso-sign"></i>
          </div>
          <div>
            <div class="text-xs text-slate-500 uppercase font-semibold">Estimated Repair Cost</div>
            <div class="text-xl font-bold text-slate-800 font-mono">₱${totalRepairBudget.toLocaleString()}</div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            <i class="fa-solid fa-hammer"></i>
          </div>
          <div>
            <div class="text-xs text-slate-500 uppercase font-semibold">Rehabilitation Pipeline</div>
            <div class="text-xl font-bold text-emerald-700">1 Restored • 1 Under Repair</div>
          </div>
        </div>
      </div>

      <!-- Incident Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        ${SBF_DATA.disasterReports.map(d => `
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-3">
                <div>
                  <span class="text-[11px] font-mono font-bold text-slate-400">${d.id} • ${d.incidentDate}</span>
                  <h3 class="text-lg font-bold text-slate-800 mt-0.5">${d.incidentName}</h3>
                  <p class="text-xs font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <i class="fa-solid fa-school"></i> ${d.schoolName}
                  </p>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-bold ${
                  d.severity === 'Critical' ? 'badge-damage-critical' :
                  d.severity === 'Major' ? 'badge-damage-major' :
                  d.severity === 'Moderate' ? 'badge-damage-moderate' : 'badge-damage-minor'
                }">
                  ${d.severity} Severity
                </span>
              </div>

              <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3 text-xs text-slate-700">
                <div class="font-semibold text-slate-800 mb-1">Impact Description:</div>
                <p>${d.description}</p>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs mb-3">
                <div class="p-2 bg-slate-50 rounded border border-slate-100">
                  <span class="text-slate-400 block text-[10px] uppercase font-semibold">Facility</span>
                  <span class="font-semibold text-slate-700">${d.affectedFacility}</span>
                </div>
                <div class="p-2 bg-slate-50 rounded border border-slate-100">
                  <span class="text-slate-400 block text-[10px] uppercase font-semibold">Est. Repair Cost</span>
                  <span class="font-mono font-bold text-emerald-700">₱${d.estimatedRepairCostPHP.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div class="flex items-center gap-1.5">
                <span class="text-slate-400">Repair Status:</span>
                <span class="font-bold text-slate-800">${d.repairStatus}</span>
              </div>
              <button onclick="App.viewDisasterDetail('${d.id}')" class="text-blue-600 hover:text-blue-800 font-semibold">
                Photo & Evidence &rarr;
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // ====================================================
  // VIEW: Module 4 - Teacher Learning Cascade Tracking
  // ====================================================
  renderCascadeView() {
    const main = document.getElementById('mainContentArea');
    const totalTrained = SBF_DATA.cascadeActivities.reduce((a, b) => a + b.recipientTeacherCount, 0);
    const totalStudents = SBF_DATA.cascadeActivities.reduce((a, b) => a + b.recipientStudentImpact, 0);

    main.innerHTML = `
      <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">4</span>
            <h1 class="text-2xl font-bold text-slate-900">Teacher Learning Cascade Tracking</h1>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            Measuring how training knowledge transfers beyond initial participants to peer teachers and student beneficiaries.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button onclick="App.openModal('cascadeModal')" class="bg-[#008752] hover:bg-[#00683f] text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition">
            <i class="fa-solid fa-network-wired"></i> Log Cascade Echo Session
          </button>
          <button onclick="App.exportToCSV('cascade')" class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition">
            <i class="fa-solid fa-download"></i> Export CSV
          </button>
        </div>
      </div>

      <!-- Multiplier Summary Banner -->
      <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-[#002B49] text-white rounded-xl p-6 mb-6 shadow-md">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span class="bg-purple-500/30 text-purple-200 border border-purple-400/30 text-xs uppercase px-2.5 py-0.5 rounded-full font-semibold">
              The SBF Knowledge Multiplier Effect
            </span>
            <h2 class="text-xl font-bold mt-2">1 Trained Master Teacher &rarr; 35 Peer Educators &rarr; 1,400+ Students</h2>
            <p class="text-purple-200 text-xs mt-1 max-w-xl">
              Every master teacher trained at Ateneo or DLSU is required to organize School-Based Learning Action Cell (LAC) sessions to echo new pedagogies into local classrooms.
            </p>
          </div>
          <div class="flex gap-4">
            <div class="bg-white/10 backdrop-blur rounded-lg p-3 text-center border border-white/20 min-w-[110px]">
              <div class="text-2xl font-bold text-purple-200">${totalTrained}</div>
              <div class="text-[11px] text-purple-300">Peer Teachers</div>
            </div>
            <div class="bg-white/10 backdrop-blur rounded-lg p-3 text-center border border-white/20 min-w-[110px]">
              <div class="text-2xl font-bold text-amber-300">${totalStudents.toLocaleString()}</div>
              <div class="text-[11px] text-purple-300">Students Reached</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cascade Activities Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
              <tr>
                <th class="p-3.5">Echo Session / Activity</th>
                <th class="p-3.5">Lead Master Facilitator</th>
                <th class="p-3.5">Division / School</th>
                <th class="p-3.5">Date Conducted</th>
                <th class="p-3.5 text-center">Teachers Trained</th>
                <th class="p-3.5 text-center">Student Impact</th>
                <th class="p-3.5 text-center">Rating</th>
                <th class="p-3.5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${SBF_DATA.cascadeActivities.map(c => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="p-3.5">
                    <div class="font-bold text-slate-800 text-sm">${c.cascadeActivityTitle}</div>
                    <div class="text-slate-500 font-medium">${c.trainingProgram}</div>
                    <div class="text-[11px] text-slate-400 mt-0.5">Topics: ${c.topicsShared}</div>
                  </td>
                  <td class="p-3.5">
                    <div class="font-semibold text-slate-800">${c.leadTeacherName}</div>
                    <div class="text-slate-400 text-[11px]">ID: ${c.leadTeacherId}</div>
                  </td>
                  <td class="p-3.5 text-slate-700">${c.division}</td>
                  <td class="p-3.5 text-slate-600 font-mono">${c.dateConducted} (${c.durationHours} hrs)</td>
                  <td class="p-3.5 text-center font-bold text-blue-700 bg-blue-50/50">
                    ${c.recipientTeacherCount}
                  </td>
                  <td class="p-3.5 text-center font-bold text-amber-700 bg-amber-50/50">
                    ${c.recipientStudentImpact.toLocaleString()}
                  </td>
                  <td class="p-3.5 text-center">
                    <span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      <i class="fa-solid fa-star text-amber-500 text-[10px]"></i> ${c.feedbackRating}
                    </span>
                  </td>
                  <td class="p-3.5 text-right">
                    <span class="text-[11px] text-emerald-700 font-medium block">
                      <i class="fa-solid fa-circle-check"></i> ${c.documentationStatus.split(' ')[0]}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ====================================================
  // VIEW: Module 5 - Scholar Tracer System
  // ====================================================
  renderScholarsView() {
    const main = document.getElementById('mainContentArea');
    let filtered = [...SBF_DATA.scholars];

    if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(s => s.employmentStatus === this.filterStatus);
    }

    if (this.searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(this.searchQuery) ||
        s.university.toLowerCase().includes(this.searchQuery) ||
        s.degree.toLowerCase().includes(this.searchQuery) ||
        s.employer.toLowerCase().includes(this.searchQuery) ||
        s.position.toLowerCase().includes(this.searchQuery)
      );
    }

    main.innerHTML = `
      <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">5</span>
            <h1 class="text-2xl font-bold text-slate-900">Scholar Tracer System</h1>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            Tracking graduate employment, career trajectories, and long-term return-on-scholarship outcomes.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button onclick="App.openModal('scholarModal')" class="bg-[#008752] hover:bg-[#00683f] text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition">
            <i class="fa-solid fa-user-pen"></i> Update Scholar Profile
          </button>
          <button onclick="App.exportToCSV('scholars')" class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition">
            <i class="fa-solid fa-download"></i> Export CSV
          </button>
        </div>
      </div>

      <!-- Filter Bar & Status Badges -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold text-slate-500 mr-1">Employment Status:</span>
          <button onclick="App.setScholarFilter('ALL')" class="text-xs px-3 py-1.5 rounded-full font-medium transition ${this.filterStatus === 'ALL' ? 'bg-[#002B49] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
            All (${SBF_DATA.scholars.length})
          </button>
          <button onclick="App.setScholarFilter('Employed')" class="text-xs px-3 py-1.5 rounded-full font-medium transition ${this.filterStatus === 'Employed' ? 'bg-emerald-700 text-white' : 'badge-scholar-employed'}">
            Employed
          </button>
          <button onclick="App.setScholarFilter('Seeking Employment')" class="text-xs px-3 py-1.5 rounded-full font-medium transition ${this.filterStatus === 'Seeking Employment' ? 'bg-sky-700 text-white' : 'badge-scholar-seeking'}">
            Seeking Employment
          </button>
          <button onclick="App.setScholarFilter('Further Studies')" class="text-xs px-3 py-1.5 rounded-full font-medium transition ${this.filterStatus === 'Further Studies' ? 'bg-purple-700 text-white' : 'badge-scholar-studies'}">
            Further Studies
          </button>
          <button onclick="App.setScholarFilter('Information Not Updated')" class="text-xs px-3 py-1.5 rounded-full font-bold transition ${this.filterStatus === 'Information Not Updated' ? 'bg-rose-700 text-white ring-2 ring-rose-300' : 'badge-scholar-notupdated text-rose-700 border-rose-300'}">
            <i class="fa-solid fa-clock-rotate-left mr-1"></i> Outdated (>12 Mos)
          </button>
        </div>
        <div class="text-xs text-slate-400">
          Showing <strong>${filtered.length}</strong> of ${SBF_DATA.scholars.length} scholars
        </div>
      </div>

      <!-- Scholar Directory Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
              <tr>
                <th class="p-3.5">Scholar / Honors</th>
                <th class="p-3.5">University & Degree</th>
                <th class="p-3.5">Grad Year</th>
                <th class="p-3.5">Employment Status</th>
                <th class="p-3.5">Current Employer & Industry</th>
                <th class="p-3.5">Position & Alignment</th>
                <th class="p-3.5">Last Tracer Update</th>
                <th class="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${filtered.map(s => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="p-3.5">
                    <div class="font-bold text-slate-800 text-sm">${s.name}</div>
                    <div class="text-emerald-700 font-medium text-[11px]">${s.honors}</div>
                    <div class="text-slate-400 text-[10px] font-mono">${s.id}</div>
                  </td>
                  <td class="p-3.5">
                    <div class="font-medium text-slate-800">${s.degree}</div>
                    <div class="text-slate-500 text-[11px]">${s.university}</div>
                  </td>
                  <td class="p-3.5 font-mono text-slate-700">${s.graduationYear}</td>
                  <td class="p-3.5">
                    <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      s.employmentStatus === 'Employed' ? 'badge-scholar-employed' :
                      s.employmentStatus === 'Seeking Employment' ? 'badge-scholar-seeking' :
                      s.employmentStatus === 'Further Studies' ? 'badge-scholar-studies' :
                      s.employmentStatus === 'Unemployed' ? 'badge-scholar-unemployed' : 'badge-scholar-notupdated'
                    }">
                      ${s.employmentStatus}
                    </span>
                  </td>
                  <td class="p-3.5">
                    <div class="font-semibold text-slate-800">${s.employer}</div>
                    <div class="text-slate-500 text-[11px]">${s.industry}</div>
                  </td>
                  <td class="p-3.5">
                    <div class="font-medium text-slate-700">${s.position}</div>
                    <div class="text-[11px] text-slate-400">${s.degreeAlignment}</div>
                  </td>
                  <td class="p-3.5 font-mono ${s.employmentStatus === 'Information Not Updated' ? 'text-rose-600 font-bold' : 'text-slate-500'}">
                    ${s.lastUpdateDate}
                    ${s.employmentStatus === 'Information Not Updated' ? '<span class="block text-[10px] text-rose-500">Overdue > 1 yr</span>' : ''}
                  </td>
                  <td class="p-3.5 text-right">
                    <button onclick="App.viewScholarDetail('${s.id}')" class="text-emerald-700 hover:text-emerald-800 font-semibold">
                      Edit &rarr;
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  setScholarFilter(status) {
    this.filterStatus = status;
    this.renderScholarsView();
  },

  // ====================================================
  // VIEW: Intervention Prioritization Engine
  // Bottom section of the infographic: "Uses data and defined criteria to identify areas that need immediate attention and support."
  // ====================================================
  renderPrioritizationView() {
    const main = document.getElementById('mainContentArea');

    // Prioritization algorithm:
    // Score based on Structural rating (inverted), Disaster severity, Student count weight
    const prioritizedSchools = [...SBF_DATA.schools].map(school => {
      let disaster = SBF_DATA.disasterReports.find(d => d.schoolId === school.id);
      let severityPoints = 0;
      if (disaster) {
        if (disaster.severity === 'Critical') severityPoints = 40;
        else if (disaster.severity === 'Major') severityPoints = 30;
        else if (disaster.severity === 'Moderate') severityPoints = 15;
        else severityPoints = 5;
      }
      const structuralDeficit = (100 - school.structuralRating) * 0.4;
      const studentExposure = Math.min(20, (school.studentCount / 3000) * 20);
      const totalScore = Math.round(severityPoints + structuralDeficit + studentExposure);

      let priorityLevel = 'P4 (Routine)';
      let priorityClass = 'priority-p4';
      if (totalScore >= 75) {
        priorityLevel = 'P1 (Critical / Urgent Action)';
        priorityClass = 'priority-p1';
      } else if (totalScore >= 50) {
        priorityLevel = 'P2 (High Priority)';
        priorityClass = 'priority-p2';
      } else if (totalScore >= 30) {
        priorityLevel = 'P3 (Moderate)';
        priorityClass = 'priority-p3';
      }

      return {
        ...school,
        disaster,
        score: totalScore,
        priorityLevel,
        priorityClass
      };
    }).sort((a, b) => b.score - a.score);

    main.innerHTML = `
      <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center font-bold text-sm">
              <i class="fa-solid fa-bullseye"></i>
            </span>
            <h1 class="text-2xl font-bold text-slate-900">Intervention Prioritization Engine</h1>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            Algorithmic ranking combining structural degradation, recent disaster impacts, and student population exposure to guide SBF capital allocation.
          </p>
        </div>
        <button onclick="window.print()" class="bg-[#002B49] hover:bg-[#001f35] text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition">
          <i class="fa-solid fa-print"></i> Print Prioritization Docket
        </button>
      </div>

      <!-- Prioritization Criteria Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <span class="font-bold text-slate-700 block mb-1 text-sm">Criterion 1: Calamity Severity</span>
          <p class="text-slate-500">Up to 40 pts for active typhoon, seismic, or flooding damages.</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <span class="font-bold text-slate-700 block mb-1 text-sm">Criterion 2: Structural Integrity</span>
          <p class="text-slate-500">Up to 40 pts based on engineer physical assessment ratings.</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <span class="font-bold text-slate-700 block mb-1 text-sm">Criterion 3: Student Footprint</span>
          <p class="text-slate-500">Up to 20 pts weighting potential child safety impact.</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <span class="font-bold text-slate-700 block mb-1 text-sm">Funding Pipeline</span>
          <p class="text-slate-500">Fast-tracked for SBF Board of Trustees quarterly allocation.</p>
        </div>
      </div>

      <!-- Prioritized Ranking List -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div class="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 class="font-bold text-slate-800 text-sm">Targeted Intervention Action Roster</h3>
          <span class="text-xs text-slate-500">Sorted by Composite Need Score (Highest to Lowest)</span>
        </div>

        <div class="divide-y divide-slate-100">
          ${prioritizedSchools.map((item, idx) => `
            <div class="p-5 hover:bg-slate-50/60 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div class="flex items-start gap-4">
                <div class="flex flex-col items-center justify-center min-w-[50px]">
                  <span class="text-2xl font-black text-slate-400">#${idx + 1}</span>
                  <span class="text-[10px] font-mono font-bold text-slate-500 mt-0.5">Score: ${item.score}</span>
                </div>
                <div>
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${item.priorityClass}">
                      ${item.priorityLevel}
                    </span>
                    <span class="text-xs font-semibold text-slate-500">${item.division}</span>
                    ${item.disaster ? `<span class="text-[11px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-medium"><i class="fa-solid fa-triangle-exclamation"></i> ${item.disaster.incidentName}</span>` : ''}
                  </div>
                  <h4 class="text-base font-bold text-slate-900">${item.name}</h4>
                  <p class="text-xs text-slate-600 mt-1 max-w-2xl">${item.urgentNeeds}</p>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-4 text-xs">
                <div class="text-right">
                  <div class="text-slate-400 text-[10px] uppercase font-semibold">Structural Rating</div>
                  <div class="font-bold ${item.structuralRating < 60 ? 'text-red-600' : 'text-slate-700'}">${item.structuralRating}/100</div>
                </div>
                <div class="text-right">
                  <div class="text-slate-400 text-[10px] uppercase font-semibold">Beneficiary Students</div>
                  <div class="font-bold text-slate-800">${item.studentCount.toLocaleString()}</div>
                </div>
                <button onclick="App.viewSchoolDetail('${item.id}')" class="bg-[#008752] hover:bg-[#00683f] text-white px-3 py-1.5 rounded-lg font-medium shadow-sm transition">
                  Allocate Budget &rarr;
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // ====================================================
  // VIEW: Module 7 - Automated Reporting
  // ====================================================
  renderReportingView() {
    const main = document.getElementById('mainContentArea');

    main.innerHTML = `
      <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">7</span>
            <h1 class="text-2xl font-bold text-slate-900">Automated Reporting Engine</h1>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            Generates standardized executive summaries, DepEd partnership reports, and SBF board presentation decks with single-click PDF and CSV downloads.
          </p>
        </div>
      </div>

      <!-- Report Templates Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <!-- Report 1 -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-lg mb-3">
              <i class="fa-solid fa-file-pdf"></i>
            </div>
            <h3 class="font-bold text-slate-800 text-base mb-1">School Facility Infrastructure Audit</h3>
            <p class="text-xs text-slate-500 mb-4">Complete building inventory, structural ratings, and contractor repair bills for all 8 SBF school sites.</p>
          </div>
          <button onclick="App.generateReport('schools')" class="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition">
            <i class="fa-solid fa-eye"></i> Preview & Print Report
          </button>
        </div>

        <!-- Report 2 -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg mb-3">
              <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <h3 class="font-bold text-slate-800 text-base mb-1">Teacher Competency & Gain Evaluation</h3>
            <p class="text-xs text-slate-500 mb-4">Detailed pre-test vs post-test score analyses, mastery benchmarks, and recommendations for Ateneo/DLSU cohorts.</p>
          </div>
          <button onclick="App.generateReport('teachers')" class="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition">
            <i class="fa-solid fa-eye"></i> Preview & Print Report
          </button>
        </div>

        <!-- Report 3 -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-lg mb-3">
              <i class="fa-solid fa-people-arrows"></i>
            </div>
            <h3 class="font-bold text-slate-800 text-base mb-1">Knowledge Cascade Multiplier Dossier</h3>
            <p class="text-xs text-slate-500 mb-4">Verification logs of echo workshops, LAC sessions, secondary peer teachers reached, and student counts.</p>
          </div>
          <button onclick="App.generateReport('cascade')" class="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition">
            <i class="fa-solid fa-eye"></i> Preview & Print Report
          </button>
        </div>

        <!-- Report 4 -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center text-lg mb-3">
              <i class="fa-solid fa-cloud-bolt"></i>
            </div>
            <h3 class="font-bold text-slate-800 text-base mb-1">Post-Disaster Impact & Rehabilitation</h3>
            <p class="text-xs text-slate-500 mb-4">Calamity incident logs, damage classifications, before-and-after photo records, and contractor status.</p>
          </div>
          <button onclick="App.generateReport('disaster')" class="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition">
            <i class="fa-solid fa-eye"></i> Preview & Print Report
          </button>
        </div>

        <!-- Report 5 -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div class="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-lg mb-3">
              <i class="fa-solid fa-briefcase"></i>
            </div>
            <h3 class="font-bold text-slate-800 text-base mb-1">Scholar Tracer & Employability Report</h3>
            <p class="text-xs text-slate-500 mb-4">Graduate employment rate, degree-job alignment statistics, industry placements, and stale record tracking.</p>
          </div>
          <button onclick="App.generateReport('scholars')" class="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition">
            <i class="fa-solid fa-eye"></i> Preview & Print Report
          </button>
        </div>

        <!-- Report 6 -->
        <div class="bg-gradient-to-br from-[#002B49] to-[#008752] text-white p-5 rounded-xl shadow-md flex flex-col justify-between">
          <div>
            <div class="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center text-lg mb-3">
              <i class="fa-solid fa-award"></i>
            </div>
            <h3 class="font-bold text-white text-base mb-1">Annual Executive Impact Assessment</h3>
            <p class="text-xs text-emerald-100 mb-4">Consolidated high-level impact metrics and CSR return on investment prepared for Security Bank Board of Trustees.</p>
          </div>
          <button onclick="App.generateReport('consolidated')" class="bg-white text-slate-900 hover:bg-emerald-50 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition">
            <i class="fa-solid fa-file-contract"></i> View Board Executive Summary
          </button>
        </div>
      </div>
    `;
  },

  // ====================================================
  // VIEW: Module 8 - Notifications & Alerts
  // ====================================================
  renderNotificationsView() {
    const main = document.getElementById('mainContentArea');

    main.innerHTML = `
      <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">8</span>
            <h1 class="text-2xl font-bold text-slate-900">Notifications & Alerts Center</h1>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            Automated reminders for follow-ups, overdue reassessments, urgent disaster reports, and missing scholar updates.
          </p>
        </div>
        <button onclick="App.markAllNotificationsRead()" class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg transition">
          <i class="fa-solid fa-check-double mr-1"></i> Mark All as Read
        </button>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div class="divide-y divide-slate-100">
          ${SBF_DATA.notifications.map(n => `
            <div class="p-4 flex items-start gap-3 hover:bg-slate-50/80 transition ${n.read ? 'opacity-70' : 'bg-amber-50/20'}">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center text-sm ${
                n.severity === 'high' ? 'bg-rose-100 text-rose-700' :
                n.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }">
                <i class="fa-solid ${n.severity === 'high' ? 'fa-bell text-rose-600' : 'fa-info'}"></i>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-bold text-slate-800">${n.title}</h4>
                  <span class="text-[11px] text-slate-400 font-mono">${n.timestamp}</span>
                </div>
                <p class="text-xs text-slate-600 mt-1">${n.message}</p>
                <div class="mt-2 flex items-center gap-3">
                  <button onclick="App.handleNotificationClick('${n.targetModule}', '${n.targetId}')" class="text-xs font-semibold text-emerald-700 hover:underline">
                    View Associated Record &rarr;
                  </button>
                  ${!n.read ? `<span class="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Unread</span>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  markAllNotificationsRead() {
    SBF_DATA.notifications.forEach(n => n.read = true);
    this.updateNotificationBadge();
    this.renderNotificationsView();
    this.showToast("All notifications marked as read.");
  },

  handleNotificationClick(module, id) {
    this.switchModule(module);
  },

  // ====================================================
  // VIEW: Module 9 - User & Access Management
  // ====================================================
  renderUsersView() {
    const main = document.getElementById('mainContentArea');

    main.innerHTML = `
      <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">9</span>
            <h1 class="text-2xl font-bold text-slate-900">User & Access Management</h1>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            Role-Based Access Control (RBAC) governance for foundation directors, school heads, teachers, and scholars.
          </p>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
          <i class="fa-solid fa-shield-halved"></i> Active System Role: <strong>${this.currentRole}</strong>
        </div>
      </div>

      <!-- Role Matrix Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div class="p-4 rounded-xl border ${this.currentRole === 'Administrator' ? 'border-purple-500 bg-purple-50/40 ring-2 ring-purple-300' : 'border-slate-200 bg-white'}">
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-slate-800 text-sm">Administrator</span>
            <span class="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">Root</span>
          </div>
          <p class="text-xs text-slate-500">Unrestricted system access, user provisioning, budget approvals, and master data configurations.</p>
        </div>
        <div class="p-4 rounded-xl border ${this.currentRole === 'Foundation Staff' ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-300' : 'border-slate-200 bg-white'}">
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-slate-800 text-sm">Foundation Staff</span>
            <span class="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Program Team</span>
          </div>
          <p class="text-xs text-slate-500">Reviews and endorses repair budgets, organizes teacher batches, reviews cascade proof, generates reports.</p>
        </div>
        <div class="p-4 rounded-xl border ${this.currentRole === 'School Principal' ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-300' : 'border-slate-200 bg-white'}">
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-slate-800 text-sm">School Principal</span>
            <span class="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">DepEd School Head</span>
          </div>
          <p class="text-xs text-slate-500">Files rapid disaster impact forms, confirms classroom condition audits, acknowledges contractor handovers.</p>
        </div>
        <div class="p-4 rounded-xl border ${this.currentRole === 'Teacher / Master Trainer' ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-300' : 'border-slate-200 bg-white'}">
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-slate-800 text-sm">Teacher / Master Trainer</span>
            <span class="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">Educator</span>
          </div>
          <p class="text-xs text-slate-500">Logs pre/post evaluation scores, files LAC cascade documentation, signs attendance sheets.</p>
        </div>
        <div class="p-4 rounded-xl border ${this.currentRole === 'Scholar' ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-300' : 'border-slate-200 bg-white'}">
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-slate-800 text-sm">Scholar</span>
            <span class="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-bold">Alumni</span>
          </div>
          <p class="text-xs text-slate-500">Submits annual employment tracer updates, salary brackets, and mentors younger batches.</p>
        </div>
      </div>

      <!-- Users Roster Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 bg-slate-50 border-b border-slate-200">
          <h3 class="font-bold text-slate-800 text-sm">Designated Stakeholders</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
              <tr>
                <th class="p-3.5">User Name</th>
                <th class="p-3.5">Assigned Role</th>
                <th class="p-3.5">Department / Affiliation</th>
                <th class="p-3.5">Contact Email</th>
                <th class="p-3.5">System Permissions</th>
                <th class="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${SBF_DATA.users.map(u => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="p-3.5 font-bold text-slate-800">${u.name}</td>
                  <td class="p-3.5">
                    <span class="font-semibold text-slate-700">${u.role}</span>
                  </td>
                  <td class="p-3.5 text-slate-600">${u.department}</td>
                  <td class="p-3.5 font-mono text-slate-500">${u.email}</td>
                  <td class="p-3.5 text-slate-600 max-w-xs truncate">${u.permissions}</td>
                  <td class="p-3.5 text-center">
                    <span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                      ${u.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ====================================================
  // VIEW: Module 10 - Data Repository
  // ====================================================
  renderRepositoryView() {
    const main = document.getElementById('mainContentArea');

    main.innerHTML = `
      <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">10</span>
            <h1 class="text-2xl font-bold text-slate-900">Data Repository & Document Vault</h1>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            Centralized beneficiary database, structural blueprints, DepEd agreements, and historical assessment results.
          </p>
        </div>
        <button onclick="App.showToast('Document upload modal activated', 'info')" class="bg-[#008752] hover:bg-[#00683f] text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition">
          <i class="fa-solid fa-cloud-arrow-up"></i> Upload Archive File
        </button>
      </div>

      <!-- Document List Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        ${SBF_DATA.documents.map(doc => `
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between gap-3 hover:border-emerald-300 transition">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg ${doc.fileType === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center text-lg shrink-0">
                <i class="fa-solid ${doc.fileType === 'PDF' ? 'fa-file-pdf' : 'fa-file-excel'}"></i>
              </div>
              <div>
                <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold uppercase">${doc.category}</span>
                <h4 class="font-bold text-slate-800 text-sm mt-1">${doc.title}</h4>
                <p class="text-xs text-slate-400 mt-1">Scope: ${doc.schoolOrProgram} • ${doc.fileSize} • Added by ${doc.uploader}</p>
              </div>
            </div>
            <button onclick="App.showToast('Downloading document: ${doc.title.substring(0, 25)}...', 'success')" class="text-slate-400 hover:text-emerald-700 text-base p-2">
              <i class="fa-solid fa-download"></i>
            </button>
          </div>
        `).join('')}
      </div>
    `;
  },

  // ====================================================
  // MODALS & INTERACTIVE POPUPS
  // ====================================================
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.classList.add('hidden');
      m.classList.remove('flex');
    });
  },

  viewSchoolDetail(schoolId) {
    const school = SBF_DATA.schools.find(s => s.id === schoolId);
    if (!school) return;

    const modal = document.getElementById('schoolDetailModal');
    const content = document.getElementById('schoolDetailContent');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="relative h-48 rounded-xl overflow-hidden mb-4">
        <img src="${school.photoUrl}" alt="${school.name}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
          <div>
            <span class="px-2 py-0.5 rounded-full text-xs font-bold ${
              school.conditionStatus === 'Good' ? 'badge-school-good' :
              school.conditionStatus === 'Needs Monitoring' ? 'badge-school-monitoring' :
              school.conditionStatus === 'Needs Repair' ? 'badge-school-repair' : 'badge-school-critical'
            }">${school.conditionStatus} Condition</span>
            <h3 class="text-xl font-bold text-white mt-1">${school.name}</h3>
            <p class="text-xs text-slate-300">${school.division} • ${school.region}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
        <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <span class="text-slate-400 block text-[10px] uppercase font-semibold">Turnover</span>
          <span class="font-bold text-slate-800">${school.buildingTurnoverYear}</span>
        </div>
        <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <span class="text-slate-400 block text-[10px] uppercase font-semibold">SBF Classrooms</span>
          <span class="font-bold text-slate-800">${school.sbfClassrooms} Rooms</span>
        </div>
        <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <span class="text-slate-400 block text-[10px] uppercase font-semibold">Students Served</span>
          <span class="font-bold text-slate-800">${school.studentCount.toLocaleString()}</span>
        </div>
        <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <span class="text-slate-400 block text-[10px] uppercase font-semibold">Structural Rating</span>
          <span class="font-bold ${school.structuralRating < 60 ? 'text-red-600' : 'text-emerald-700'}">${school.structuralRating}/100</span>
        </div>
      </div>

      <div class="space-y-3 text-xs">
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span class="font-bold text-slate-700 block mb-1">Roof & Ceilings:</span>
          <p class="text-slate-600">${school.roofCondition}</p>
        </div>
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span class="font-bold text-slate-700 block mb-1">Electrical & Wiring:</span>
          <p class="text-slate-600">${school.electricalStatus}</p>
        </div>
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span class="font-bold text-slate-700 block mb-1">WASH & Restrooms:</span>
          <p class="text-slate-600">${school.washStatus}</p>
        </div>
        <div class="p-3 bg-red-50 rounded-lg border border-red-100">
          <span class="font-bold text-red-800 block mb-1">Recommended Urgent Interventions:</span>
          <p class="text-red-700">${school.urgentNeeds}</p>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center">
        <span>Lead Inspector: ${school.inspector}</span>
        <span>Inspected: ${school.lastInspectionDate}</span>
      </div>
    `;

    this.openModal('schoolDetailModal');
  },

  viewDisasterDetail(disasterId) {
    const disaster = SBF_DATA.disasterReports.find(d => d.id === disasterId);
    if (!disaster) return;

    alert(`Disaster Incident Details:\n\nIncident: ${disaster.incidentName}\nSchool: ${disaster.schoolName}\nSeverity: ${disaster.severity}\nDamage: ${disaster.damageType}\nEst. Budget: ₱${disaster.estimatedRepairCostPHP.toLocaleString()}\nStatus: ${disaster.repairStatus}\nContractor: ${disaster.contractor}\nTarget Completion: ${disaster.targetCompletionDate}\n\nDescription: ${disaster.description}`);
  },

  viewTeacherDetail(teacherId) {
    const teacher = SBF_DATA.teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    alert(`Teacher Profile & Competency Breakdown:\n\nName: ${teacher.name}\nSchool: ${teacher.school}\nSubject: ${teacher.subject} (${teacher.gradeLevel})\nProgram: ${teacher.trainingProgram} (${teacher.trainingBatch})\n\nPre-Test: ${teacher.preTestScore}%\nPost-Test: ${teacher.postTestScore}%\nScore Gain: +${teacher.gainPercent.toFixed(1)}%\nStatus: ${teacher.competencyStatus}\n\nDomain Ratings:\n- Pedagogy: ${teacher.pedagogyScore}/100\n- Subject Mastery: ${teacher.subjectMasteryScore}/100\n- Digital Literacy: ${teacher.digitalLiteracyScore}/100\n\nCascaded Training: ${teacher.cascaded ? 'Yes (Echo completed)' : 'No (Pending session)'}\nNotes: ${teacher.notes}`);
  },

  viewScholarDetail(scholarId) {
    const scholar = SBF_DATA.scholars.find(s => s.id === scholarId);
    if (!scholar) return;

    const newCompany = prompt(`Update Employer for Scholar ${scholar.name}:`, scholar.employer);
    if (newCompany !== null && newCompany.trim() !== '') {
      scholar.employer = newCompany;
      scholar.employmentStatus = 'Employed';
      scholar.lastUpdateDate = new Date().toISOString().split('T')[0];
      this.renderScholarsView();
      this.showToast(`Updated record for ${scholar.name}!`);
    }
  },

  // Form Submissions
  saveNewSchoolAssessment(e) {
    e.preventDefault();
    const name = document.getElementById('newSchoolName').value;
    const division = document.getElementById('newSchoolDivision').value;
    const rating = parseInt(document.getElementById('newSchoolRating').value, 10);
    const status = document.getElementById('newSchoolStatus').value;
    const needs = document.getElementById('newSchoolNeeds').value;

    const newSchool = {
      id: `SCH-00${SBF_DATA.schools.length + 1}`,
      name: name,
      region: "Region III",
      division: division,
      type: "Public Secondary",
      studentCount: 1500,
      buildingTurnoverYear: 2023,
      sbfClassrooms: 8,
      conditionStatus: status,
      structuralRating: rating,
      roofCondition: "Inspection completed",
      electricalStatus: "Inspection completed",
      washStatus: "Functional",
      lastInspectionDate: new Date().toISOString().split('T')[0],
      inspector: "Engr. Marco Valerio, PE",
      urgentNeeds: needs || "Routine preventive maintenance",
      photoUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
      history: []
    };

    SBF_DATA.schools.unshift(newSchool);
    this.closeModal('schoolModal');
    this.renderSchoolsView();
    this.showToast(`New inspection record added for ${name}!`);
  },

  saveNewDisasterReport(e) {
    e.preventDefault();
    const incidentName = document.getElementById('newDisasterName').value;
    const schoolName = document.getElementById('newDisasterSchool').value;
    const severity = document.getElementById('newDisasterSeverity').value;
    const cost = parseInt(document.getElementById('newDisasterCost').value, 10) || 100000;
    const desc = document.getElementById('newDisasterDesc').value;

    const newReport = {
      id: `DIS-2026-00${SBF_DATA.disasterReports.length + 1}`,
      incidentName: incidentName,
      schoolId: "SCH-001",
      schoolName: schoolName,
      incidentDate: new Date().toISOString().split('T')[0],
      damageType: "Storm & Structural Impact",
      affectedFacility: "SBF Classroom Wing",
      severity: severity,
      estimatedRepairCostPHP: cost,
      repairStatus: "Under Assessment",
      contractor: "Pending Assignment",
      targetCompletionDate: "2026-12-30",
      photoEvidence: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
      description: desc
    };

    SBF_DATA.disasterReports.unshift(newReport);
    this.closeModal('disasterModal');
    this.renderDisasterView();
    this.showToast(`Disaster damage incident logged successfully!`);
  },

  saveNewCascadeSession(e) {
    e.preventDefault();
    const title = document.getElementById('newCascadeTitle').value;
    const trainer = document.getElementById('newCascadeTrainer').value;
    const count = parseInt(document.getElementById('newCascadeTeachers').value, 10);
    const impact = parseInt(document.getElementById('newCascadeImpact').value, 10);

    const newActivity = {
      id: `CAS-${Date.now().toString().slice(-3)}`,
      leadTeacherId: "TCH-101",
      leadTeacherName: trainer,
      school: "SBF Host School",
      trainingProgram: "Teacher Pedagogy Training",
      cascadeActivityTitle: title,
      dateConducted: new Date().toISOString().split('T')[0],
      durationHours: 12,
      recipientTeacherCount: count,
      recipientStudentImpact: impact,
      topicsShared: "Pedagogical echo workshop",
      feedbackRating: 4.9,
      documentationStatus: "Verified with DepEd Signed Attendance",
      division: "Central Division"
    };

    SBF_DATA.cascadeActivities.unshift(newActivity);
    this.closeModal('cascadeModal');
    this.renderCascadeView();
    this.showToast(`Cascade activity saved! Knowledge multiplier updated.`);
  },

  // Export CSV
  exportToCSV(module) {
    let rows = [];
    let filename = `sbf_${module}_report_${new Date().toISOString().split('T')[0]}.csv`;

    if (module === 'schools') {
      rows.push(['ID', 'School Name', 'Division', 'Classrooms', 'Students', 'Condition Status', 'Structural Rating', 'Last Inspection']);
      SBF_DATA.schools.forEach(s => {
        rows.push([s.id, `"${s.name}"`, `"${s.division}"`, s.sbfClassrooms, s.studentCount, s.conditionStatus, s.structuralRating, s.lastInspectionDate]);
      });
    } else if (module === 'teachers') {
      rows.push(['ID', 'Name', 'School', 'Subject', 'Pre-Test', 'Post-Test', 'Gain %', 'Status', 'Cascaded']);
      SBF_DATA.teachers.forEach(t => {
        rows.push([t.id, `"${t.name}"`, `"${t.school}"`, `"${t.subject}"`, t.preTestScore, t.postTestScore, t.gainPercent.toFixed(1), t.competencyStatus, t.cascaded]);
      });
    } else if (module === 'scholars') {
      rows.push(['ID', 'Name', 'University', 'Degree', 'Grad Year', 'Status', 'Employer', 'Position', 'Last Update']);
      SBF_DATA.scholars.forEach(s => {
        rows.push([s.id, `"${s.name}"`, `"${s.university}"`, `"${s.degree}"`, s.graduationYear, s.employmentStatus, `"${s.employer}"`, `"${s.position}"`, s.lastUpdateDate]);
      });
    } else if (module === 'disasters') {
      rows.push(['ID', 'Incident', 'School', 'Date', 'Severity', 'Repair Cost PHP', 'Status']);
      SBF_DATA.disasterReports.forEach(d => {
        rows.push([d.id, `"${d.incidentName}"`, `"${d.schoolName}"`, d.incidentDate, d.severity, d.estimatedRepairCostPHP, d.repairStatus]);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast(`CSV data export generated: ${filename}`);
  },

  // Automated Report Generator
  generateReport(reportType) {
    const modal = document.getElementById('reportPreviewModal');
    const content = document.getElementById('reportPreviewContent');
    if (!modal || !content) return;

    let reportTitle = "Security Bank Foundation - Consolidated Executive Program Report";
    let reportBody = "";

    if (reportType === 'schools') {
      reportTitle = "School Infrastructure Condition & Repair Prioritization Report";
      reportBody = `
        <h4 class="font-bold text-sm mb-2">Executive Summary</h4>
        <p class="mb-4">This audit covers 8 public school buildings turned over under the "Build a School, Build a Nation" initiative. 4 sites require prompt maintenance, with 2 in critical condition requiring emergency repairs post-typhoon.</p>
        <table class="w-full border text-left text-xs mb-4">
          <tr class="bg-slate-100"><th class="p-2 border">School</th><th class="p-2 border">Condition</th><th class="p-2 border">Rating</th><th class="p-2 border">Urgent Need</th></tr>
          ${SBF_DATA.schools.map(s => `<tr><td class="p-2 border font-medium">${s.name}</td><td class="p-2 border font-bold">${s.conditionStatus}</td><td class="p-2 border">${s.structuralRating}/100</td><td class="p-2 border">${s.urgentNeeds}</td></tr>`).join('')}
        </table>
      `;
    } else if (reportType === 'teachers') {
      reportTitle = "Teacher Competency & Training Gain Assessment Report";
      reportBody = `
        <h4 class="font-bold text-sm mb-2">Executive Summary</h4>
        <p class="mb-4">Evaluation of educators who participated in SBF training partnerships with Ateneo and DLSU. The average diagnostic score rose by +42.8% from pre-test to post-test, demonstrating strong pedagogical acquisition.</p>
        <table class="w-full border text-left text-xs mb-4">
          <tr class="bg-slate-100"><th class="p-2 border">Teacher</th><th class="p-2 border">Subject</th><th class="p-2 border">Pre-Test</th><th class="p-2 border">Post-Test</th><th class="p-2 border">Gain %</th></tr>
          ${SBF_DATA.teachers.map(t => `<tr><td class="p-2 border font-medium">${t.name}</td><td class="p-2 border">${t.subject}</td><td class="p-2 border">${t.preTestScore}%</td><td class="p-2 border font-bold">${t.postTestScore}%</td><td class="p-2 border text-emerald-700 font-bold">+${t.gainPercent.toFixed(1)}%</td></tr>`).join('')}
        </table>
      `;
    } else {
      reportTitle = "Security Bank Foundation - Consolidated Program Impact Assessment";
      reportBody = `
        <div class="grid grid-cols-3 gap-3 text-center mb-5">
          <div class="p-3 bg-emerald-50 rounded border border-emerald-100">
            <div class="text-xl font-bold text-emerald-800">8 Schools</div>
            <div class="text-[11px] text-slate-500">Infrastructure Maintained</div>
          </div>
          <div class="p-3 bg-blue-50 rounded border border-blue-100">
            <div class="text-xl font-bold text-blue-800">175 Teachers</div>
            <div class="text-[11px] text-slate-500">Cascaded Reach</div>
          </div>
          <div class="p-3 bg-teal-50 rounded border border-teal-100">
            <div class="text-xl font-bold text-teal-800">83.3%</div>
            <div class="text-[11px] text-slate-500">Scholar Employment Rate</div>
          </div>
        </div>
        <p class="text-xs text-slate-700 leading-relaxed mb-4">
          The Integrated Education Program Monitoring, Reporting, and Impact Assessment System confirms the high efficacy of Security Bank Foundation's holistic education investments. Strategic priorities for the next quarter focus on typhoon rehabilitation in Northern Luzon and expansion of the Ateneo STEM echo cascade.
        </p>
      `;
    }

    content.innerHTML = `
      <div class="border-b pb-4 mb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded bg-[#008752] text-white flex items-center justify-center font-black">SB</div>
            <div>
              <h3 class="font-bold text-slate-900 text-base">SECURITY BANK FOUNDATION, INC.</h3>
              <p class="text-[11px] text-slate-500">Better Education. Brighter Futures.</p>
            </div>
          </div>
          <div class="text-right text-[11px] text-slate-400 font-mono">
            Date Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
            Reference: SBF-REP-${Date.now().toString().slice(-6)}
          </div>
        </div>
      </div>
      <h2 class="text-lg font-bold text-slate-800 mb-3">${reportTitle}</h2>
      ${reportBody}
      <div class="mt-6 pt-4 border-t flex justify-between items-center text-xs text-slate-400">
        <span>Prepared by: SBF Program Impact Analytics Office</span>
        <span>Approved for Dissemination</span>
      </div>
    `;

    this.openModal('reportPreviewModal');
  }
};

// Initialize App on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
