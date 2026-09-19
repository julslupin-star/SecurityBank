// Security Bank Foundation - Chart.js Visualizations Manager

const SBFCharts = {
  instances: {},

  destroyChart(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  },

  // Module 1 & 6: School Facility Health Distribution
  renderFacilityChart(canvasId = 'facilityStatusChart') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.destroyChart(canvasId);

    const counts = { Good: 0, "Needs Monitoring": 0, "Needs Repair": 0, Critical: 0 };
    SBF_DATA.schools.forEach(s => {
      if (counts[s.conditionStatus] !== undefined) counts[s.conditionStatus]++;
    });

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Good Condition', 'Needs Monitoring', 'Needs Repair', 'Critical / Urgent'],
        datasets: [{
          data: [counts['Good'], counts['Needs Monitoring'], counts['Needs Repair'], counts['Critical']],
          backgroundColor: ['#22c55e', '#eab308', '#f97316', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 14, font: { family: "'Segoe UI', sans-serif", size: 12 } }
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw} School(s) (${Math.round((context.raw / SBF_DATA.schools.length) * 100)}%)`
            }
          }
        },
        cutout: '68%'
      }
    });
  },

  // Module 2 & 6: Teacher Pre-Test vs Post-Test Gain
  renderCompetencyChart(canvasId = 'teacherCompetencyChart') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.destroyChart(canvasId);

    const labels = SBF_DATA.teachers.map(t => t.name.split(' ')[0] + ' (' + t.subject.split(' ')[0] + ')');
    const preScores = SBF_DATA.teachers.map(t => t.preTestScore);
    const postScores = SBF_DATA.teachers.map(t => t.postTestScore);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Pre-Test Score (%)',
            data: preScores,
            backgroundColor: '#94a3b8',
            borderRadius: 4,
            barPercentage: 0.6
          },
          {
            label: 'Post-Test Score (%)',
            data: postScores,
            backgroundColor: '#008752', // SBF Green
            borderRadius: 4,
            barPercentage: 0.6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20 },
            grid: { color: '#f1f5f9' }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, padding: 12 }
          }
        }
      }
    });
  },

  // Module 4 & 6: Cascade Reach Multiplier
  renderCascadeChart(canvasId = 'cascadeReachChart') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.destroyChart(canvasId);

    const divisions = SBF_DATA.cascadeActivities.map(c => c.division);
    const teachersReached = SBF_DATA.cascadeActivities.map(c => c.recipientTeacherCount);
    const studentsReached = SBF_DATA.cascadeActivities.map(c => c.recipientStudentImpact);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: divisions,
        datasets: [
          {
            type: 'bar',
            label: 'Teachers Cascaded To',
            data: teachersReached,
            backgroundColor: '#0284c7', // SBF Sky Blue
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: 'Students Impacted (Reach)',
            data: studentsReached,
            borderColor: '#f59e0b', // SBF Gold
            backgroundColor: '#f59e0b',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Trained Teachers' },
            grid: { color: '#f1f5f9' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Student Beneficiaries' },
            grid: { drawOnChartArea: false }
          },
          x: { grid: { display: false } }
        },
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, padding: 10 } }
        }
      }
    });
  },

  // Module 5 & 6: Scholar Employment Status
  renderScholarChart(canvasId = 'scholarEmploymentChart') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.destroyChart(canvasId);

    const counts = {
      Employed: 0,
      "Seeking Employment": 0,
      "Further Studies": 0,
      "Unemployed": 0,
      "Information Not Updated": 0
    };

    SBF_DATA.scholars.forEach(s => {
      if (counts[s.employmentStatus] !== undefined) counts[s.employmentStatus]++;
    });

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Employed', 'Seeking Employment', 'Further Studies', 'Information Not Updated'],
        datasets: [{
          data: [
            counts['Employed'],
            counts['Seeking Employment'],
            counts['Further Studies'],
            counts['Information Not Updated']
          ],
          backgroundColor: ['#10b981', '#38bdf8', '#a855f7', '#94a3b8'],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 12, font: { size: 11 } }
          }
        },
        cutout: '65%'
      }
    });
  },

  // Module 3 & 6: Disaster Damage Distribution
  renderDisasterChart(canvasId = 'disasterSeverityChart') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.destroyChart(canvasId);

    const counts = { Minor: 0, Moderate: 0, Major: 0, Critical: 0 };
    SBF_DATA.disasterReports.forEach(d => {
      if (counts[d.severity] !== undefined) counts[d.severity]++;
    });

    this.instances[canvasId] = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: ['Minor', 'Moderate', 'Major', 'Critical'],
        datasets: [{
          data: [counts.Minor, counts.Moderate, counts.Major, counts.Critical],
          backgroundColor: [
            'rgba(20, 184, 166, 0.75)',
            'rgba(245, 158, 11, 0.75)',
            'rgba(249, 115, 22, 0.75)',
            'rgba(239, 68, 68, 0.75)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } }
        },
        scales: {
          r: { ticks: { stepSize: 1, display: false } }
        }
      }
    });
  },

  // Initialize all dashboard charts
  initAll() {
    this.renderFacilityChart();
    this.renderCompetencyChart();
    this.renderCascadeChart();
    this.renderScholarChart();
    this.renderDisasterChart();
  }
};
