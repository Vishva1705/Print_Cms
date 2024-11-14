
import React, { useState, useEffect } from "react";
import '../Styles/storyassign.css'
import '../Styles/Thumbnail.css'
import { useNavigate } from "react-router-dom";
import axios from "axios";
 
 
const Storyassign = () => {

  const navigate = useNavigate();

  const emp_code = localStorage.getItem('emp_id')
  const emp_id = localStorage.getItem("emp_id");
  const emp_name = localStorage.getItem("emp_name");

  useEffect(() => {
    if (emp_id) {
      getDetail();
    } else {
      navigate("/");
    }
  }, [emp_id, navigate]);


  const getDetail = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IPCONFIG}api/getUser`,
        { User_Id: emp_id }
      );
      const user = response.data;

      if (user.GROUP_CODE) {
        localStorage.setItem("userRole", user.GROUP_CODE);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const iframeStyle = {
    // width: '100vw',
    // height: '100vh',
    border: 'none'
  };
 
  return (
   <div className="main-content">
        <div className="iframe-container">
          <iframe
            src="http://192.168.90.90:7156/"
            className="responsive-iframe"
            title="External Content"
          />
        </div>
        </div>
      );
};
 
export default Storyassign;