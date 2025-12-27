/**
 * Analytics & Visualization Module
 * Copyright (c) 2025 imsabbar
 */

// Enhanced Charts for TypingDev - Real-time WPM tracking and progress visualization
let realtimeChart = null;
let progressChart = null;

// Real-time WPM chart during typing test
function createRealtimeChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart if exists
  if (realtimeChart) {
    realtimeChart.destroy();
  }
  
  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(226, 183, 20, 0.3)');
  gradient.addColorStop(1, 'rgba(226, 183, 20, 0.05)');
  
  realtimeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'WPM',
        data: [],
        borderColor: '#e2b714',
        backgroundColor: gradient,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: '#e2b714'
      }, {
        label: 'Raw WPM',
        data: [],
        borderColor: 'rgba(160, 160, 160, 0.7)',
        backgroundColor: 'transparent',
        borderWidth: 1,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 3,
        borderDash: [5, 5]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(26, 26, 26, 0.9)',
          titleColor: '#e2e2e2',
          bodyColor: '#e2e2e2',
          borderColor: '#3a3a3a',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: function(context) {
              return `${context[0].label}s`;
            },
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y}`;
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      scales: {
        x: {
          display: false,
          grid: {
            display: false
          }
        },
        y: {
          display: false,
          beginAtZero: true,
          grid: {
            display: false
          },
          max: function(context) {
            const maxValue = Math.max(...context.chart.data.datasets[0].data);
            return Math.max(100, maxValue * 1.2);
          }
        }
      },
      elements: {
        line: {
          borderCapStyle: 'round',
          borderJoinStyle: 'round'
        }
      }
    }
  });
  
  return realtimeChart;
}

// Update real-time chart with new WPM data
function updateRealtimeChart(timeElapsed, wpm, rawWpm) {
  if (!realtimeChart) return;
  
  const chart = realtimeChart;
  const timeLabel = Math.floor(timeElapsed);
  
  // Add new data point
  chart.data.labels.push(timeLabel);
  chart.data.datasets[0].data.push(wpm);
  chart.data.datasets[1].data.push(rawWpm);
  
  // Keep only last 30 seconds of data for performance
  if (chart.data.labels.length > 30) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    chart.data.datasets[1].data.shift();
  }
  
  chart.update('none');
}

// Clear real-time chart data
function clearRealtimeChart() {
  if (!realtimeChart) return;
  
  realtimeChart.data.labels = [];
  realtimeChart.data.datasets[0].data = [];
  realtimeChart.data.datasets[1].data = [];
  realtimeChart.update('none');
}

// Progress chart for historical data
function createProgressChart(canvasId, history) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart
  if (progressChart) {
    progressChart.destroy();
  }
  
  if (!history || history.length === 0) {
    return null;
  }
  
  // Prepare data
  const labels = history.map((h, i) => {
    const date = new Date(h.timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  
  const wpmData = history.map(h => h.wpm);
  const accuracyData = history.map(h => h.accuracy);
  const rawWpmData = history.map(h => h.rawWpm);
  
  // Create gradients
  const wpmGradient = ctx.createLinearGradient(0, 0, 0, 300);
  wpmGradient.addColorStop(0, 'rgba(226, 183, 20, 0.3)');
  wpmGradient.addColorStop(1, 'rgba(226, 183, 20, 0.05)');
  
  const accuracyGradient = ctx.createLinearGradient(0, 0, 0, 300);
  accuracyGradient.addColorStop(0, 'rgba(0, 212, 170, 0.2)');
  accuracyGradient.addColorStop(1, 'rgba(0, 212, 170, 0.05)');
  
  progressChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'WPM',
          data: wpmData,
          borderColor: '#e2b714',
          backgroundColor: wpmGradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#e2b714',
          pointBorderColor: '#0f0f0f',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          yAxisID: 'y',
        },
        {
          label: 'Raw WPM',
          data: rawWpmData,
          borderColor: 'rgba(160, 160, 160, 0.7)',
          backgroundColor: 'transparent',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: 'rgba(160, 160, 160, 0.7)',
          pointBorderColor: '#0f0f0f',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          yAxisID: 'y',
          borderDash: [5, 5]
        },
        {
          label: 'Accuracy (%)',
          data: accuracyData,
          borderColor: '#00d4aa',
          backgroundColor: accuracyGradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#00d4aa',
          pointBorderColor: '#0f0f0f',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#a0a0a0',
            font: {
              family: 'Inter',
              size: 12,
              weight: '500'
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          titleColor: '#e2e2e2',
          bodyColor: '#e2e2e2',
          borderColor: '#3a3a3a',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            title: function(context) {
              return `Session ${context[0].dataIndex + 1} - ${context[0].label}`;
            },
            label: function(context) {
              if (context.datasetIndex === 2) {
                return `${context.dataset.label}: ${context.parsed.y}%`;
              }
              return `${context.dataset.label}: ${context.parsed.y}`;
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(42, 42, 42, 0.5)',
            borderColor: '#2a2a2a'
          },
          ticks: {
            color: '#646464',
            font: {
              family: 'Inter',
              size: 11
            },
            maxTicksLimit: 8
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          grid: {
            color: 'rgba(42, 42, 42, 0.5)',
            borderColor: '#2a2a2a'
          },
          ticks: {
            color: '#646464',
            font: {
              family: 'Inter',
              size: 11
            }
          },
          title: {
            display: true,
            text: 'Words Per Minute',
            color: '#a0a0a0',
            font: {
              family: 'Inter',
              size: 12,
              weight: '500'
            }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          min: 0,
          max: 100,
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: '#646464',
            font: {
              family: 'Inter',
              size: 11
            },
            callback: function(value) {
              return value + '%';
            }
          },
          title: {
            display: true,
            text: 'Accuracy %',
            color: '#a0a0a0',
            font: {
              family: 'Inter',
              size: 12,
              weight: '500'
            }
          }
        }
      },
      elements: {
        line: {
          borderCapStyle: 'round',
          borderJoinStyle: 'round'
        },
        point: {
          hoverBorderWidth: 3
        }
      }
    }
  });
  
  return progressChart;
}

// Character accuracy breakdown chart (doughnut)
function createAccuracyBreakdownChart(canvasId, correct, incorrect, extra, missed) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  
  const ctx = canvas.getContext('2d');
  
  const total = correct + incorrect + extra + missed;
  if (total === 0) return null;
  
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Correct', 'Incorrect', 'Extra', 'Missed'],
      datasets: [{
        data: [correct, incorrect, extra, missed],
        backgroundColor: [
          '#00d4aa',
          '#ff4757',
          '#ffa502',
          '#646464'
        ],
        borderColor: '#0f0f0f',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#a0a0a0',
            font: {
              family: 'Inter',
              size: 11
            },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          titleColor: '#e2e2e2',
          bodyColor: '#e2e2e2',
          borderColor: '#3a3a3a',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const percentage = ((context.raw / total) * 100).toFixed(1);
              return `${context.label}: ${context.raw} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Cleanup function to destroy charts
function destroyAllCharts() {
  if (realtimeChart) {
    realtimeChart.destroy();
    realtimeChart = null;
  }
  
  if (progressChart) {
    progressChart.destroy();
    progressChart = null;
  }
}
