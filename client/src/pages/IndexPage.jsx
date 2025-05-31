import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this at the top
import { X } from 'lucide-react';
import NavigationHeader from '../pages/NavigationHeader';

const HealthReminder = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate(); // Add this inside your component
  const predefinedSymptoms = [
    'Fever', 'Cough', 'Headache', 'Fatigue', 
    'Shortness of breath', 'Sore throat', 'Runny nose'
  ];

  // Filter symptoms from predefined list
  const filteredSymptoms = inputValue 
    ? predefinedSymptoms.filter(symptom => 
        symptom.toLowerCase().includes(inputValue.toLowerCase())
      )
    : [];

  // Add a symptom
  const addSymptom = (symptom) => {
    const lowerCaseSymptom = symptom.toLowerCase();
    if (!selectedSymptoms.includes(lowerCaseSymptom)) {
      setSelectedSymptoms([...selectedSymptoms, lowerCaseSymptom]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  // Remove a symptom
  const removeSymptom = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
  };

const validateForm = async (e) => {
  e.preventDefault();

  if (selectedSymptoms.length === 0) {
    alert("Please select at least one symptom.");
    return;
  }

  try {
    const response = await fetch('/submit-symptoms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms: selectedSymptoms }),
    });

    const result = await response.json();

    navigate('/results', {
      state: {
        diseases: result.diseases,
        message: result.message,
      },
    });
  } catch (err) {
    console.error('Failed to fetch disease data:', err);
    alert('There was an error fetching disease data. Please try again.');
  }
};

  return (
    <div className="health-reminder-wrapper">
      <NavigationHeader />
      
      <div className="hr-bg-overlay"></div>
      <img src="/images/algae.png" className="hr-bg-image" alt="Background" />

      <div className="hr-container">
        <h1 className="hr-title">Enter Your Symptoms</h1>
        <div className="hr-form">
          <div className="hr-symptoms-container">
            <i className="fa fa-search hr-search-icon"></i>
            <input
              type="text"
              className="hr-symptoms-input"
              placeholder="Start typing symptoms..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
            />
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSymptoms.length > 0 && (
            <div className="hr-suggestions">
              {filteredSymptoms.map((symptom, index) => (
                <div 
                  key={index} 
                  className="hr-suggestion-item"
                  onClick={() => addSymptom(symptom)}
                >
                  {symptom}
                </div>
              ))}
            </div>
          )}

          {/* Selected Symptoms Bubbles */}
          <div className="hr-symptom-bubbles">
            {selectedSymptoms.map((symptom, index) => (
              <div key={index} className="hr-symptom-bubble">
                {symptom} 
                <span 
                  className="hr-delete-symptom" 
                  onClick={() => removeSymptom(symptom)}
                >
                  ⌧︎
                </span>
              </div>
            ))}
          </div>
          
          <div className="hr-spacer"></div>

          <button type="button" className="hr-submit-btn" onClick={validateForm}>
            Search
          </button>
        </div>
      </div>

      {/* Rising Bubbles */}
      <div className="hr-bubbles">
        <div><img src="/images/bubble1.png" alt="Bubble" /></div>
        <div><img src="/images/bubble3.png" alt="Bubble" /></div>
        <div><img src="/images/bubble1.png" alt="Bubble" /></div>
        <div><img src="/images/bubble4.png" alt="Bubble" /></div>
        <div><img src="/images/bubble1.png" alt="Bubble" /></div>
        <div><img src="/images/bubble1.png" alt="Bubble" /></div>
        <div><img src="/images/bubble3.png" alt="Bubble" /></div>
        <div><img src="/images/bubble4.png" alt="Bubble" /></div>
      </div>

     

      <style jsx>{`
        /* Scoped scrollbar styles for this component */
        .health-reminder-wrapper ::-webkit-scrollbar {
          width: 20px;
        }

        .health-reminder-wrapper ::-webkit-scrollbar-track {
          background: #f69f2ebe;
        }

        .health-reminder-wrapper ::-webkit-scrollbar-thumb {
          background-color: #644d00a6;
        }

        .health-reminder-wrapper ::-webkit-scrollbar-thumb:hover {
          background-color: #4f3906bd;
        }

        /* Main wrapper */
        .health-reminder-wrapper {
          font-family: Arial, sans-serif;
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Container for the content */
        .hr-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          position: relative;
          z-index: 2;
          padding-top: 120px; /* Add space for navigation */
        }

        /* Styling for the symptom bubbles */
        .hr-symptom-bubbles {
          margin-top: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }

        .hr-symptom-bubble {
          background-color: rgb(172, 72, 22);
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          font-size: 14px;
        }

        .hr-delete-symptom {
          margin-left: 5px;
          font-weight: bold;
          cursor: pointer;
          color: white;
        }

        /* Styling for the suggestion dropdown */
        .hr-suggestions {
          border: 1px solid #cccccc00;
          max-height: 150px;
          overflow-y: auto;
          position: absolute;
          background-color: rgba(255, 255, 255, 0.95);
          width: 100%;
          max-width: 600px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          border-radius: 8px;
          margin-top: 5px;
        }

        .hr-suggestion-item {
          padding: 8px;
          cursor: pointer;
          text-align: left;
        }

        .hr-suggestion-item:hover {
          background-color: #0f59199d;
          color: #ffffff;
        }

        /* Form and Input Styles */
        .hr-form {
          text-align: center;
          margin-top: 50px;
          position: relative;
        }

        /* Title styling */
        .hr-title {
          margin-bottom: 10px;
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          color: #333;
        }

        /* Input container with icon */
        .hr-symptoms-container {
          position: relative;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .hr-symptoms-input {
          padding: 12px 15px 12px 40px;
          font-size: 16px;
          border-radius: 25px;
          border: 2px solid #c7c7c7;
          width: 100%;
          background-color: rgba(138, 143, 46, 0.774);
          box-shadow: 0 0 15px rgba(60, 60, 60, 0.43);
          box-sizing: border-box;
        }

        .hr-symptoms-input:focus {
          border-color: #ffffff;
          outline: none;
        }

        .hr-symptoms-input::placeholder {
          color: #aaa;
        }

        /* Search icon positioning */
        .hr-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #ffffff;
          font-size: 18px;
          z-index: 5;
        }

        /* Submit button */
        .hr-submit-btn {
          padding: 10px 20px;
          font-size: 16px;
          margin-top: 30px;
          border: 1.8px solid #131313cc;
          background-color: #006400;
          color: white;
          border-radius: 10px;
          cursor: pointer;
          width: 50%;
          max-width: 300px;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .hr-submit-btn:hover {
          background-color: #004d00;
        }

        /* Spacer */
        .hr-spacer {
          height: 40px;
        }

        /* Bubbles animation container */
        .hr-bubbles {
          position: fixed;
          width: 100%;
          height: 100%;
          bottom: 0;
          left: 0;
          pointer-events: none;
          z-index: -1;
          display: flex;
          justify-content: space-evenly;
          align-items: flex-end;
        }

        /* Individual bubbles */
        .hr-bubbles div {
          position: absolute;
          opacity: 0;
          bottom: -10%;
          animation: hr-rise 15s linear infinite;
        }

        /* Bubble positioning and delays */
        .hr-bubbles div:nth-child(1) {
          left: 10%;
          animation-delay: 0s;
        }

        .hr-bubbles div:nth-child(2) {
          left: 30%;
          animation-delay: 3s;
        }

        .hr-bubbles div:nth-child(3) {
          left: 50%;
          animation-delay: 5s;
        }

        .hr-bubbles div:nth-child(4) {
          left: 70%;
          animation-delay: 2s;
        }

        .hr-bubbles div:nth-child(5) {
          left: 90%;
          animation-delay: 4s;
        }

        .hr-bubbles div:nth-child(6) {
          left: 20%;
          animation-delay: 6s;
        }

        .hr-bubbles div:nth-child(7) {
          left: 40%;
          animation-delay: 7s;
        }

        .hr-bubbles div:nth-child(8) {
          left: 60%;
          animation-delay: 8s;
        }

        /* Keyframes for Rising Bubbles */
        @keyframes hr-rise {
          0% {
            opacity: 0;
            bottom: -10%;
            transform: translateX(0) scale(3);
          }
          10% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            bottom: 110%;
            transform: translateX(-20px) scale(4);
          }
        }

        /* Bubble image styling */
        .hr-bubbles div img {
          width: 30px;
          height: 30px;
          object-fit: contain;
          border-radius: 50%;
        }

        /* Background overlay */
        .hr-bg-overlay {
          position: fixed;
          top: 61.5px; /* Start below the navbar */
          left: 0;
          width: 100%;
          height: calc(100vh - 61.5px); /* Adjust height to account for navbar */
          background: rgba(212, 209, 59, 0.39);
          z-index: 0;
          pointer-events: none;
        }

        /* Background image */
        .hr-bg-image {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: -1;
        }

        /* Custom alert */
        .hr-custom-alert {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          z-index: 1000;
        }

        .hr-close-alert {
          position: absolute;
          top: 10px;
          right: 15px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default HealthReminder;