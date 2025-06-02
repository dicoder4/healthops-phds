import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import '../styles/homePage.css';
import NavigationHeader from '../pages/NavigationHeader';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState({ dates: [], weight: [], steps: [], heartRate: [] });
  const [reminders, setReminders] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [foods, setFoods] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [newReview, setNewReview] = useState('');
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

const fetchHomepageData = async () => {
  try {
    console.log("[HOMEPAGE] Fetching homepage data...");
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/homePage`, {
  credentials: 'include'  // ← add this
});

    if (!res.ok) throw new Error('Failed to load homepage data');
    const data = await res.json();

    setReminders(data.reminders || []);
    setExercises(data.exercises || []);
    setFoods(data.foods || []);
    setReviews(data.reviews || []);
    setUser({ username: data.username, _id: data.userId });  // add _id for review auth
    setMetrics({
      dates: data.user?.dates || [],
      weight: data.user?.weight || [],
      steps: data.user?.steps || [],
      heartRate: data.user?.heartRate || []
    });
  } catch (err) {
    console.error('Failed to fetch homepage data:', err);
  }
};


  const fetchMetrics = async () => {
    try {
      console.log(`[METRICS] Fetching metrics for user: ${user?.username}`);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/metrics/${user.username}`, {
  credentials: 'include'  // ← add this
});
      const data = await response.json();
      setMetrics(data || {});
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

useEffect(() => {
  fetchHomepageData();
}, []);



  useEffect(() => {
    if (metrics.dates.length && chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: metrics.dates.map(date => new Date(date).toLocaleDateString()),
          datasets: [
            {
              label: 'Weight (kg)',
              data: metrics.weight,
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 3,
              fill: false,
              pointRadius: 6,
              pointHoverRadius: 8
            },
            {
              label: 'Steps',
              data: metrics.steps,
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 3,
              fill: false,
              pointRadius: 6,
              pointHoverRadius: 8
            },
            {
              label: 'Heart Rate (bpm)',
              data: metrics.heartRate,
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 3,
              fill: false,
              pointRadius: 6,
              pointHoverRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                font: {
                  size: 14
                }
              }
            }
          },
          scales: {
            x: { 
              title: { 
                display: true, 
                text: 'Date',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              ticks: {
                font: {
                  size: 12
                }
              }
            },
            y: { 
              beginAtZero: true,
              title: { 
                display: true, 
                text: 'Value',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              ticks: {
                font: {
                  size: 12
                }
              }
            }
          }
        }
      });
    }
  }, [metrics]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return alert("Review can't be empty.");
    
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/reviews`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // ← add this
  body: JSON.stringify({ text: newReview })
});
      if (res.ok) {
        setNewReview('');
        fetchHomepageData();
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };


  const handleReviewAction = async (reviewId, action) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/reviews/${reviewId}/${action}`, {
  method: 'POST',
  credentials: 'include'  // ← add this
});
      if (res.ok) fetchHomepageData();
    } catch (err) {
      console.error(`Error ${action}ing review:`, err);
    }
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === 2 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? 2 : prev - 1));
  };
