import React, { useEffect, useState, useCallback, useId } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, FloatingLabel, Button, Image, Table, Modal, } from 'react-bootstrap';
import { BsTrash, BsArrowsFullscreen, BsBackspace } from 'react-icons/bs';
import { ToastContainer, toast } from 'react-toastify';
import "../Styles/ArticleEditor.css";
import Lottie from "lottie-react";
import Loading from '../Assest/Loading.json'


const ArticleEditor = () => {



  const emp_code = localStorage.getItem('emp_id')
  const [role, setRole] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    setRole(userRole);
  }, []);


  const { articleId, articleIssueDate } = useParams();

  const location = useLocation();
  const { view } = location.state || {};



  const [article, setArticle] = useState([]);
  console.log("article value:", article);

  const [formData, setFormData] = useState({
    product: '',
    layout: '',
    zone: '',
    storyto: '',
    pagename: '',
    Ref_story_name: '',
    HeadKicker: '',
    Head: '',
    HeadDesk: '',
    Byline: '',
    Dateline: '',
    paragraph: '',
    filenames: '',
    path: '',
    finalCaption: '',
    xml_parent_action: '',
    Status: '',
    ArticleCreatedUser: '',
    Chief_Report_User: '',
    Editorial_User: '',
    Report_User: '',
    xml_name: '',
    IssueDate: '',
    caption: '',
    Sub_Editor_View: '',
    SP_Sub_Editor: '',
    SP_Editor: '',
    Assigned_USER: '',
    approved_datetime: '',
    Created_user: '',
    Assigned_to: '',
    Created_user_time: '',
    Report_User_time: '',
    Chief_Report_User_time: '',
    Editorial_User_time: '',
    SP_Editor_time: '',
    Sub_Editor_time: '',
    SP_Sub_Editor_time: '',
    Assign_time: '',
    Processed_user: '',
    article_status: '',
  });
  // console.log('form data :', formData);

  const [files, setFiles] = useState([]);
  console.log('old images :', files);

  const [newFiles, setNewFiles] = useState([]);
  console.log('New images :', newFiles);


  const [captions, setCaptions] = useState([]);
  const [newCaptions, setNewCaptions] = useState([]);



  const combinedCaptions = [...captions, ...newCaptions];
  // console.log('combinedCaptions', combinedCaptions);

  const [paragraph, setParagraph] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [zones, setZones] = useState([]);
  const [assignUsers, setAssignUsers] = useState([]);
  const [pageNames, setPageNames] = useState([]);

  const [showAlert, setShowAlert] = useState(false);
  const [saveflag, setSaveFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [usersData, setUsersData] = useState([]);


  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IPCONFIG}api/article/articleuserids`
        );
        setUsersData(response.data);
        console.log("userData", response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsersData();
  }, []);

  const userMap = usersData.reduce((acc, user) => {
    acc[user.User_ID] = user.User_name;
    return acc;
  }, {});

  const getUserName = (userId) => userMap[userId] || userId;

  const [showPopup, setShowPopup] = useState(false);

  const handleShowPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };


  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: false
    });
  };

  const CustomAlert = ({ message, onClose }) => {
    return (
      <div className="message-box-overlay">
        <div className="message-box">
          <p>{message}</p>
          <button onClick={onClose} className="btn btn-primary">OK</button>
        </div>
      </div>
    );
  };



  const closeAlert = () => {
    setShowAlert(false);
    if (saveflag == false) {
      navigate('/article-view');
    }
    else if (saveflag == true) {
      window.location.reload();
    }
  };




  // Function to format the date as YYYY-MM-DD
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const issuedate = formatDate(articleIssueDate);

  const zone_name = async (zoneCode) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/Zone_name_api`, { zoneCode });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  const product_name = async (productCode) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/product_name_api`, { Product_Id: productCode });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch article
        const articleResponse = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/fetchnews/id`, {
          newsid: articleId,
          issuedate: issuedate,
        });
        const articleData = articleResponse.data;
        setArticle(articleData);

        // Fetch products
        const productsResponse = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getproducts`);
        const productsData = productsResponse.data.map(product => product.Product_Name);
        setProducts(productsData);

        // Fetch zones
        const zonesResponse = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getzone`);
        const zonesData = zonesResponse.data.map(zone => zone.Zone_Name);
        setZones(zonesData);

        // Update form data with fetched article data
        var zone_value;
        if (articleData[0].Zone_Code === 'ALL') {
          zone_value = 'ALL';
        }
        else {
          zone_value = await zone_name(articleData[0].Zone_Code);
        }

        const product_value = await product_name(articleData[0].Product);

        // Fetch page names and assign users based on the initial layout and zone
        let pageNamesResponse = [];
        let assignUsersResponse = [];

        if (articleData[0].desk_type) {
          pageNamesResponse = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/pagenumber`, { deskName: articleData[0].desk_type });
          setPageNames(pageNamesResponse.data.map(page => page.page_id));
        }

        if (zone_value) {
          assignUsersResponse = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/assignuser`, { zoneName: zone_value });
          setAssignUsers(assignUsersResponse.data.map(user => user.User_name));
        }

        setFormData({
          ...formData,
          product: articleData[0].Product ? articleData[0].Product : '',
          layout: articleData[0].desk_type ? articleData[0].desk_type : '',
          zone: articleData[0].Zone_Code ? zone_value : '',
          pagename: articleData[0].Page_name ? articleData[0].Page_name : '',
          Ref_story_name: articleData[0].Ref_story_name ? articleData[0].Ref_story_name : '',
          storyto: articleData[0].Articles_Created,
          HeadKicker: articleData[0].HeadKicker,
          Head: articleData[0].Head,
          HeadDesk: articleData[0].HeadDeck,
          Byline: articleData[0].byline,
          Dateline: articleData[0].dateline,
          paragraph: articleData[0].content ? articleData[0].content : '',
          imagePath: articleData[0].Image_Path ? articleData[0].Image_Path : '',
          xml_parent_action: articleData[0].xml_parent_action ? articleData[0].xml_parent_action : '',
          Status: articleData[0].Status ? articleData[0].Status : '',
          ArticleCreatedUser: articleData[0].ArticleCreatedUser ? articleData[0].ArticleCreatedUser : '',
          Chief_Report_User: articleData[0].Chief_Report_User ? articleData[0].Chief_Report_User : '',
          Editorial_User: articleData[0].Editorial_User ? articleData[0].Editorial_User : '',
          Report_User: articleData[0].Report_User ? articleData[0].Report_User : '',
          xml_name: articleData[0].xml_name ? articleData[0].xml_name : '',
          IssueDate: articleData[0].IssueDate ? formatDate(articleData[0].IssueDate) : '',
          caption: articleData[0].Name_Caption ? articleData[0].Name_Caption : '',
          Assigned_USER: '',
          Assigned_to: articleData[0].Assigned_USER ? articleData[0].Assigned_USER : '',
          Created_user: articleData[0].Created_user ? articleData[0].Created_user : '',
          SP_Sub_Editor: articleData[0].SP_Sub_Editor ? articleData[0].SP_Sub_Editor : '',
          SP_Editor: articleData[0].SP_Editor ? articleData[0].SP_Editor : '',
          filenames: articleData[0].Image_Name ? articleData[0].Image_Name : '',
          Report_User_time: articleData[0].Report_User_time ? articleData[0].Report_User_time : '',
          Chief_Report_User_time: articleData[0].Chief_Report_User_time ? articleData[0].Chief_Report_User_time : '',
          Editorial_User_time: articleData[0].Editorial_User_time ? articleData[0].Editorial_User_time : '',
          SP_Editor_time: articleData[0].SP_Editor_time ? articleData[0].SP_Editor_time : '',
          Sub_Editor_time: articleData[0].Sub_Editor_time ? articleData[0].Sub_Editor_time : '',
          SP_Sub_Editor_time: articleData[0].SP_Sub_Editor_time ? articleData[0].SP_Sub_Editor_time : '',

        });

        setParagraph(articleData[0].content);
        setWordCount(articleData[0].content.trim().split(/\s+/).length);

        const imageNames = articleData[0].Image_Name ? articleData[0].Image_Name.split('~') : [];
        const imageCaptions = articleData[0].Name_Caption ? articleData[0].Name_Caption.split('/n') : [];

        setFiles(imageNames);
        setCaptions(imageCaptions);

        // Fetch layouts based on the product
        const layoutsResponse = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/getlayouts`, { productName: articleData[0].Product });
        setLayouts(layoutsResponse.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [articleId, issuedate]);





  const handleProductChange = useCallback(async (e) => {
    const selectedProduct = e.target.value;
    setFormData(prevState => ({ ...prevState, product: selectedProduct }));
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/getlayouts`, { productName: selectedProduct });
      setLayouts(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);



  const handleZoneChange = useCallback(async (e) => {
    const selectedZone = e.target.value;
    setFormData(prevState => ({ ...prevState, zone: selectedZone }));
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/assignuser`, { zoneName: selectedZone });
      setAssignUsers(response.data.map(user => user.User_name));
    } catch (error) {
      console.error(error);
    }
  }, []);




  const handleLayoutChange = useCallback(async (e) => {
    const selectedLayout = e.target.value;
    setFormData(prevState => ({ ...prevState, layout: selectedLayout }));
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/pagenumber`, { deskName: selectedLayout });
      setPageNames(response.data.map(page => page.page_id));
    } catch (error) {
      console.error(error);
    }
  }, []);



  const handleParagraphChange = useCallback((e) => {
    const text = e.target.value;
    setParagraph(text);
    setWordCount(text.trim().split(/\s+/).length);
    setFormData(prevState => ({ ...prevState, paragraph: text }));
  }, []);


  // const handleParagraphChange = useCallback((e) => {
  //   const text = e.target.value;
  //   setFormData(prevState => {
  //     const updatedParagraph = text;
  //     setWordCount(updatedParagraph.trim().split(/\s+/).length);
  //     return { ...prevState, paragraph: updatedParagraph };
  //   });
  // }, []);


  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setNewFiles([...newFiles, ...selectedFiles]);
  };


  const handleCaptionChange = (index, caption) => {
    setCaptions(prevCaptions => {
      const newCaptions = [...prevCaptions];
      newCaptions[index] = caption;
      newCaptions.join('/n')
      return newCaptions;

    });

  };



  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      const textarea = event.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const beforeCursor = formData.paragraph.substring(0, start);
      const afterCursor = formData.paragraph.substring(end);

      const updatedParagraph = `${beforeCursor}\n\n${afterCursor}`;

      setFormData(prevState => ({ ...prevState, paragraph: updatedParagraph }));
      setWordCount(updatedParagraph.trim().split(/\s+/).length);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };


  const handleNewCaptionChange = (index, caption) => {
    setNewCaptions(prevNewCaptions => {
      const updatedNewCaptions = [...prevNewCaptions];
      updatedNewCaptions[index] = caption;
      return updatedNewCaptions;
    });
  };



  // const handleImageRemove = async (index) => {

  //   console.log('Files array:', files);
  //   if (index < 0 || index >= files.length) {
  //     console.error('Index out of bounds');
  //     return;
  //   }

  //   const imageNameToRemove = files[index];
  //   console.log('imageNameToRemove:', imageNameToRemove);

  //   const folderName = formData.xml_name;

  //   if (!imageNameToRemove) {
  //     console.error('No image name found');
  //     return;
  //   }

  //   const newFiles = [...files];
  //   newFiles.splice(index, 1);
  //   setFiles(newFiles);

  //   const newCaptions = [...captions];
  //   newCaptions.splice(index, 1);
  //   setCaptions(newCaptions);

  //   const updatedImageNames = newFiles;
  //   setFormData(prevFormData => ({
  //     ...prevFormData,
  //     filenames: updatedImageNames.join('~'),
  //     Image_Name: updatedImageNames.join('~'),
  //   }));


  //   try {
  //     await axios.post(`${process.env.REACT_APP_IPCONFIG}api/deleteImageName`, null, {
  //       params: {
  //         xml_name: folderName,
  //         imagename: imageNameToRemove,
  //       },
  //     });

  //     console.log('Image deletion request sent');
  //   } catch (error) {
  //     console.error('Error deleting image:', error);
  //   }
  // };


  const handleImageRemove = async (imageNameToRemove) => {

    if (imageNameToRemove instanceof File) {
      const fileName = imageNameToRemove.name;
      console.log('Filename from File object:', fileName);

      // Proceed with the removal logic
      const newFileIndex = newFiles.findIndex(file => file.name === fileName);
      if (newFileIndex !== -1) {
        const updatedNewFiles = [...newFiles];
        updatedNewFiles.splice(newFileIndex, 1);
        setNewFiles(updatedNewFiles);

        const updatedNewCaptions = [...newCaptions];
        updatedNewCaptions.splice(newFileIndex, 1);
        setNewCaptions(updatedNewCaptions);
      } else {
        console.error('Image not found in newFiles');
        return;
      }
    } else {
      // Assuming imageNameToRemove is a string
      console.log('Filename from string:', imageNameToRemove);

      // Find and remove image from files
      const fileIndex = files.findIndex(file => file === imageNameToRemove);
      if (fileIndex !== -1) {
        const updatedFiles = [...files];
        updatedFiles.splice(fileIndex, 1);
        setFiles(updatedFiles);

        const updatedCaptions = [...captions];
        updatedCaptions.splice(fileIndex, 1);
        setCaptions(updatedCaptions);

        setFormData(prevFormData => ({
          ...prevFormData,
          filenames: updatedFiles.join('~'),
          Image_Name: updatedFiles.join('~'),
        }));
      } else {
        console.error('Image not found in files');
        return;
      }
    }

    try {
      const folderName = formData.xml_name;

      await axios.post(`${process.env.REACT_APP_IPCONFIG}api/deleteImageName`, null, {
        params: {
          xml_name: folderName,
          imagename: imageNameToRemove instanceof File ? imageNameToRemove.name : imageNameToRemove,
        },
      });

      console.log('Image deletion request sent');
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };





  const handleImagePreview = useCallback((index) => {
    const fileUrl = `https://reporters.hindutamil.in/ImageSrc/${formData.imagePath}/${files[index]}`
    window.open(fileUrl, '_blank');
  }, [files]);


  const handleNewImagePreview = (file) => {
    const imageUrl = URL.createObjectURL(file);
    window.open(imageUrl, '_blank');
  };

  const handleClearAll = () => {
    setFiles([]);
    setCaptions([]);
    setNewFiles([]);
    setNewCaptions([]);
  };


  //--------------  update article   ---------------  


  const uploadImagesAndInsertArticle = useCallback(async (updatedFormData) => {
    setLoading(true);

    const imageFormData = new FormData();

    // if (newFiles.length > 0) {
    //   console.log('New image condition meets');
    //   newFiles.forEach((file, index) => {
    //     const sequenceNumber = 101 + index; 
    //     const uniqueName = `up${sequenceNumber}.${file.name.split('.').pop()}`;
    //     imageFormData.append('images', file, uniqueName);
    //   });
    // }

    if (newFiles.length > 0) {
      console.log('New image condition meets');

      newFiles.forEach((file, index) => {
        const timestamp = `${Date.now()}_${performance.now().toFixed(3)}`;

        // Generate a unique name using the timestamp and index
        const uniqueName = `${timestamp}_up${index}.${file.name.split('.').pop()}`;

        // Append the file to the FormData with the unique name
        imageFormData.append('images', file, uniqueName);
      });
    }


    // Add xml_name to form data
    if (updatedFormData.xml_name) {
      imageFormData.append('xml_name', updatedFormData.xml_name);
      console.log(updatedFormData.xml_name);
    }


    const xmlName = updatedFormData.xml_name;
    console.log(xmlName);

    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/updateImages`, imageFormData, {
        params: {
          xml_name: xmlName
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Files uploaded successfully', response.data);
    } catch (error) {
      console.error('Error uploading files', error);
    }




    let imageNames = {};
    try {
      const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getupdateImageName`, {
        params: {
          xml_name: updatedFormData.xml_name
        }
      });

      imageNames = response.data;
    } catch (error) {
      console.error('Error fetching image names', error);
    }


    const filenames = imageNames.filenames ? imageNames.filenames : '';
    const path = imageNames.path ? imageNames.path : '';

    const finalCaption = combinedCaptions.join('/n');
    console.log("finalCaption value for update:", finalCaption);

    const articleData = {
      ...updatedFormData,
      finalCaption,
      filenames,
      path,
    };
    console.log("articleData:", articleData);

    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/updateArticle`, articleData);
      console.log('Article inserted successfully', response.data);
    } catch (error) {
      console.error('Error inserting article', error);
      setLoading(false);
      return;
    } finally {
      setLoading(false);
      setAlertMessage('Article updated successfully!');
      setShowAlert(true);

    }

  }, [newFiles, captions, newCaptions, files]);


  // const uploadImagesAndInsertArticle = async (updatedFormData) => {
  //   setLoading(true);

  //   const imageFormData = new FormData();

  //   if (newFiles.length > 0) {
  //     console.log('New image condition meets');

  //     newFiles.forEach((file) => {
  //       const timestamp = `${Date.now()}_${performance.now().toFixed(3)}`; 

  //       // Generate a unique name using the timestamp
  //       const uniqueName = `up${timestamp}.${file.name.split('.').pop()}`;

  //       // Append the file to the FormData with the unique name
  //       imageFormData.append('images', file, uniqueName);
  //     });
  //   }


  //   // Add xml_name to form data
  //   if (updatedFormData.xml_name) {
  //     imageFormData.append('xml_name', updatedFormData.xml_name);
  //     console.log(updatedFormData.xml_name);
  //   }

  //   const xmlName = updatedFormData.xml_name;
  //   console.log(xmlName);

  //   try {
  //     const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/updateImages`, imageFormData, {
  //       params: {
  //         xml_name: xmlName
  //       },
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });

  //     console.log('Files uploaded successfully', response.data);
  //   } catch (error) {
  //     console.error('Error uploading files', error);
  //   }

  //   let imageNames = {};
  //   try {
  //     const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getupdateImageName`, {
  //       params: {
  //         xml_name: updatedFormData.xml_name
  //       }
  //     });

  //     imageNames = response.data;
  //   } catch (error) {
  //     console.error('Error fetching image names', error);
  //   }

  //   const filenames = imageNames.filenames ? imageNames.filenames : '';
  //   const path = imageNames.path ? imageNames.path : '';

  //   const finalCaption = combinedCaptions.join('/n');
  //   console.log("finalCaption value for update:", finalCaption);

  //   const articleData = {
  //     ...updatedFormData,
  //     finalCaption,
  //     filenames,
  //     path,
  //   };
  //   console.log("articleData:", articleData);

  //   try {
  //     const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/updateArticle`, articleData);
  //     console.log('Article inserted successfully', response.data);
  //   } catch (error) {
  //     console.error('Error inserting article', error);
  //     setLoading(false);
  //     return;
  //   } finally {
  //     setLoading(false);
  //     setAlertMessage('Article updated successfully!');
  //     setShowAlert(true);
  //   }
  // };


  const validateForm = () => {
    const { product, zone, layout, Assigned_USER, Head, paragraph } = formData;
    const emptyFields = [];

    if (!product) {
      emptyFields.push("Product");
    }
    if (!zone) {
      emptyFields.push("Zone");
    }
    if (!layout) {
      emptyFields.push("Layout Desk");
    }
    if (!Assigned_USER || Assigned_USER == "Story To") 
    {
      emptyFields.push("Story To");
    }
    if (!Head) {
      emptyFields.push("Head");
    }
    if (!paragraph) {
      emptyFields.push("Paragraph");
    }
    if (emptyFields.length > 0) {
      alert(`Please fill in all mandatory fields: ${emptyFields.join(', ')}.`);
      return false;
    }

    return true;
  };

  const handleSave = () => {

    const updatedFormData = {
      ...formData,
      xml_parent_action: 'Updated',
      Processed_user: emp_code,
      article_status: 0,
    };
    setSaveFlag(true)
    setFormData(updatedFormData);
    uploadImagesAndInsertArticle(updatedFormData);

  };

  const handleSubmit = () => {

    if (validateForm()) {
      setSaveFlag(false);
      if (role == 'RPT') {
        const updatedFormData = {
          ...formData,
          xml_parent_action: 'Updated',
          Status: 'T',
          ArticleCreatedUser: emp_code,
          Report_User: emp_code,
          Assigned_USER: formData.Assigned_USER,
          Created_user: emp_code,
          Report_User_time: getCurrentTime(),
          Processed_user: emp_code,
          article_status: 0,
        };

        setFormData(updatedFormData);
        console.log("submit function calling");
        uploadImagesAndInsertArticle(updatedFormData);
      }
      else if (role == 'CHRPT') {
        const updatedFormData = {
          ...formData,
          xml_parent_action: 'Updated',
          Status: 'T',
          ArticleCreatedUser: emp_code,
          Chief_Report_User: emp_code,
          Assigned_USER: formData.Assigned_USER,
          Chief_Report_User_time: getCurrentTime(),
          Processed_user: emp_code,
          article_status: 0,
        };

        setFormData(updatedFormData);
        console.log("submit function calling");
        uploadImagesAndInsertArticle(updatedFormData);
      }


    }
  };


  const handleApprove = () => {
    setSaveFlag(false);
    if (validateForm()) {
      const updatedFormData = {
        ...formData,
        xml_parent_action: 'Updated',
        Status: 'P',
        Chief_Report_User: emp_code,
        Assigned_USER: formData.Assigned_USER,
        Chief_Report_User_time: getCurrentTime(),
        Processed_user: emp_code,
        article_status: 0,
      };

      setFormData(updatedFormData);
      console.log("Approve function calling");
      uploadImagesAndInsertArticle(updatedFormData);
    }
  }


  const handleAssigned = () => {
    setSaveFlag(false);
    if (validateForm()) {
      const updatedFormData = {
        ...formData,
        xml_parent_action: 'Updated',
        Status: 'S',
        SP_Editor: emp_code,
        Assigned_USER: formData.Assigned_USER,
        SP_Editor_time: getCurrentTime(),
        Assign_time: getCurrentTime(),
        Processed_user: emp_code,
        article_status: 0,
      };

      setFormData(updatedFormData);
      console.log("Assign function calling");
      uploadImagesAndInsertArticle(updatedFormData);
    }
  }


  const handlePrDone = () => {

    if (validateForm()) {
      const updatedFormData = {
        ...formData,
        xml_parent_action: 'Updated',
        Status: 'D',
        SP_Sub_Editor: emp_code,
        SP_Editor_time: getCurrentTime(),
        Processed_user: emp_code,
        article_status: 0,
      };

      setFormData(updatedFormData);
      console.log("Predone function calling");
      uploadImagesAndInsertArticle(updatedFormData);
    }
  }


  const handleFinalize = () => {

    // const updatedParagraph = formData.paragraph.replace(/\n\n/g, '\n');
    setSaveFlag(false);
    formData.Assigned_USER = 'Completed';
    if (validateForm()) {

      if (role == 'SPEDT') {
        const updatedFormData = {
          ...formData,
          xml_parent_action: 'Updated',
          Status: 'A',
          Assigned_USER: formData.Assigned_USER,
          SP_Editor: emp_code,
          SP_Editor_time: getCurrentTime(),
          // paragraph: updatedParagraph,
        };

        setFormData(updatedFormData);
        console.log("Finalize function calling");
        uploadImagesAndInsertArticle(updatedFormData);
      }
      else if (role == 'SPSUBEDT') {
        const updatedFormData = {
          ...formData,
          xml_parent_action: 'Updated',
          Status: 'A',
          SP_Sub_Editor: emp_code,
          Assigned_USER: formData.Assigned_USER,
          SP_Sub_Editor_time: getCurrentTime(),
          // paragraph: updatedParagraph,

        };

        setFormData(updatedFormData);
        console.log("Finalize function calling");
        uploadImagesAndInsertArticle(updatedFormData);
      }
      else if (role == 'EDT') {
        const updatedFormData = {
          ...formData,
          xml_parent_action: 'Updated',
          Status: 'A',
          Assigned_USER: formData.Assigned_USER,
          Editorial_User: emp_code,
          Editorial_User_time: getCurrentTime(),
          // paragraph: updatedParagraph,

        };

        setFormData(updatedFormData);
        console.log("Finalize function calling");
        uploadImagesAndInsertArticle(updatedFormData);
      }
      else if (role == 'SUP') {
        const updatedFormData = {
          ...formData,
          xml_parent_action: 'Updated',
          Status: 'A',
          Assigned_USER: formData.Assigned_USER,
          SP_Editor: emp_code,
          SP_Editor_time: getCurrentTime(),
          // paragraph: updatedParagraph,
        };

        setFormData(updatedFormData);
        console.log("Finalize function calling");
        uploadImagesAndInsertArticle(updatedFormData);
      }

    }


  }


  const handleClose = async () => {

    try {

      if (view == 'Non_view') {
        await axios.post(`${process.env.REACT_APP_IPCONFIG}api/reporter/processedUser`, {
          xml_name: articleId,
          IssueDate: issuedate,
          Processed_user: emp_code,
          article_status: 0,
        });
        console.log("updated succesfully")
      }

      console.log("Close");
      navigate('/article-view')

    } catch (error) {

    }

  }


  const handleReject = async () => {
    const updatedParagraph = formData.paragraph.replace(/\n\n/g, '\n');
    try {
      const updatedFormData = {
        ...formData,
        xml_parent_action: 'Updated',
        Status: 'R',
        Processed_user: emp_code,
        Assigned_USER: emp_code,
        article_status: 0,
        paragraph: updatedParagraph,
      };

      setFormData(updatedFormData);
      console.log("Finalize function calling");
      uploadImagesAndInsertArticle(updatedFormData);
    } catch (error) {

    }
  }



  // const renderButtons = () => {
  //   const buttonClasses = "btn-logout";

  //   switch (role) {
  //     case 'RPT':
  //       return (
  //         <Row className="justify-content-between">
  //           {/* <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button className={buttonClasses} onClick={handleSave}>
  //               Save
  //             </Button>
  //           </Col> */}
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button className={buttonClasses} onClick={handleSubmit}>
  //               Submit
  //             </Button>
  //           </Col>
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button className={buttonClasses} onClick={handleClose}>
  //               Close
  //             </Button>
  //           </Col>
  //         </Row>
  //       );

  //     case 'CHRPT':
  //       return (
  //         <Row className="justify-content-between">
  //           {/* <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button className={buttonClasses} onClick={handleSave}>
  //               Save
  //             </Button>
  //           </Col> */}
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button className={buttonClasses} onClick={handleSubmit}>
  //               Submit
  //             </Button>
  //           </Col>
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button className={buttonClasses} onClick={handleApprove}>
  //               Approve
  //             </Button>
  //           </Col>
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button className={buttonClasses} onClick={handleClose}>
  //               Close
  //             </Button>
  //           </Col>
  //         </Row>
  //       );

  //     case 'SUBEDT':
  //       return (
  //         <Row className="justify-content-between">
  //           {/* <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button className={buttonClasses} onClick={handleSave}>
  //               Save
  //             </Button>
  //           </Col> */}
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button className={buttonClasses} onClick={handleFinalize}>
  //               Finalize
  //             </Button>
  //           </Col>
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button className={buttonClasses} onClick={handleClose}>
  //               Close
  //             </Button>
  //           </Col>
  //         </Row>
  //       );

  //     case 'EDT':
  //       return (
  //         <Row className="justify-content-between">
  //           {/* <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button variant="info" className={buttonClasses} onClick={handleSave}>
  //               Save
  //             </Button>
  //           </Col> */}
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button className={buttonClasses} onClick={handleApprove}>
  //               Approve
  //             </Button>
  //           </Col>
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button variant="success" className={buttonClasses} onClick={handleFinalize}>
  //               Finalize
  //             </Button>
  //           </Col>
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button variant="success" className={buttonClasses} onClick={handleClose}>
  //               Close
  //             </Button>
  //           </Col>
  //         </Row>
  //       );

  //     case 'SPSUBEDT':
  //       return (
  //         <Row className="justify-content-between">
  //           {/* <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button variant="info" className={buttonClasses} onClick={handleSave}>
  //               Save
  //             </Button>
  //           </Col> */}
  //           {/* <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button variant="warning" className={buttonClasses} onClick={handlePrDone}>
  //               Pr Done
  //             </Button>
  //           </Col> */}
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button variant="warning" className={buttonClasses} onClick={handleFinalize}>
  //               Finalize
  //             </Button>
  //           </Col>

  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button variant="success" className={buttonClasses} onClick={handleClose}>
  //               Close
  //             </Button>
  //           </Col>
  //         </Row>
  //       );

  //     case 'SPEDT':
  //       return (
  //         <Row className="justify-content-between">
  //           {/* <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button variant="info" className={buttonClasses} onClick={handleSave}>
  //               Save
  //             </Button>
  //           </Col> */}
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button variant="secondary" className={buttonClasses} onClick={handleAssigned}>
  //               Assigned
  //             </Button>
  //           </Col>
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button variant="warning" className={buttonClasses} onClick={handleFinalize}>
  //               Finalize
  //             </Button>
  //           </Col>
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button variant="success" className={buttonClasses} onClick={handleClose}>
  //               Close
  //             </Button>
  //           </Col>
  //         </Row>
  //       );


  //     case 'SUP':
  //       return (
  //         <Row className="justify-content-between">
  //           {/* <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button variant="info" className={buttonClasses} onClick={handleSave}>
  //               Save
  //             </Button>
  //           </Col> */}
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button variant="success" className={buttonClasses} onClick={handleSubmit}>
  //               Submit
  //             </Button>
  //           </Col>
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button className={buttonClasses} onClick={handleApprove}>
  //               Approve
  //             </Button>
  //           </Col>
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button variant="secondary" className={buttonClasses} onClick={handleAssigned}>
  //               Assigned
  //             </Button>
  //           </Col>
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button className={buttonClasses} onClick={handleFinalize}>
  //               Finalize
  //             </Button>
  //           </Col>
  //           <Col xs={12} sm={6} md={4} lg={3}>
  //             <Button className={buttonClasses} onClick={handleClose}>
  //               Close
  //             </Button>
  //           </Col>
  //         </Row>
  //       );


  //     default:
  //       return null;
  //   }
  // };


  const renderButtons = () => {

    switch (role) {
      case 'RPT':
        return (
          <Row className="justify-content-center">
            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonNew1" onClick={handleSubmit}>
                Submit
              </button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonclose1" onClick={handleClose}>
                <span class="text">Close</span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg></span>
              </button>
            </Col>
          </Row>
        );

      case 'CHRPT':
        return (
          <Row className="justify-content-center">

            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonNew1" onClick={handleSubmit}>
                SUBMIT
              </button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonNew1" onClick={handleApprove}>
                Approve
              </button>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonclose1" onClick={handleReject}>
                <span class="text"> Reject </span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg></span>
              </button>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonclose1" onClick={handleClose}>
                <span class="text">Close</span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg></span>
              </button>
            </Col>
          </Row>
        );

      case 'SUBEDT':
        return (
          <Row className="justify-content-center" >
            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonNew1" onClick={handleFinalize}>
                Finalize
              </button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonclose1" onClick={handleClose}>
                <span class="text">Close</span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg></span>
              </button>
            </Col>
          </Row>
        );

      case 'EDT':
        return (
          <Row className="justify-content-center">
            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonNew1" onClick={handleApprove}>
                Approve
              </button>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonNew1" onClick={handleFinalize}>
                Finalize
              </button>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonclose1" onClick={handleReject}>
                <span class="text"> Reject </span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg></span>
              </button>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonclose1" onClick={handleClose}>
                <span class="text">Close</span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg></span>
              </button>
            </Col>
          </Row>
        );

      case 'SPSUBEDT':
        return (
          <Row className="justify-content-center">

            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonNew1" onClick={handleFinalize}>
                Finalize
              </button>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonclose1" onClick={handleClose}>
                <span class="text">Close</span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg></span>
              </button>
            </Col>
          </Row>
        );

      case 'SPEDT':
        return (
          <Row className="justify-content-center">
            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonNew1" onClick={handleAssigned}>
                Assigned
              </button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonNew1" onClick={handleFinalize}>
                Finalize
              </button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonclose1" onClick={handleClose}>
                <span class="text">Close</span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg></span>
              </button>
            </Col>
          </Row>
        );


      case 'SUP':
        return (
          <Row className="justify-content-center">

            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonNew1" onClick={handleSubmit}>
                SUBMIT
              </button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonNew1" onClick={handleApprove}>
                Approve
              </button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonNew1" onClick={handleAssigned}>
                Assigned
              </button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonNew1" onClick={handleFinalize}>
                Finalize
              </button>
            </Col>


            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonclose1" onClick={handleReject}>
                <span class="text"> Reject </span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg></span>
              </button>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <button className="buttonclose1" onClick={handleClose}>
                <span class="text">Close</span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg></span>
              </button>
            </Col>
          </Row>
        );

      default:
        return null;
    }
  };


  return (
    <div className='main-content'>
      <fieldset className="f_fieldset">
        <legend>Select Details</legend>
        <Row className="mb-3">
          <Col xs={12} sm={6} md={2} className="mb-3">
            <Form.Select aria-label="Product select example" onChange={handleProductChange} value={formData.product} className="form-select-sm custom-select" disabled={view === 'view'}>
              <option>Select Product</option>
              {products.map((productName, index) => (
                <option key={index} value={productName}>
                  {productName}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} md={2} className="mb-3">
            <Form.Select aria-label="Zone select example" onChange={handleZoneChange} value={formData.zone} className="form-select-sm custom-select" disabled={view === 'view'}>
              <option>Zone</option>
              {zones.map((zoneName, index) => (
                <option key={index} value={zoneName}>
                  {zoneName}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} md={2} className="mb-3">
            <Form.Select aria-label="Layout desk select example" onChange={handleLayoutChange} value={formData.layout} className="form-select-sm custom-select" disabled={view === 'view'}>
              <option>No Layout selected</option>
              {layouts.map((layout, index) => (
                <option key={index} value={layout.desk_name}>
                  {layout.desk_name}
                </option>
              ))}
            </Form.Select>
          </Col>


          <Col xs={12} sm={6} md={2} className="mb-3">
            <Form.Select
              aria-label="Page Name select example"
              value={formData.pagename}
              onChange={(e) => setFormData(prevState => ({ ...prevState, pagename: e.target.value }))}
              className="form-select-sm custom-select"
              disabled={view === 'view'}
            >
              <option>Page Name</option>
              {pageNames.map((page, index) => (
                <option key={index} value={page}>
                  {page}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} md={2} className="mb-3">
            <Form.Select
              aria-label="Story To select example"
              value={formData.Assigned_USER}
              onChange={(e) => setFormData(prevState => ({ ...prevState, Assigned_USER: e.target.value }))}
              className="form-select-sm custom-select"
              disabled={view === 'view'}
            >
              <option>Story To</option>
              {assignUsers.map((user, index) => (
                <option key={index} value={user}>
                  {user}
                </option>
              ))}
            </Form.Select>
          </Col>

          {/* <Col xs={12} sm={6} md={2} className="mb-3">
            <Button className="custom-save-button" onClick={handleShowPopup}>
              Show Details
            </Button>
          </Col> */}

        </Row>

        <Row className="mb-3">


        </Row>

      </fieldset>


      <fieldset className="f_fieldset">

        <Modal show={showPopup} onHide={handleClosePopup} centered size="xl">
          <Modal.Header closeButton>

            <Button variant="danger" onClick={handleClosePopup}>
              Close
            </Button>
          </Modal.Header>
          <Modal.Body>
            <Table striped bordered hover responsive="md">
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Assigned To</th>
                  <th>Reporter</th>
                  <th>Ch.Reporter</th>
                  <th>SP Sub Editor</th>
                  <th>Editor</th>
                  <th>SP Editor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{getUserName(formData.Created_user)}</td>
                  <td>{getUserName(formData.Assigned_to)}</td>
                  <td>
                    <div>{getUserName(formData.Report_User)}</div>
                    <div className="Time">{formData.Report_User_time}</div>
                  </td>
                  <td>
                    <div>{getUserName(formData.Chief_Report_User)}</div>
                    <div className="Time">{formData.Chief_Report_User_time}</div>
                  </td>
                  <td>
                    <div>{getUserName(formData.SP_Sub_Editor)}</div>
                    <div className="Time">{formData.SP_Sub_Editor_time}</div>
                  </td>
                  <td>
                    <div>{getUserName(formData.Editorial_User)}</div>
                    <div className="Time">{formData.Editorial_User_time}</div>
                  </td>
                  <td>
                    <div>{getUserName(formData.SP_Editor)}</div>
                    <div className="Time">{formData.SP_Editor_time}</div>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Modal.Body>
        </Modal>

      </fieldset>

      <fieldset className="f_fieldset">

        <div className="d-flex justify-content-between align-items-center mb-2">
          <legend className="mb-0 flex-grow-1">Content Details</legend>
          <a
            onClick={handleShowPopup}
            className="ms-2 show-details-link"
          >
            Story Details
          </a>
        </div>



        {/* <FloatingLabel controlId="floatingInput" label="Story Name" className="mb-3">
          <Form.Control type="text" placeholder="Story Name" value={formData.Ref_story_name} onChange={(e) => setFormData(prevState => ({ ...prevState, Ref_story_name: e.target.value }))} />
        </FloatingLabel> */}

        {/* <FloatingLabel controlId="floatingPassword" label="Head kicker" className="mb-3">
          <Form.Control type="text" placeholder="Head kicker" style={{ fontWeight: 600 }} value={formData.HeadKicker} onChange={(e) => setFormData(prevState => ({ ...prevState, HeadKicker: e.target.value }))} disabled={view === 'view'} />
        </FloatingLabel> */}

        <FloatingLabel controlId="floatingHead" label=" Head kicker" className="mb-3">
          <Form.Control
            type="text"
            placeholder="Head kicker"
            value={formData.HeadKicker}
            style={{ fontWeight: 600 }}
            onChange={(e) => setFormData(prevState => ({ ...prevState, HeadKicker: e.target.value }))}
            disabled={view === 'view'}
          />
        </FloatingLabel>

        <FloatingLabel controlId="floatingHead" label="* Head" className="mb-3">
          <Form.Control
            as="textarea"
            placeholder="* Head"
            style={{ height: '105px', lineHeight: '1.3', fontFamily: "Mukta Malar", fontWeight: 700, fontSize: '24px' }}
            value={formData.Head}
            onChange={(e) => setFormData(prevState => ({ ...prevState, Head: e.target.value }))} disabled={view === 'view'}
          />
        </FloatingLabel>

        <FloatingLabel controlId="floatingHead" label=" Head deck" className="mb-3">
          <Form.Control
            type="text"
            placeholder="Head deck"
            style={{ fontWeight: 600 }}
            value={formData.HeadDesk}
            onChange={(e) => setFormData(prevState => ({ ...prevState, HeadDesk: e.target.value }))}
            disabled={view === 'view'}
          />
        </FloatingLabel>

        <Row className="mb-3">
          <Col md={6}>
            <FloatingLabel controlId="floatingPassword" label="Byline" className="mb-3">
              <Form.Control type="text" placeholder="Byline" style={{ fontWeight: 600 }} value={formData.Byline} onChange={(e) => setFormData(prevState => ({ ...prevState, Byline: e.target.value }))} disabled={view === 'view'} />
            </FloatingLabel>
          </Col>

          <Col md={6}>
            <FloatingLabel controlId="floatingPassword" label="Dateline" className="mb-3">
              <Form.Control type="text" placeholder="Dateline" style={{ fontWeight: 600 }} value={formData.Dateline} onChange={(e) => setFormData(prevState => ({ ...prevState, Dateline: e.target.value }))} disabled={view === 'view'} />
            </FloatingLabel>
          </Col>

        </Row>

        {/* <Form.Group controlId="floatingTextarea" label="Paragraph" className="mb-3">
          <Form.Label>Paragraph</Form.Label>
          <Form.Control
            as="textarea"
            placeholder="Write a content here"
            style={{ height: '300px', lineHeight: '1.8', fontFamily: "Mukta Malar", fontWeight: 600, fontSize: '20px' }}
            value={formData.paragraph}
            onChange={handleParagraphChange}
            onKeyDown={handleKeyDown}
            disabled={view === 'view'}
          />
        </Form.Group> */}


        <Form.Group controlId="floatingTextarea" className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Label>Paragraph</Form.Label>
            <Button
              variant="info"
              onClick={handleSave}
              className="custom-save-button"
            >
              Save
            </Button>
          </div>
          <Form.Control
            as="textarea"
            placeholder="Write content here"
            style={{
              height: '300px', lineHeight: '1.8', fontFamily: "Mukta Malar", fontWeight: 600, fontSize: '20px',
              whiteSpace: 'pre-wrap', textIndent: '2em'
            }}
            value={formData.paragraph}
            onChange={handleParagraphChange}
            // onKeyDown={handleKeyDown}
            disabled={view === 'view'}
          />

        </Form.Group>

       <div style={{display:'flex',flexDirection:'row',fontWeight:'bold'}} >
       <div className="mb-3">Word Count: {wordCount}</div>
        <div style={{marginLeft:'10%',color:'#015BAB',fontSize:'14px'}}>Note : உங்கள் படங்கள் watsapp, twitter போன்ற சமூக ஊடகங்களில் மூலம் வந்திருந்தால், அவற்றை இங்கு சரிசெய்யவும். <a href='/imageconverter' target='blank' className="ms-2 show-details-link">Click</a> </div>
       </div>
        

        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Choose Images</Form.Label>
          <Form.Control type="file" onChange={handleImageChange} accept="image/*" multiple disabled={view === 'view'} />
        </Form.Group>

        <div>

          {files.map((file, index) => (

            <div key={index} className="mb-3">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <Image src={`https://reporters.hindutamil.in/ImageSrc/${formData.imagePath}/${file}`} alt={`Image ${index + 1}`} style={{ width: '100px', height: 'auto', marginRight: '10px' }} />
                <Form.Control
                  type="text"
                  placeholder={`Enter caption for Image ${index + 1}`}
                  value={captions[index] || ''}
                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                  style={{ flex: '1' }}
                  disabled={view === 'view'}
                />
                <Button variant="danger" onClick={() => handleImageRemove(file)} style={{ marginLeft: '10px' }} disabled={view === 'view'}>
                  <BsTrash />
                </Button>
                <Button variant="primary" onClick={() => handleImagePreview(index)} style={{ marginLeft: '10px' }}>
                  <BsArrowsFullscreen />
                </Button>
              </div>
              <div>{file}</div>
            </div>
          ))}

          {newFiles.map((file, index) => (
            <div key={index} className="mb-3">
              <div className="d-flex align-items-center">
                <Image src={URL.createObjectURL(file)} thumbnail style={{ maxWidth: '150px' }} />
                <Form.Control
                  type="text"
                  placeholder="Enter caption"
                  value={newCaptions[index] || ''}
                  onChange={(e) => handleNewCaptionChange(index, e.target.value)}
                  className="ms-2"
                />
                <Button variant="danger" className="ms-2" onClick={() => handleImageRemove(file)} disabled={view === 'view'}>
                  <BsTrash disabled={view === 'view'} />
                </Button>
                <Button variant="secondary" className="ms-2" onClick={() => handleNewImagePreview(file)}>
                  <BsArrowsFullscreen />
                </Button>
              </div>
            </div>
          ))}

        </div>

        {/* {files.length > 0 && (
          <Button variant="secondary" onClick={handleClearAll} disabled={view === 'view'}>
            Clear All <BsBackspace />
          </Button>
        )} */}


      </fieldset>

      {loading &&
        <div className="message-box-overlay">
          <div className="Loading-box">
            <Lottie animationData={Loading} loop={true} className="School_animate" />
          </div>
        </div>
      }

      {showAlert && <CustomAlert message={alertMessage} onClose={closeAlert} />}

      {
        view == 'Non_view' ?
          <>
            {renderButtons()}
          </> :
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <div className='ViewMode'>View Only</div>
            <button className="buttonclose1" onClick={handleClose} style={{ marginTop: '20px' }}>
              <span class="text">Close</span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg"
                width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg></span>
            </button>
          </div>
      }


    </div>
  );
};

export default ArticleEditor;


