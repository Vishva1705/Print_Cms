import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
 
function HttAuth() {
  const location = useLocation();
  const navigate = useNavigate();
 
  useEffect(() => {
    // Function to parse query string parameters
    function parseQueryString(queryString) {
      const params = new URLSearchParams(queryString);
      const formDataParam = params.get("formData");
      return formDataParam
        ? JSON.parse(decodeURIComponent(formDataParam))
        : null;
    }
 
    const formData = parseQueryString(location.search);
 
    const fetchUserAndNavigate = async () => {
      if (formData !== null) {
        const { ad_name, ad_email, ad_access, ad_emp_id, jobTitle } = formData;
 
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_IPCONFIG}api/getUser`,
            { User_Id: ad_emp_id }
          );
          const user = response.data;
 
          if (user.GROUP_CODE) {
            localStorage.setItem("userRole", user.GROUP_CODE);
          }
        } catch (error) {
          console.log(error);
        }
 
        localStorage.setItem("emp_name", ad_name);
        localStorage.setItem("emp_email", ad_email);
        localStorage.setItem("emp_accesskey", ad_access);
        localStorage.setItem("emp_id", ad_emp_id);
        localStorage.setItem("emp_title", jobTitle);

        const role = localStorage.getItem("userRole");
 
        if (role === "PRD") {
          navigate("/thumbnail");
        } else {
          navigate("/article-view");
        }
      } else {
        console.log("No formData found in the URL.");
        navigate("/");
      }
    };
 
    fetchUserAndNavigate();
  }, [location.search, navigate]);
 
  return <div></div>;
}
 
export default HttAuth;