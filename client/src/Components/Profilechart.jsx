import React, { useEffect, useState } from 'react';
import '../Styles/Profile.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';

const ProfilePage = () => {
  const navigate = useNavigate();
  const emp_id = localStorage.getItem('emp_id');

  const [profile, setProfile] = useState({
    emp_email: '',
    emp_name: '',
    emp_title: '',
    emp_id: '',
  });

  const [storiesCount, setStoriesCount] = useState(0);
  const [topUsers, setTopUsers] = useState([]);
  const [chartOptions, setChartOptions] = useState({});
  const [chartSeries, setChartSeries] = useState([]);

  useEffect(() => {
    if (emp_id) {
      getDetail();
    } else {
      navigate('/');
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
        localStorage.setItem('userRole', user.GROUP_CODE);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const emp_email = localStorage.getItem('emp_email');
    const emp_name = localStorage.getItem('emp_name');
    const emp_title = localStorage.getItem('emp_title');
    const emp_id = localStorage.getItem('emp_id');

    setProfile({
      emp_email: emp_email || '',
      emp_name: emp_name || '',
      emp_title: emp_title || '',
      emp_id: emp_id || '',
    });
  }, []);

  // Fetch data for user stories count and top users
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userCountResponse = await axios.post(
          `${process.env.REACT_APP_IPCONFIG}api/userCountnews`,
          { Created_user: emp_id }
        );
        setStoriesCount(userCountResponse.data[0].Stories_count);

        const topUsersResponse = await axios.post(
          `${process.env.REACT_APP_IPCONFIG}api/topUserCount`,
        );

        if (Array.isArray(topUsersResponse.data) && topUsersResponse.data.length > 0) {
          setTopUsers(topUsersResponse.data);
          console.log(topUsersResponse.data);
        } else {
          setTopUsers([]); 
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (emp_id) {
      fetchUserData();
    }
  }, [emp_id]);





  useEffect(() => {
    if (topUsers && topUsers.length > 0) {
      const userNamesWithZones = topUsers.map((user) => `${user.user_name || 'Unknown'} (${user.Zone_Name || 'Unknown Zone'})`); 
      const storyCounts = topUsers.map((user) => user.Story_Count || 0); 

      setChartOptions({
        chart: {
          type: 'bar',
          height: 700, 
        },
        plotOptions: {
          bar: {
            barHeight: '100%',
            distributed: true,
            horizontal: true,
            dataLabels: {
              position: 'bottom'
            },
          },
        },
        colors: ['#FF6384', '#36A2EB', '#FFCE56', '#FF8C00', '#8A2BE2',
            '#FF69B4', '#CD5C5C', '#2E8B57', '#FFD700', '#00CED1'
        ],
        fill: {
          colors: [
            '#FF6384', '#36A2EB', '#FFCE56', '#FF8C00', '#8A2BE2',
            '#FF69B4', '#CD5C5C', '#2E8B57', '#FFD700', '#00CED1'
          ],
        },
        stroke: {
          width: 1,
          colors: ['#fff']
        },
        xaxis: {
          categories: userNamesWithZones,
          title: {
            text: 'Story Count',
            style: {
              fontSize: '18px', 
            }
          },
          labels: {
            style: {
              fontSize: '15px', 
            }
          }
        },
        yaxis: {
          title: {
            text: 'User Names with Zones',
            style: {
              fontSize: '15px', 
            }
          },
          labels: {
            style: {
              fontSize: '15px', 
            }
          }
        },
        
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '12px', 
            colors: ['#333']
          }
        },
        title: {
          text: 'Top 10 Users by Story Count with Zone',
          align: 'center',
          style: {
            fontSize: '12px', 
          }
        },
      });

      setChartSeries([
        {
          name: 'Story Count',
          data: storyCounts,
        },
      ]);
    }
  }, [topUsers]);

  return (
    <div className='p-body'>
      <div className='p-container'>
        <div className='p-profile-card'>
          <div className='p-profile-title'>Profile Page</div>
          <div className='p-profile-item'>
            <strong>Name:</strong> {profile.emp_name}
          </div>
          <div className='p-profile-item'>
            <strong>Title:</strong> {profile.emp_title}
          </div>
          <div className='p-profile-item'>
            <strong>ID:</strong> {profile.emp_id}
          </div>
          <div className='p-profile-item'>
            <strong>Email:</strong> {profile.emp_email}
          </div>
        </div>

        {topUsers.length > 0 ? (
          <div className='chart-container'>
            <ReactApexChart options={chartOptions} series={chartSeries} type='bar' height={600} />
          </div>
        ) : (
          <p>Loading chart data...</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
