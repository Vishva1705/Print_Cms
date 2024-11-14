import React, { useState, useEffect, useCallback, } from 'react';
import axios from 'axios';
import { Container, Form, Row, Col, FloatingLabel, Button, Image } from 'react-bootstrap';
import { BsTrash, BsArrowsFullscreen, BsBackspace } from 'react-icons/bs';
import '../Styles/ArticleEditor.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Lottie from "lottie-react";
import Loading from '../Assest/Loading.json'




export default function ArticleNew() {

  const navigate = useNavigate();

  const emp_code = localStorage.getItem('emp_id')
  const emp_id = localStorage.getItem("emp_id");
  const emp_name = localStorage.getItem("emp_name");

  const getTomorrowDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const issueDate = getTomorrowDate ();
  const [xmlValue, setXmlValue] = useState('');

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

  const storedZone = localStorage.getItem("selectedZone") || "";
  const storedLayout = localStorage.getItem("selectedLayout") || "";
  const storedPagename = localStorage.getItem("storedPagename") || "";
  // const storedDate = localStorage.getItem("selectedDate") || getTodayDate();
  const storedProduct = localStorage.getItem("selectedProduct") || "Hindu Tamil Thisai";
  const storedAssignuser = localStorage.getItem("Assigned_USER") || "";

  const [role, setRole] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    console.log(userRole);
    setRole(userRole);
  }, []);

  const [paragraph, setParagraph] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const [formData, setFormData] = useState({
    product: storedProduct,
    layout: storedLayout,
    zone: storedZone,
    storyto: '',
    pagename: storedPagename,
    Storyname: '',
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
    Assigned_USER: storedAssignuser,
    Created_user: '',
    Created_user_time: '',
    Report_User_time: '',
    Chief_Report_User_time: '',
    Editorial_User_time: '',
    SP_Editor_time: '',
    Sub_Editor_time: '',
    SP_Sub_Editor_time: '',
    SP_Sub_Editor: '',
    SP_Editor: '',
    Processed_user: '',
    article_status: '',
  });


  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      const textarea = event.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Get the current value and split it at the cursor position
      const beforeCursor = paragraph.substring(0, start);
      const afterCursor = paragraph.substring(end);

      // Insert new lines at the cursor position
      const newText = `${beforeCursor}\n\n${afterCursor}`;

      // Update the state with the new text
      setParagraph(newText);

      // Adjust cursor position after the new lines
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  console.log("formData values :", formData);

  const [products, setProducts] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [zones, setZones] = useState([]);
  const [assignUsers, setAssignUsers] = useState([]);
  const [pageNames, setPageNames] = useState([]);
  const [files, setFiles] = useState([]);
  const [captions, setCaptions] = useState([]);


  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const [loading, setLoading] = useState(false);

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
    const view = 'Non_view';
    // navigate('/article-view');
    navigate(`/article-editor/${xmlValue}/${issueDate}`, {
      state: { view },
    });
  };



  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getproducts`);
      setProducts(response.data.map(product => product.Product_Name));
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchZones = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getzone`);
      setZones(response.data.map(zone => zone.Zone_Name));
    } catch (error) {
      console.error(error);
    }
  }, []);


  const fetchLayouts = useCallback(async (product) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/getlayouts`, { productName: product });
      setLayouts(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);


  const fetchPageNames = useCallback(async (desk) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/pagenumber`, { deskName: desk });
      setPageNames(response.data.map(page => page.page_id));
    } catch (error) {
      console.error(error);
    }
  }, []);


  const fetchAssignuser = useCallback(async (zone) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/assignuser`, { zoneName: zone });
      setAssignUsers(response.data.map(user => user.User_name));
      console.log(response.data.map(user => user.User_name));
    } catch (error) {
      console.error(error);
    }
  }, []);






  useEffect(() => {
    fetchProducts();
    fetchZones();
    if (storedProduct) {
      fetchLayouts(storedProduct);
    }
    if (storedLayout) {
      fetchPageNames(storedLayout)
    }
    if (storedZone) {
      fetchAssignuser(storedZone)
    }
  }, [fetchProducts, fetchZones, fetchLayouts, storedProduct, storedLayout, storedZone]);


  const handleParagraphChange = useCallback((e) => {
    const text = e.target.value;
    setParagraph(text);
    setWordCount(text.trim().split(/\s+/).length);
    setFormData(prevState => ({ ...prevState, paragraph: text }));
  }, []);


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


  const handlePageNameChange = (e) => {
    const newValue = e.target.value;
    setFormData(prevState => ({ ...prevState, pagename: newValue }));
    localStorage.setItem('storedPagename', newValue);
  };


  const handleAssignedUserChange = (e) => {
    const newValue = e.target.value;
    setFormData(prevState => ({ ...prevState, Assigned_USER: newValue }));
    localStorage.setItem('Assigned_USER', newValue);
  };



  const handleImageChange = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    setCaptions(prevCaptions => [...prevCaptions, ...Array(selectedFiles.length).fill('')]);
  }, []);


  const handleCaptionChange = useCallback((index, caption) => {
    setCaptions(prevCaptions => {
      const newCaptions = [...prevCaptions];
      newCaptions[index] = caption;
      return newCaptions;
    });
  }, []);

  const handleImageRemove = useCallback((index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setCaptions(prevCaptions => prevCaptions.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setCaptions([]);
  }, []);

  const handleImagePreview = useCallback((index) => {
    const fileUrl = URL.createObjectURL(files[index]);
    window.open(fileUrl, '_blank');
  }, [files]);


  const validateForm = () => {
    const { product, zone, layout, pagename, Head, paragraph, Assigned_USER } = formData;
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
    if (!pagename) {
      emptyFields.push("Page Name");
    }
    if (!Assigned_USER) {
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


  //-------update Article and images-----

  const uploadImagesAndInsertArticle = useCallback(async (updatedFormData) => {
    setLoading(true);

    if (files.length > 0) {
      const imageFormData = new FormData();
      files.forEach((file, index) => {
        imageFormData.append('images', file, `${index}.${file.name.substr(file.name.lastIndexOf('.') + 1)}`);
      });

      try {
        const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/uploadImages`, imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Files uploaded successfully', response.data);
      } catch (error) {
        console.error('Error uploading files', error);
        setLoading(false); // Set loading state to false in case of error
        return;
      }
    }


    let imageNames = {};
    try {
      const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getImageName`);
      imageNames = response.data;
      console.log("imagename:", imageNames);
    } catch (error) {
      console.error('Error fetching image names', error);
      setLoading(false); // Set loading state to false in case of error
      return;
    }

    // Extract filenames and path from imageNames
    const filenames = imageNames.filenames ? imageNames.filenames : '';
    const path = imageNames.path ? imageNames.path : '';

    // Join captions with the /n symbol
    const finalCaption = captions.join('/n');
    console.log("finalCaption value:", finalCaption);

    // Update formData with the new values
    updatedFormData = {
      ...updatedFormData,
      filenames,
      path,
      finalCaption
    };

    // Create the articleData object
    const articleData = {
      ...updatedFormData,
    };

    console.log("articleData:", articleData);

    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/insertArticle`, articleData);
      console.log('Article inserted successfully', response.data);
      // Assuming the XML value is returned in the response, you can store it in a global state
      if (response.data.xmlValue) {
        setXmlValue(response.data.xmlValue); // Store the XML value globally
        console.log('Stored XML Value:', xmlValue);
      }
    } catch (error) {
      console.error('Error inserting article', error);
    } finally {
      setLoading(false);
      setAlertMessage('Article added successfully!');
      setShowAlert(true);
    }

  }, [files, captions]);

  const handleSave = () => {
    
      const updatedFormData = {
        ...formData,
        xml_parent_action: 'Created',
        Status: 'F',
        ArticleCreatedUser: formData.Assigned_USER,
        Created_user: emp_code,
        Created_user_time: getCurrentTime(),
        Processed_user: emp_code,
        article_status: 0,
      };

      setFormData(updatedFormData);
      console.log("save function calling");
      uploadImagesAndInsertArticle(updatedFormData);
    


  };

  const handleSubmit = () => {
    if (validateForm()) {

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
          Created_user: emp_code,
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
    if (validateForm()) {
      const updatedFormData = {
        ...formData,
        xml_parent_action: 'Updated',
        Status: 'P',
        Chief_Report_User: emp_code,
        Assigned_USER: formData.Assigned_USER,
        Chief_Report_User_time: getCurrentTime(),
        Created_user: emp_code,
        Processed_user: emp_code,
        article_status: 0,
      };

      setFormData(updatedFormData);
      console.log("Approve function calling");
      uploadImagesAndInsertArticle(updatedFormData);
    }
  }



  const handleAssigned = () => {
    if (validateForm()) {
      const updatedFormData = {
        ...formData,
        ...formData,
        xml_parent_action: 'Updated',
        Status: 'S',
        SP_Editor: emp_code,
        Assigned_USER: formData.Assigned_USER,
        SP_Editor_time: getCurrentTime(),
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
        ArticleCreatedUser: emp_code,
        Report_User: emp_code,
        Chief_Report_User: emp_code,
        Editorial_User: emp_code,
        Assigned_USER: formData.Assigned_USER,
        Created_user: emp_code,
        Processed_user: emp_code,
        article_status: 0,
      };

      setFormData(updatedFormData);
      console.log("Predone function calling");
      uploadImagesAndInsertArticle(updatedFormData);
    }
  }


  
  const handleFinalize = () => {
    formData.Assigned_USER = 'Completed';
    const updatedParagraph = formData.paragraph.replace(/\n\n/g, '\n');

    if (validateForm()) {

      if (role == 'SPEDT') {
        const updatedFormData = {
          ...formData,
          xml_parent_action: 'Updated',
          Status: 'A',
          Assigned_USER: formData.Assigned_USER,
          SP_Editor: emp_code,
          Sub_Editor_time: getCurrentTime(),
          Created_user: emp_code,
          paragraph: updatedParagraph,
          Processed_user: emp_code,
          article_status: 0,
        };

        setFormData(updatedFormData);
        console.log("Finalize function calling");
        uploadImagesAndInsertArticle(updatedFormData);
      }
      else if (role == 'SPSUBEDT') {
        console.log('SPSUBEDT meets')
        const updatedFormData = {
          ...formData,
          xml_parent_action: 'Updated',
          Status: 'A',
          Assigned_USER: formData.Assigned_USER,
          SP_Sub_Editor: emp_code,
          SP_Sub_Editor_time: getCurrentTime(),
          Created_user: emp_code,
          paragraph: updatedParagraph,
          Processed_user: emp_code,
          article_status: 0,
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
          Created_user: emp_code,
          paragraph: updatedParagraph,
          Processed_user: emp_code,
          article_status: 0,
        };

        setFormData(updatedFormData);
        console.log("Finalize function calling");
        uploadImagesAndInsertArticle(updatedFormData);
      }


    }


  }



  const handleClose = () => {
    console.log("Close");
    navigate('/article-view')
  }

  const renderButtons = () => {

    switch (role) {
      case 'RPT':
        return (
          <Row className="justify-content-center">
            <Col xs={12} sm={6} md={4} lg={3}>
              <button  className="buttonNew1" onClick={handleSubmit}>
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
              <button className="buttonclose1" onClick={handleClose}>
              <span class="text">Close</span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg"
               width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg></span>
              </button>
            </Col>
          </Row>
        );

      case 'SUBEDT':
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
              <button  className="buttonNew1" onClick={handleFinalize}>
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
              <button  className="buttonNew1" onClick={handleAssigned}>
                Assigned
              </button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <button  className="buttonNew1" onClick={handleFinalize}>
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
              <button  className="buttonNew1" onClick={handleAssigned}>
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

      default:
        return null;
    }
  };


  return (
    <div className='main-content'>

      <fieldset className="f_fieldset">
  <legend>Select Details</legend>
  <Row className="mb-3">
    <Col xs={6} sm={6} md={2} className="mb-3"> {/* Adjusted for mobile */}
      <Form.Select
        aria-label="Product select example"
        onChange={handleProductChange}
        value={formData.product}
        className="form-select-sm custom-select"
      >
        <option>Select Product</option>
        {products.map((productName, index) => (
          <option key={index} value={productName}>
            {productName}
          </option>
        ))}
      </Form.Select>
    </Col>

    <Col xs={6} sm={6} md={2} className="mb-3"> {/* Adjusted for mobile */}
      <Form.Select
        aria-label="Zone select example"
        onChange={handleZoneChange}
        value={formData.zone}
        className="form-select-sm custom-select"
      >
        <option>Zone</option>
        {zones.map((zoneName, index) => (
          <option key={index} value={zoneName}>
            {zoneName}
          </option>
        ))}
      </Form.Select>
    </Col>

    <Col xs={6} sm={6} md={2} className="mb-3"> {/* Adjusted for mobile */}
      <Form.Select
        aria-label="Layout desk select example"
        onChange={handleLayoutChange}
        value={formData.layout}
        className="form-select-sm custom-select"
      >
        <option>Select desk</option>
        {layouts.map((layout, index) => (
          <option key={index} value={layout.desk_name}>
            {layout.desk_name}
          </option>
        ))}
      </Form.Select>
    </Col>

    <Col xs={6} sm={6} md={2} className="mb-3"> {/* Adjusted for mobile */}
      <Form.Select
        aria-label="Page Name select example"
        value={formData.pagename}
        onChange={handlePageNameChange}
        className="form-select-sm custom-select"
      >
        <option>Page Name</option>
        {pageNames.map((page, index) => (
          <option key={index} value={page}>
            {page}
          </option>
        ))}
      </Form.Select>
    </Col>

    <Col xs={6} sm={6} md={2} className="mb-3"> {/* Adjusted for mobile */}
      <Form.Select
        aria-label="Story To select example"
        value={formData.Assigned_USER}
        onChange={handleAssignedUserChange}
        className="form-select-sm custom-select"
      >
        <option>Story To</option>
        {assignUsers.map((user, index) => (
          <option key={index} value={user}>
            {user}
          </option>
        ))}
      </Form.Select>
    </Col>
  </Row>
</fieldset>


      <fieldset className="f_fieldset">
        <legend>Content Details</legend>
        {/* <FloatingLabel controlId="floatingInput" label="Story Name" className="mb-3">
          <Form.Control type="text" placeholder="Story Name" onChange={(e) => setFormData(prevState => ({ ...prevState, Ref_story_name: e.target.value }))} />
        </FloatingLabel> */}

        {/* <FloatingLabel controlId="floatingPassword" label="Head kicker" className="mb-3">
          <Form.Control type="text" placeholder="Head kicker" style={{ fontWeight: 600 }} onChange={(e) => setFormData(prevState => ({ ...prevState, HeadKicker: e.target.value }))} />
        </FloatingLabel> */}


        <FloatingLabel controlId="floatingHead" label=" Head kicker" className="mb-3">
          <Form.Control
            type="text"
            placeholder="Head kicker"
            style={{ fontWeight: 600 }}
            onChange={(e) => setFormData(prevState => ({ ...prevState, HeadKicker: e.target.value }))}
          />
        </FloatingLabel>

        <FloatingLabel controlId="floatingHead" label="* Head" className="mb-3">
          <Form.Control
            as="textarea"
            placeholder="* Head"
            style={{ height: '80px', lineHeight: '1.3', fontFamily: "Mukta Malar", fontWeight: 700, fontSize: '24px' }}
            onChange={(e) => setFormData(prevState => ({ ...prevState, Head: e.target.value }))}
          />
        </FloatingLabel>

        {/* <FloatingLabel controlId="floatingPassword" label="Head deck" className="mb-3">
          <Form.Control type="text" placeholder="Head deck" style={{ fontWeight: 600 }} onChange={(e) => setFormData(prevState => ({ ...prevState, HeadDesk: e.target.value }))} />
        </FloatingLabel> */}


        <FloatingLabel controlId="floatingHead" label=" Head deck" className="mb-3">
          <Form.Control
            type="text"
            placeholder="Head deck"
            style={{ fontWeight: 600 }}
            onChange={(e) => setFormData(prevState => ({ ...prevState, HeadDesk: e.target.value }))}
          />
        </FloatingLabel>

        <Row className="mb-3">
          <Col md={6}>
            <FloatingLabel controlId="floatingByline" label="Byline" className="mb-3">
              <Form.Control type="text" placeholder="Byline" style={{ fontWeight: 600 }} onChange={(e) => setFormData(prevState => ({ ...prevState, Byline: e.target.value }))} />
            </FloatingLabel>
          </Col>

          <Col md={6}>
            <FloatingLabel controlId="floatingDateline" label="Dateline" className="mb-3">
              <Form.Control type="text" placeholder="Dateline" style={{ fontWeight: 600 }} onChange={(e) => setFormData(prevState => ({ ...prevState, Dateline: e.target.value }))} />
            </FloatingLabel>
          </Col>
        </Row>

        <Form.Group controlId="floatingTextarea" label="Paragraph" className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Label className="mb-0">
              *Paragraph
            </Form.Label>
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
              height: '300px', lineHeight: '1.5', fontFamily: "Mukta Malar", fontWeight: 600, fontSize: '20px',
              whiteSpace:'pre-wrap',textIndent:'2em'
            }}
            value={paragraph}
            onChange={handleParagraphChange}
            // onKeyDown={handleKeyDown}
          />
        </Form.Group>

        <div className="mb-3">Word Count: {wordCount}</div>

        <div className='ViewMode' style={{color:'red'}}>Note*: Save the article first. On the next screen you can upload the images for this story.</div>

        {/* <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Choose Images</Form.Label>
          <Form.Control
            type="file"
            onChange={handleImageChange}
            accept=".png,.jpg,.jpeg"
            multiple
          />
        </Form.Group> */}

        {/* <div>
          {files.map((file, index) => (
            <div key={index} className="mb-3">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <Image src={URL.createObjectURL(file)} alt={`Image ${index + 1}`} style={{ width: '100px', height: 'auto', marginRight: '10px' }} />
                <Form.Control
                  type="text"
                  placeholder={`Enter caption for Image ${index + 1}`}
                  value={captions[index]}
                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                  style={{ flex: '1' }}
                />
                <Button variant="danger" onClick={() => handleImageRemove(index)} style={{ marginLeft: '10px' }}>
                  <BsTrash />
                </Button>
                <Button variant="primary" onClick={() => handleImagePreview(index)} style={{ marginLeft: '10px' }}>
                  <BsArrowsFullscreen />
                </Button>
              </div>
              <div>{file.name}</div>
            </div>
          ))}
        </div> */}

        {/* {files.length > 0 && (
          <Button variant="secondary" onClick={handleClearAll}>
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

      {/* <>
        {renderButtons()}
      </> */}



    </div>
  );
}


