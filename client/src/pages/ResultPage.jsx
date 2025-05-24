import React from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';


const ResultPage = () => {
  const { state } = useLocation();
  const { diseases = [], message } = state || {};
  return (
    <>
      <div className="result-page">
      <div className="bg-overlay"></div>
      <img src="/images/algae.png" className="bg" alt="Background" />
      <div className="container">
        <h1>Possible Diseases You May Have</h1>

        {message && <div className="alert">{message}</div>}

        {diseases.length > 0 ? (
          diseases.map((disease, index) => (
            <div className="disease-card" key={index}>
              <h2><strong>{disease.disease}</strong></h2>
              <p><strong>Symptoms:</strong> {disease.symptoms.join(', ')}</p>
              <p className="description"><strong>Description:</strong> {disease.description}</p>
              <p className="medication"><strong>Medication:</strong> {disease.medication}</p>
            </div>
          ))
        ) : (
          <p>No diseases matched the provided symptoms.</p>
        )}

        <div className="back-link">
          <Link to="/index">Go back and enter more symptoms</Link>
        </div>
      </div>
    </div>

      <style jsx>{`
        /* For Chrome, Edge, Safari */
        ::-webkit-scrollbar {
          width: 20px; /* Adjust the width of the scrollbar */
        }
        
        ::-webkit-scrollbar-track {
          background: #f69f2ebe; /* Color of the track */
        }
        
        ::-webkit-scrollbar-thumb {
          background-color: #644d00a6; /* Color of the thumb (the draggable part) */
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background-color: #4f3906bd; /* Thumb color on hover */
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }

        .container {
          max-width: 900px;
          margin: 30px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 15px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        h1 {
          text-align: center;
          color: #444;
          margin-bottom: 30px;
          font-size: 2em;
        }

        .disease-card {
          background-color: #8bbd71bb;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .disease-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .disease-card h2 {
          color: #52210f;
          font-size: 1.5em;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .disease-card p {
          color: #555;
          line-height: 1.6;
          margin: 10px 0;
        }

        .disease-card .name {
          font-style: italic;
          color: #352525;
        }
        
        .disease-card .description {
          font-style: italic;
          color: #666;
        }

        .disease-card .medication {
          font-weight: bold;
          color: #28a745;
        }

        .back-link {
          text-align: center;
          margin-top: 40px;
          font-size: 1.2em;
        }

        .back-link a {
          color: #c40505;
          text-decoration: none;
          font-weight: bold;
        }

        .back-link a:hover {
          text-decoration: underline;
        }

        .alert {
          color: red;
          font-weight: bold;
          text-align: center;
          margin-bottom: 20px;
        }

        .bg-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: rgba(212, 209, 59, 0.38);
          z-index: 0;
          pointer-events: none;
        }

        .bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: -1;
        }
      `}</style>
    </>
  );
};

export default ResultPage;