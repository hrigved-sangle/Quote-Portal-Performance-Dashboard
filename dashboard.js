
async function fetchData(url) {
    const res = await fetch(url);
    return await res.json();
  }
  
  let currentFilters = {
    state: "",
    roof_type: "",
    year: ""
  };
  
  function addFiltersToURL(baseURL) {
    const params = new URLSearchParams();
    if (currentFilters.state) params.append("state", currentFilters.state);
    if (currentFilters.roof_type) params.append("roof_type", currentFilters.roof_type);
    if (currentFilters.year) params.append("year", currentFilters.year);
    return `${baseURL}?${params.toString()}`;
  }
  
  
  async function populateFilterDropdowns() {
    const allData = await fetchData("http://localhost:5000/api/stats/by-state");
  
    
    const stateSelect = document.getElementById("stateFilter");
    for (let state of Object.keys(allData)) {
      let option = document.createElement("option");
      option.value = state;
      option.textContent = state;
      stateSelect.appendChild(option);
    }
  
    
    const roofTypeRes = await fetchData("http://localhost:5000/api/stats/roof-size-type");
    const roofTypeSelect = document.getElementById("roofTypeFilter");
    for (let type of Object.keys(roofTypeRes)) {
      let option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      roofTypeSelect.appendChild(option);
    }
  
    
    const yearSelect = document.getElementById("dateFilter");
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 5; y--) {
      let option = document.createElement("option");
      option.value = y;
      option.textContent = y;
      yearSelect.appendChild(option);
    }
  }
  
  
  async function renderSummary() {
    const summary = await fetchData(addFiltersToURL("http://localhost:5000/api/stats/summary"));
    document.getElementById("totalProjects").textContent = summary.totalProjects;
    document.getElementById("avgRoofSize").textContent = summary.averageRoofSize;
    document.getElementById("commonRoofType").textContent = summary.commonRoofType;
  }
  
  
  let charts = [];
  
  function destroyCharts() {
    charts.forEach(chart => chart.destroy());
    charts = [];
  }
  
  async function renderProjectsByState() {
    const data = await fetchData(addFiltersToURL("http://localhost:5000/api/stats/by-state"));
    const labels = Object.keys(data);
    const values = Object.values(data);
  
    const chart = new Chart(document.getElementById("projectsByStateChart"), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '# of Projects',
          data: values,
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  
    charts.push(chart);
  }
  
  async function renderAvgRoofSizeByType() {
    const data = await fetchData(addFiltersToURL("http://localhost:5000/api/stats/roof-size-type"));
    const labels = Object.keys(data);
    const values = Object.values(data);
  
    const chart = new Chart(document.getElementById("avgRoofSizeByTypeChart"), {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Avg Roof Size',
          data: values,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
          ]
        }]
      },
      options: {
        responsive: true
      }
    });
  
    charts.push(chart);
  }
  
  async function renderMonthlyTrend() {
    const data = await fetchData(addFiltersToURL("http://localhost:5000/api/stats/monthly-trend"));
    const labels = Object.keys(data);
    const values = Object.values(data);
  
    const chart = new Chart(document.getElementById("monthlyTrendChart"), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Projects per Month',
          data: values,
          borderColor: 'rgba(75,192,192,1)',
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  
    charts.push(chart);
  }
  
  
  async function applyFilters() {
    currentFilters.state = document.getElementById("stateFilter").value;
    currentFilters.roof_type = document.getElementById("roofTypeFilter").value;
    currentFilters.year = document.getElementById("dateFilter").value;
  
    
    destroyCharts();
    await renderSummary();
    await renderProjectsByState();
    await renderAvgRoofSizeByType();
    await renderMonthlyTrend();
  }
  
  
  function resetFilters() {
    
    document.getElementById("stateFilter").value = "";
    document.getElementById("roofTypeFilter").value = "";
    document.getElementById("dateFilter").value = "";
  
    
    currentFilters.state = "";
    currentFilters.roof_type = "";
    currentFilters.year = "";
  
    
    applyFilters();
  }
  
  
  async function exportPDF() {
    const { jsPDF } = window.jspdf;
    const dashboard = document.getElementById("dashboard-content");
  
    const canvas = await html2canvas(dashboard, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
  
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
  
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
    let position = 0;
  
    
    if (imgHeight > pageHeight) {
      let heightLeft = imgHeight;
  
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
  
        if (heightLeft > 0) pdf.addPage();
      }
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }
  
    pdf.save("dashboard_export.pdf");
  }
  
  
  async function initDashboard() {
    await populateFilterDropdowns();
    await applyFilters(); 
  }
  
  initDashboard();
  
