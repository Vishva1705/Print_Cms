import React, { useEffect, useState } from 'react';
import '../Styles/Profile.css';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaSave } from 'react-icons/fa'; // Import icons

const ProfilePage = () => {

  const navigate = useNavigate();
  const emp_id = localStorage.getItem("emp_id"); // Assuming emp_id is stored in localStorage

  const [isEditing, setIsEditing] = useState(false); // Track if editing is active
  const [newName, setNewName] = useState(""); // New name to be updated
  const [profile, setProfile] = useState({
    emp_email: localStorage.getItem('emp_email') || '', // Fetch emp_email from localStorage
    emp_title: localStorage.getItem('emp_title') || '', // Fetch emp_title from localStorage
    emp_name: '',
    emp_id: ''
  });

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

      console.log('user data', response.data);

      if (user) {
        // Populate profile state from API response (except for emp_email and emp_title)
        setProfile((prevProfile) => ({
          ...prevProfile,
          emp_name: user.User_name || '',
          emp_id: user.User_Id || ''
        }));
      }

      if (user.GROUP_CODE) {
        localStorage.setItem("userRole", user.GROUP_CODE);
      }

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const apiresponse = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/userCountnews`, { Created_user: emp_id });
        const result = apiresponse.data[0].Stories_count;

        console.log('Stories_count:', result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUserCount();
  }, [emp_id]);

  // Handle edit mode
  const handleEditClick = () => {
    setNewName(profile.emp_name); // Set the current name in input field
    setIsEditing(true);
  };

  // Handle saving the new name
  const handleSaveClick = async () => {
    try {
      // Make the API request to update the user's name
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/updateUserName`, {
        emp_id: profile.emp_id,
        new_name: newName
      });
  
      // Check if the response contains a message
      if (response && response.data) {
        // Assuming the response contains a message field with success or failure
        const message = response.data.message || 'Name updated successfully';
        alert(message); // Show success message in alert
  
        // Update localStorage and profile state with the new name
        localStorage.setItem('emp_name', newName);
        setProfile((prevProfile) => ({
          ...prevProfile,
          emp_name: newName
        }));
  
        // Refresh the page to reflect the updated data
        window.location.reload();
      } else {
        console.error('API response is missing message:', response);
        alert('Something went wrong. Please try again later.');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      alert('There was an error updating the name. Please try again.');
      window.location.reload();
    }
  };
  

  return (
    <div className='p-body '>
      <div className="p-container">
        <div className="p-profile-card">
          <div className="p-profile-title">Profile Page</div>

          <div className="p-profile-item">
            <strong>Name:</strong>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="edit-input"
                />
                <FaSave className="save-icon" onClick={handleSaveClick} />
              </>
            ) : (
              <>
                {profile.emp_name}
                <FaEdit className="edit-icon" onClick={handleEditClick} />
              </>
            )}
          </div>

          <div className="p-profile-item">
            <strong>Title:</strong> {profile.emp_title} {/* Title from localStorage */}
          </div>
          <div className="p-profile-item">
            <strong>ID:</strong> {profile.emp_id}
          </div>
          <div className="p-profile-item">
            <strong>Email:</strong> {profile.emp_email} {/* Email from localStorage */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;






// import React, { useEffect, useState } from 'react';
// import '../Styles/Profile.css';
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
 
// const ProfilePage = () => {

//     const navigate = useNavigate();

//     const emp_id = localStorage.getItem("emp_id");
//     const emp_name = localStorage.getItem("emp_name");
  
//     useEffect(() => {
//       if (emp_id) {
//         getDetail();
//       } else {
//         navigate("/");
//       }
//     }, [emp_id, navigate]);
  
  
//     const getDetail = async () => {
//       try {
//         const response = await axios.post(
//           `${process.env.REACT_APP_IPCONFIG}api/getUser`,
//           { User_Id: emp_id }
//         );
//         const user = response.data;
  
//         if (user.GROUP_CODE) {
//           localStorage.setItem("userRole", user.GROUP_CODE);
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     };
    
//   const [profile, setProfile] = useState({
//     emp_email: '',
//     emp_name: '',
//     emp_title: '',
//     emp_id: ''
//   });
 
//   useEffect(() => {
//     const emp_email = localStorage.getItem('emp_email');
//     const emp_name = localStorage.getItem('emp_name');
//     const emp_title = localStorage.getItem('emp_title');
//     const emp_id = localStorage.getItem('emp_id');
 
//     setProfile({
//       emp_email: emp_email || '',
//       emp_name: emp_name || '',
//       emp_title: emp_title || '',
//       emp_id: emp_id || ''
//     });
//   }, []);



//     useEffect(() => {
//       const fetchUserCount = async () => {
//         try {
//           const apiresponse = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/userCountnews`, { Created_user: emp_id });
//           const result = apiresponse.data[0].Stories_count;

//           console.log('Stories_count:', result);

//         } catch (error) {
//           console.error('Error fetching data:', error);
//         }
//       };
  
//       fetchUserCount();
//     }, []);
  
 
//   return (
//     <div className='p-body '>
//     <div className="p-container">
//       <div className="p-profile-card">
//         <div className="p-profile-title">Profile Page</div>
//         <div className="p-profile-item">
//           <strong>Name:</strong> {profile.emp_name}
//         </div>
//         <div className="p-profile-item">
//           <strong>Title:</strong> {profile.emp_title}
//         </div>
//         <div className="p-profile-item">
//           <strong>ID:</strong> {profile.emp_id}
//         </div>
//         <div className="p-profile-item">
//           <strong>Email:</strong> {profile.emp_email}
//         </div>
//       </div>
//     </div>
//     </div>
//   );
// };
 
// export default ProfilePage;