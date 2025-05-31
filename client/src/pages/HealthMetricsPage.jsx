import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import NavigationHeader from '../pages/NavigationHeader';

const HealthMetrics = () => {
  const [username, setUsername] = useState('');
  const [metrics, setMetrics] = useState({
    weight: [],
    steps: [],
    heartRate: [],
    dates: [],
  });
  const [message, setMessage] = useState({
    steps: '',
    weight: '',
    heartRate: '',
  });
  const [addBlocked, setAddBlocked] = useState(false);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);


  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/health-metrics/data`, {
    credentials: 'include',
  })
      .then(res => res.json())
      .then(data => {
        setUsername(data.username);
        setMessage(data.message);
        setMetrics(data.user);
        renderChart(data.user);

        const lastDate = new Date(data.user.dates.at(-1));
        const now = new Date();
        const diffHours = (now - lastDate) / (1000 * 3600);
        if (diffHours < 24) setAddBlocked(true);
      });
  }, []);

  const handleAddMetric = async () => {
    const weight = prompt('Enter your weight (kg):');
    const steps = prompt('Enter your steps:');
    const heartRate = prompt('Enter your heart rate (bpm):');

    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/metrics`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    username,
    weight: Number(weight),
    steps: Number(steps),
    heartRate: Number(heartRate)
  }),
});

    const data = await res.json();
    if (data.error) return alert(data.error);
    setMessage(data.message);
    window.location.reload();

  };

  const renderChart = (data) => {
  const ctx = chartRef.current?.getContext('2d');
  if (!ctx) return;

  if (chartInstanceRef.current) {
    chartInstanceRef.current.destroy();
  }

  chartInstanceRef.current = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.dates.map(d => new Date(d).toLocaleDateString()),
      datasets: [
        {
          label: 'Weight (kg)',
          data: data.weight,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
        },
        {
          label: 'Steps',
          data: data.steps,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
        },
        {
          label: 'Heart Rate (bpm)',
          data: data.heartRate,
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Value' } },
      },
    },
  });
};


  return (
    <>
      <NavigationHeader />
      <div class="bg-overlay"></div> 
    <img src="/images/health.jpg" class="bg" alt="Background"></img>
      <div className="health-metrics-container">
      <h1>Welcome, {username}!</h1>

      <div className="welcome-message">
        <p>{message.steps}</p>
        <p>{message.weight}</p>
        <p>{message.heartRate}</p>
      </div>

      <ul>
        <li>Heart Rate: {metrics.heartRate.at(-1)} BPM</li>
        <li>Steps: {metrics.steps.at(-1)} steps</li>
        <li>Weight: {metrics.weight.at(-1)} kg</li>
      </ul>

      <h3>Average Metrics:</h3>
      <ul>
        <li>Average Heart Rate: {(metrics.heartRate.reduce((a, b) => a + b, 0) / metrics.heartRate.length || 0).toFixed(1)} BPM</li>
        <li>Average Steps: {(metrics.steps.reduce((a, b) => a + b, 0) / metrics.steps.length || 0).toFixed(1)} steps</li>
        <li>Average Weight: {(metrics.weight.reduce((a, b) => a + b, 0) / metrics.weight.length || 0).toFixed(1)} kg</li>
      </ul>

      <div className="health-metrics-display">
        <div className="health-metric-card">
          <h2>Weight</h2>
          <p>{metrics.weight.at(-1)} kg</p>
        </div>
        <div className="health-metric-card">
          <h2>Steps</h2>
          <p>{metrics.steps.at(-1)}</p>
        </div>
        <div className="health-metric-card">
          <h2>Heart Rate</h2>
          <p>{metrics.heartRate.at(-1)} bpm</p>
        </div>
      </div>

      <button id="add-metric-btn" className="health-metrics-btn" onClick={handleAddMetric} disabled={addBlocked}>
        Add New Metric
      </button>
      {addBlocked && <div id="message" style={{ color: 'red' }}>24 hours are not up yet. Please wait before adding new metrics.</div>}

      <canvas id="progress-chart" className="health-metrics-chart" ref={chartRef}></canvas>


      <p className="final-message">Your health metrics are logged! Track your trends over time to better understand your progress.</p>
    </div>
    <style jsx>{`
    /* General Styles */

/* For Chrome, Edge, Safari */
::-webkit-scrollbar {
  width: 20px; /* Adjust the width of the scrollbar */
}

::-webkit-scrollbar-track {
  background: #cef46ebe; /* Color of the track */
}

::-webkit-scrollbar-thumb {
  background-color: #644d00a6; /* Color of the thumb (the draggable part) */
}

::-webkit-scrollbar-thumb:hover {
  background-color: #4f3906bd; /* Thumb color on hover */
}

body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  line-height: 1.6;
  background-image: radial-gradient(at 40% 20%, rgb(42 255 0 / 42%) 0px, #a1909000 50%), radial-gradient(at 80% 0%, rgb(21 98 6 / 71%) 0px, #fcfcfc40 50%), radial-gradient(at 0% 50%, rgb(187 191 6) 0px, #a2cf12e0 50%);
  color: var(--text-color);
}

  
.health-metrics-container {
  color: var(--text-color);
  max-width: 1300px;
  margin: 0 auto;
  color: #333;
}

.bg-overlay {
  padding-top: 20px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgb(250 255 32 / 31%);
  z-index: -1;
  pointer-events: none;
}

/* Background Image */
.bg {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
object-fit: cover;
z-index: -2;
filter: blur(3px); /* Apply the blur effect */
transition: filter 0.3s ease; /* Optional: smooth transition for blur effect */
}
  /* Main Content */
  .health-metrics-container h1 {
    color: #333;
  }
  
  .health-metrics-container .welcome-message {
    box-shadow: 0 4px 6px rgb(0 0 0 / 24%);
    background-color: #bbffbb30;
    border: 1px solid #4CAF50;
    padding: 20px;
    border-radius: 5px;
    margin-bottom: 20px;
  }
  
  .health-metrics-container .welcome-message p {
    margin: 5px 0;
    font-size: 19px;
    font-family: cursive;
}
  
  .health-metrics-container ul {
    padding: 0;
    list-style: none;
  }
  
  .health-metrics-container ul li {
    font-size: 18px;
    margin-bottom: 8px;
  }
  /* Metrics Section */
  .health-metrics-display {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
  }
  
  .health-metric-card {
    background-color:  #fcff9ec9;
    padding: 20px;
    border-radius: 8px;
    width: 30%;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .health-metric-card h2 {
    margin-bottom: 10px;
    color: #333;
  }
  
  .health-metric-card p {
    font-size: 24px;
    color: #4CAF50;
    font-weight: bold;
  }
  
  .health-metrics-btn {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
  }
  
  .health-metrics-btn:hover {
    background-color: #45a049;
  }
  
  .health-metrics-chart {
    width: 100%;
    height: 300px;
    margin-top: 40px;
  }
  
  .final-message {
    font-size: 18px;
    color: #555;
    text-align: center;
    margin-top: 30px;
  }
  
  /* Chart Styles */
  .chart-container {
    margin-top: 30px;
  }
  
  #progress-chart {
    max-width: 100%;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .health-metrics-display {
      flex-direction: column;
      align-items: center;
    }
  
    .health-metric-card {
      width: 80%;
      margin-bottom: 20px;
    }
  }
  
  @media (max-width: 480px) {
    .health-metrics-container {
      padding: 10px;
    }
  
    .health-metrics-btn {
      width: 100%;
      font-size: 18px;
    }
  }
  
    `}</style>
    </>
  );
};

export default HealthMetrics;