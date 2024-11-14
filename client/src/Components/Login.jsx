import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';
import LoginImage from '../Assest/Login.webp'
import "../Styles/Login.css";

const HomePage = () => {
  const navigate = useNavigate();

  // Check session storage for emp_email
  const empEmail = localStorage.getItem('emp_email');

  useEffect(() => {
    if (empEmail) {
      navigate('/article-view'); // Navigate to article-view if empEmail is present
    }
  }, [empEmail, navigate]);

  const adAuth = async () => {
    const url = `${process.env.REACT_APP_IPCONFIG}user`;
    const base64EncodedUrl = btoa(url);
    window.location.href = `https://auth.kslmedia.in/index.php?return=${base64EncodedUrl}`;
  };

  return (

    <>
      <div className="login-page">
        <img src={LoginImage} alt="Login"></img>
        <div className="loginbutton">
          <button className="loginbutton button2" onClick={adAuth}>LOGIN</button>
        </div>
      </div>

    </>



  );
};

export default HomePage;