function WelcomeMessage({ user }) {
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const visitedBefore = localStorage.getItem('visitedBefore');
    if (visitedBefore) {
      setIsFirstVisit(false);
    } else {
      localStorage.setItem('visitedBefore', 'true');
      setIsFirstVisit(true);
    }
  }, []);

    if (isFirstVisit) {
    return <h1 className="welcome-text">Welcome, {user?.username || 'User'}!</h1>;
  } else {
    return <h1 className="welcome-text">Welcome, {user?.username || 'User'}!</h1>;
  }
}
  return (
    <>
      <NavigationHeader />
      
      <main>
        <section className="hero-banner">
          <div className="bg-overlay"></div>
          <img src="/images/bg4.jpg" className="bg" alt="Background" />
          <div className="container1">
            <div className="content">
              <WelcomeMessage user={user} />
              <div className="containertype">
      <p className="typing-text">How are you doing?</p>
    </div>
              <p className="grow-text"><i>Keep up the great work! Track your daily routines and stay on top of your health goals.</i></p>
              <div className="Character">
                <img className="Character_shadow pixelart" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/21542/DemoRpgCharacterShadow.png" alt="Shadow" />
                <img className="Character_spritesheet pixelart face-down" src="/images/bg5.png" alt="Character" />
              </div>
            </div>

            <div className="carousel">
              <div className="carousel-wrapper">
                <div className={`carousel-item ${activeSlide === 0 ? 'active' : ''}`}>
                  <h2>Health Metrics</h2>
                  <p>Track your progress over time.</p>
                  <div className="chart-container">
                    <canvas id="progress-chart" ref={chartRef}></canvas>
                  </div>
                </div>
                
                <div className={`carousel-item ${activeSlide === 1 ? 'active' : ''}`}>
                  <h2>Weekly Recommendations</h2>
                  <div className="unified-recommendations">
                    <div className="recommendations-grid">
                      <div className="exercise-section">
                        <h3>Exercise Recommendations</h3>
                        <ul>
                          {exercises.map((exercise, index) => (
                            <li key={index}>
                              <strong>{exercise.exercise_name || exercise}</strong><br />
                              {exercise.duration && <span>Duration: {exercise.duration}<br /></span>}
                              {exercise.calories_burned && <span>Calories Burned: {exercise.calories_burned} kcal<br /></span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="food-section">
                        <h3>Food Recommendations</h3>
                        <ul>
                          {foods.map((food, index) => (
                            <li key={index}>
                              <strong>{food.food_name || food}</strong><br />
                              {food.calories_per_serving && <span>Calories per serving: {food.calories_per_serving} kcal<br /></span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={`carousel-item ${activeSlide === 2 ? 'active' : ''}`}>
                  <h2>Your Reminders</h2>
                  {reminders.length === 0 ? (
                    <p>No reminders yet. Start adding one to stay on track!</p>
                  ) : (
                    <ul id="reminders">
                      {reminders.map((reminder, index) => (
                        <li key={index} className={reminder.completed ? 'completed' : ''}>
                          <span>
                            {reminder.text} {reminder.time && `at ${reminder.time}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <button className="carousel-btn prev" onClick={prevSlide}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="carousel-btn next" onClick={nextSlide}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </section>

        <section className="membership-info">
          <div className="container">
            <h2 className="why-join-heading">Why This is Beneficial</h2>
            <ul className="why-join-list">
              <li><strong>All-in-One Health Platform:</strong> Track your health metrics, food intake, exercises, and reminders in one place.</li>
              <li><strong>Personalized Insights:</strong> Receive tailored exercise recommendations and symptom-based health suggestions.</li>
              <li><strong>Stay Motivated:</strong> Visualize your progress with easy-to-read graphs and daily snapshots.</li>
              <li><strong>Build Healthy Habits:</strong> Set reminders to stay consistent with your wellness goals and routines.</li>
            </ul>
          </div>
        </section>

        <section className="testimonials">
          <h2>What Our Members Are Saying</h2>

          <div className="reviews-list">
            {reviews.map((review) => (
              <div className="testimonial" key={review._id} data-id={review._id}>
                <div className="review-header">
                  <span>- {review.user?.username || 'Anonymous'}</span>
                  <span className="review-timestamp">
                    (Submitted on {new Date(review.createdAt).toLocaleString()})
                  </span>
                  
                </div>
                <p>{review.text}</p>
                <div className="review-actions">
                  <button 
                    className="like-btn" 
                    onClick={() => handleReviewAction(review._id, 'like')}
                    disabled={review.likedBy?.includes(user?._id)}
                  >
                    👍 {review.likes || 0}
                  </button>
                  <button 
                    className="dislike-btn" 
                    onClick={() => handleReviewAction(review._id, 'dislike')}
                    disabled={review.dislikedBy?.includes(user?._id)}
                  >
                    👎 {review.dislikes || 0}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form id="review-form" onSubmit={handleReviewSubmit}>
  <textarea 
    id="new-review" 
    placeholder="Write your review here..." 
    value={newReview}
    onChange={(e) => setNewReview(e.target.value)}
  ></textarea>
  <button id="submit-review" type="submit">Submit</button>
</form>

        </section>
      </main>

      <footer>
        <div className="container">
          <p>&copy; 2025 MedSquire. All Rights Reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        /* Character Animation Styles */
        :root {
          --pixel-size: 6;
        }
        
        body {
          background: #96ffc1;
        }
        
        .Character {
          width: calc(32px * var(--pixel-size));
          height: 175px;
          overflow: hidden;
          position: relative;
          margin: auto;
          align-items: start;
        }
        
        .Character_spritesheet {
          animation: moveSpritesheet 1s steps(4) infinite;
          width: calc(128px * var(--pixel-size));
          height: calc(128px * var(--pixel-size));
          position: absolute;
          left: 0;
          top: 0;
        }
        
        .Character_shadow {
          position: absolute;
          width: calc(32px * var(--pixel-size));
          height: calc(32px * var(--pixel-size));
          left: 0;
          top: calc(32px * var(--pixel-size));
        }
        
        .pixelart {
          image-rendering: pixelated;
        }
        
        .face-right {
          top: calc(-32px * var(--pixel-size));
        }
        
        .face-up {
          top: calc(-64px * var(--pixel-size));
        }
        
        .face-left {
          top: calc(-96px * var(--pixel-size));
        }
        
        @keyframes moveSpritesheet {
          from {
            transform: translate3d(0px, 0, 0);
          }
          to {
            transform: translate3d(-100%, 0, 0);
          }
        }

        .bg-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(221 217 30 / 60%); /* Light transparent overlay */
    z-index: 0; /* Place overlay above the background */
}

        /* Enhanced Carousel Styles - Much Wider */
        .carousel {
          position: relative;
          margin: 2rem auto;
          max-width: 2000px; /* Increased from 800px */
          width: 100%; /* Increased from 90% */
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .carousel-wrapper {
          position: relative;
          overflow: hidden;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 600px; /* Increased from 400px */
        }
        
        .carousel-item {
          display: none;
          padding: 3rem; /* Increased from 2rem */
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          text-align: center;
          width: 100%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .carousel-item.active {
          display: block;
        }
        
        .carousel-item h2 {
          margin-bottom: 1.5rem; /* Increased spacing */
          color: #2c3e50;
          font-size: 2.2rem; /* Increased from 1.8rem */
          font-weight: 600;
        }
        
        .carousel-item p {
          margin-bottom: 2rem; /* Increased spacing */
          color: #5a6c7d;
          font-size: 1.2rem; /* Increased from 1.1rem */
        }
        
        /* Enhanced Chart Container for Much Bigger Graph */
        .chart-container {
          width: 100%;
          height: 500px; /* Much larger height */
          margin: 2rem 0;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 2rem;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        #progress-chart {
          width: 100% !important;
          height: 100% !important;
        }
        
        /* Side-by-Side Recommendations Grid */
        .recommendations-grid {
          display: grid;
          grid-template-columns: 1fr 1fr; /* Two equal columns */
          gap: 1rem; /* Space between columns */
          align-items: start;
        }
        
        .exercise-section, .food-section {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          height: fit-content;
        }
        
        .exercise-section h3, .food-section h3 {
          color: #2c3e50;
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 0.5rem;
          text-align: center;
        }
        
        .exercise-section ul, .food-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
          text-align: left;
        }
        
        .exercise-section li, .food-section li {
          background: rgba(255, 255, 255, 0.15);
          padding: 1rem;
          margin-bottom: 0.75rem;
          border-radius: 8px;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        
        .exercise-section li:hover, .food-section li:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .exercise-section li:last-child, .food-section li:last-child {
          margin-bottom: 0;
        }
        
        .exercise-section li strong, .food-section li strong {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 1.1rem;
          color: #2c3e50;
        }
        
        /* Improved Arrow Buttons */
        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(135deg,rgb(232, 131, 42) 0%, #f2c94c 100%);
          color: white;
          border: none;
          width: 60px; /* Increased from 50px */
          height: 60px; /* Increased from 50px */
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .carousel-btn:hover {
          transform: translateY(-50%) scale(1.1);
          background: linear-gradient(135deg,rgb(210, 112, 25) 0%,rgb(206, 163, 35) 100%);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        
        .carousel-btn:active {
          transform: translateY(-50%) scale(0.95);
        }
        
        .carousel-btn.prev {
          left: -35px; /* Adjusted for larger buttons */
        }
        
        .carousel-btn.next {
          right: -35px; /* Adjusted for larger buttons */
        }
        
        .carousel-btn svg {
          width: 28px; /* Increased from 24px */
          height: 28px; /* Increased from 24px */
          stroke-width: 2.5;
        }

        /* Unified Recommendations Container - Updated */
        .unified-recommendations {
        justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .carousel {
            max-width: 1000px;
          }
          
          .chart-container {
            height: 400px;
          }
        }
        
        @media (max-width: 968px) {
          .recommendations-grid {
            grid-template-columns: 1fr; /* Stack vertically on smaller screens */
            gap: 1.5rem;
          }
          
          .carousel {
            width: 95%;
            margin: 1rem auto;
          }
          
          .chart-container {
            height: 350px;
            padding: 1rem;
          }
          
          .carousel-item {
            padding: 2rem;
            min-height: 500px;
          }
          
          .carousel-item h2 {
            font-size: 1.8rem;
          }
        }

        @media (max-width: 768px) {
          .carousel-btn {
            width: 50px;
            height: 50px;
          }
          
          .carousel-btn.prev {
            left: -25px;
          }
          
          .carousel-btn.next {
            right: -25px;
          }
          
          .carousel-btn svg {
            width: 24px;
            height: 24px;
          }
          
          .carousel-item {
            padding: 1.5rem;
            min-height: 400px;
          }
          
          .carousel-item h2 {
            font-size: 1.5rem;
          }
          
          .chart-container {
            height: 300px;
            padding: 1rem;
          }
        }

        /* Improved Reminders List */
        #reminders {
          list-style: none;
          padding: 0;
          display: grid;
          gap: 1rem;
          text-align: left;
        }
        
        #reminders li {
          font-family: SANS-SERIF;
          font-size: 19.5px;
          background: #4689311f;
          padding: 1.25rem;
          border-radius: var(--border-radius, 8px);
          box-shadow: 0 4px 6px var(--shadow-color, rgba(0, 0, 0, 0.1));
          transition: all var(--transition-speed, 0.3s);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid rgba(99, 102, 241, 0.1);
          color: #3e0707;
        }
        
        #reminders li:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 12px var(--shadow-color, rgba(0, 0, 0, 0.1));
          border-color: var(--primary-light, #63f);
        }
      
        .completed {
          text-decoration: line-through;
          color: gray !important;
        }
      `}</style>
    </>
  );
};

export default HomePage;