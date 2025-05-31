import React, { useEffect, useState, useRef } from 'react';
import NavigationHeader from '../pages/NavigationHeader';
const FitnessLogs = () => {
  const [user, setUser] = useState({});
  const [exercises, setExercises] = useState([]);
  const [foods, setFoods] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [routineExplanation, setRoutineExplanation] = useState('');
const [gender, setGender] = useState('');

  const fetchFitnessLogs = async () => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/fitnessLogs`);
    const data = await res.json();
    setUser(data.user);
    setGender(data.user.gender); // add this line
    setExercises(data.exercises);
    setFoods(data.foods);
    setWeeklySchedule(data.weeklySchedule);
    setRoutineExplanation(data.routineExplanation);
  };
  

  useEffect(() => {
    fetchFitnessLogs();
  }, []);

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());

    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/update-goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      fetchFitnessLogs();
    }
  };
  return (
    <>
    <div className="bg-overlay"></div>
    <img className="bg" src="/images/bwfitness.jpg" alt="Background" />
    <NavigationHeader className="site-header" />
    <div className="container">
      <h1 className="fitness-h1">Fitness Logs</h1>

      <form onSubmit={handleGoalSubmit} className="fitness-form">
        <label htmlFor="currentWeight" className="fitness-label">Current Weight (kg):</label>
       <input type="number" name="currentWeight" defaultValue={user?.currentWeight || ''} required className="fitness-input" />

        <label htmlFor="height" className="fitness-label">Height (cm):</label>
        <input type="number" name="height" defaultValue={user?.height || ''} required className="fitness-input" />


        <label htmlFor="age" className="fitness-label">Age:</label>
        <input type="number" name="age" defaultValue={user?.age || ''} required className="fitness-input" />

        <label htmlFor="gender" className="fitness-label">Gender:</label>
        <select name="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="fitness-select">
  <option value="male">Male</option>
  <option value="female">Female</option>
  <option value="others">Others</option>
</select>


        <label htmlFor="idealWeight" className="fitness-label">Ideal Weight (kg):</label>
        <input type="number" name="idealWeight" defaultValue={user?.idealWeight || ''} required className="fitness-input" />

        <button type="submit" className="fitness-submit-btn">Submit</button>
      </form>

      <p className="fitness-routine">{routineExplanation}</p>

      <div className="recommendations">
        <div className="card">
          <h2 className="fitness-h2">Exercise Recommendations</h2>
          <ul className="fitness-list">
            {exercises.map((exercise, index) => (
              <li key={index} className="fitness-list-item">
                <strong className="fitness-strong">{exercise.exercise_name}</strong><br />
                <span id="text">Duration: {exercise.duration}</span><br />
                <span id="text">Calories Burned: {exercise.calories_burned} kcal</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2 className="fitness-h2">Food Recommendations</h2>
          <ul className="fitness-list">
            {foods.map((food, index) => (
              <li key={index} className="fitness-list-item">
                <strong className="fitness-strong">{food.food_name}</strong><br />
                <span id="text">Calories per serving: {food.calories_per_serving} kcal</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="fitness-h2">Weekly Schedule</h2>
      <table className="fitness-table">
        <thead>
          <tr>
            <th className="fitness-th">Day</th>
            <th className="fitness-th">Exercise</th>
            <th className="fitness-th">Food</th>
          </tr>
        </thead>
        <tbody>
          {weeklySchedule.length > 0 ? (
            weeklySchedule.map((day, index) => (
              <tr key={index} className="fitness-tr">
                <td className="fitness-td">{day.day}</td>
                <td className="fitness-td">
                  <strong className="fitness-strong">{day.exercise.exercise_name}</strong><br />
                  <span id="text">Duration: {day.exercise.duration}</span><br />
                  <span id="text">Calories Burned: {day.exercise.calories_burned} kcal</span>
                </td>
                <td className="fitness-td">
                  <strong className="fitness-strong">{day.food.food_name}</strong><br />
                  <span id="text">Calories per serving: {day.food.calories_per_serving} kcal</span>
                </td>
              </tr>
            ))
          ) : (
            <tr className="fitness-tr">
              <td colSpan="3" className="fitness-td">No weekly schedule available</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="fitness-h2">Ideal Weight Chart</h2>
      <table className="fitness-table">
        <thead>
          <tr>
            <th className="fitness-th">Age Group</th>
            <th className="fitness-th">Gender</th>
            <th className="fitness-th">Ideal Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="fitness-tr"><td className="fitness-td">18–25</td><td className="fitness-td">Male</td><td className="fitness-td">60–80 kg</td></tr>
          <tr className="fitness-tr"><td className="fitness-td">18–25</td><td className="fitness-td">Female</td><td className="fitness-td">50–70 kg</td></tr>
          <tr className="fitness-tr"><td className="fitness-td">26–35</td><td className="fitness-td">Male</td><td className="fitness-td">65–85 kg</td></tr>
          <tr className="fitness-tr"><td className="fitness-td">26–35</td><td className="fitness-td">Female</td><td className="fitness-td">55–75 kg</td></tr>
          <tr className="fitness-tr"><td className="fitness-td">36–45</td><td className="fitness-td">Male</td><td className="fitness-td">70–90 kg</td></tr>
          <tr className="fitness-tr"><td className="fitness-td">36–45</td><td className="fitness-td">Female</td><td className="fitness-td">60–80 kg</td></tr>
        </tbody>
      </table>
      
      <style jsx>{`
        .fitness-routine {
    font-size: 19px;
    font-style: italic;
    font-family: cursive;
}

.fitness-list-item {
    font-size: 19px;
    font-family: cursive;
}

  .fitness-h1{
    color:#522309;
    margin-bottom: 2rem;
    position: relative;
    padding-bottom: 0.75rem;
    font-weight: 700;
    font-size: 32px;
  }

  .fitness-h2 {
    color:#5d290c;
    margin-bottom: 2rem;
    position: relative;
    padding-bottom: 0.75rem;
    font-weight: 700;
    font-size: 26px;
  }
  
  .fitness-h1::after, .fitness-h2::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 80px;
    height: 4px;
    background: linear-gradient(to right, var(--primary-color), #5c3706bd);
    border-radius: 2px;
    transition: width var(--transition-speed);
  }
  
  .fitness-h1:hover::after, .fitness-h2:hover::after {
    width: 500px;
  }

/* Modern Color Palette */
:root {
    --primary-color: #098215ad;
    --primary-light: #e1df21bd;
    --secondary-color: #22476c;
    --text-color: #334155;
    --success-color: #c1c051;
    --danger-color: #952057;
    --warning-color: #f59e0b;
    --shadow-color: rgb(40 148 154 / 52%);
    --transition-speed: 0.3s;
    --border-radius: 12px;
  }

.fitness-label {
    font-weight: 600;
    color: #34495e;
}

.fitness-input, .fitness-select {
    margin-right: 10px;
    width: 90px;
    padding: 0.1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.fitness-input:focus, .fitness-select:focus {
    border-color: #4CAF50;
    outline: none;
}

.fitness-submit-btn {
    background: #9c623be6;
    color: white;
    padding: .6rem 2rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s ease;
    grid-column: 1 / -1;
}

.fitness-submit-btn:hover {
    background: #9c623b;
}

/* Cards Layout */
.recommendations {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
}

.card {
    background: white;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
}

.card h2 {
    color: #2c3e50;
    margin-bottom: 1rem;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 0.5rem;
}

/* Table Styling */
.fitness-table {
    width: 100%;
    background: #ffffff40;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin: 2rem 0;
}

.fitness-th {
    background: #046c08ad;
    color: white;
    padding: 1rem;
    text-align: left;
    
}

.fitness-td {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
}

.fitness-tr:last-child .fitness-td {
    border-bottom: none;
}

.fitness-tr:hover {
    background: #ffffff9e;
}


/* Responsive Design */
@media (max-width: 768px) {
    .container {
        padding: 0 1rem;
    }

    .fitness-form {
        grid-template-columns: 1fr;
    }

    .recommendations {
        grid-template-columns: 1fr;
    }
}
.bg-overlay {
    padding-top: 20px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgb(255 207 48 / 70%);
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
  filter: blur(4.5px); /* Apply the blur effect */
transition: filter 0.3s ease; /* Optional: smooth transition for blur effect */
}
.site-header{
    position: relative;
    z-index: 10;
}
#text{
    font-size: 18px;
    color: #262826ce;
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}

.fitness-strong{
font-size: 22px;
font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}
      `}</style>
    </div>
    </>
  );
}

export default FitnessLogs;