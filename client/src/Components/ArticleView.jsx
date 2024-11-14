import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Form,
  Row,
  Col,
  Button,
  Table,
  Collapse,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../Styles/ArticleEditor.css";
import { FaRegImage } from "react-icons/fa";

export default function ArticleView() {
  const navigate = useNavigate();

  const emp_id = localStorage.getItem("emp_id");
  const emp_name = localStorage.getItem("emp_name");

  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  useEffect(() => {
    if (emp_id) {
      getDetail();
    } else {
      navigate("/");
    }
  }, [emp_id, navigate]);

  const getTodayDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const storedZone = localStorage.getItem("selectedZone") || "";
  const storedLayout = localStorage.getItem("selectedLayout") || "";
  const storedDate = getTodayDate() || localStorage.getItem("selectedDate");
  const storedProduct =
    localStorage.getItem("selectedProduct") || "Hindu Tamil Thisai";
  const storedStatus = localStorage.getItem("selectedStatus") || "";

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

  const [formData, setFormData] = useState({
    product: storedProduct,
    layout: storedLayout,
    zone: storedZone,
    pagename: "",
    selectedDate: storedDate,
    status: storedStatus,
  });

  const validateForm = () => {
    const { product, zone, layout } = formData;
    const emptyFields = [];

    if (!product) {
      emptyFields.push("Product");
    }
    if (!zone || zone == "No Zone selected") {
      emptyFields.push("Zone");
    }
    if (!layout || layout == "No Layout selected") {
      emptyFields.push("Layout Desk");
    }

    if (emptyFields.length > 0) {
      alert(`Please fill in all mandatory fields: ${emptyFields.join(", ")}.`);
      return false;
    }

    return true;
  };

  const [products, setProducts] = useState([]);
  const [layouts, setLayouts] = useState(storedLayout ? [storedLayout] : []);
  const [zones, setZones] = useState(storedZone ? [storedZone] : []);
  const [assignUsers, setAssignUsers] = useState([]);
  const [pageNames, setPageNames] = useState([]);
  const [news, setNews] = useState([]);

  const [filteredNews, setFilteredNews] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [showAssignedOnly, setShowAssignedOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  const [search, setsearch] = useState("");

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IPCONFIG}api/getproducts`
        );
        setProducts(response.data.map((product) => product.Product_Name));
      } catch (error) {
        console.error(error);
      }
    };

    const fetchZones = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IPCONFIG}api/getzone`
        );
        setZones(response.data.map((zone) => zone.Zone_Name));
        // console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
    fetchZones();
    fetchAssignuserValues();
  }, []);

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

  useEffect(() => {
    const fetchAssignValue = async () => {
      try {
        const emp_id = localStorage.getItem("emp_id");
        if (usersData && emp_id) {
          const user = usersData.find((user) => user.User_ID === emp_id);
          if (user) {
            // If user found, set FetchAssignValue in localStorage
            localStorage.setItem("FetchAssignValue", user.User_name);
          } else {
            console.error(`User with emp_id ${emp_id} not found in userData.`);
          }
        } else {
          console.error(
            "Either usersData is not available or emp_id is missing."
          );
        }
      } catch (error) {
        console.error("Error fetching and setting FetchAssignValue:", error);
      }
    };

    fetchAssignValue();
  }, [usersData]);

  const FetchAssignValue = localStorage.getItem("FetchAssignValue");

  useEffect(() => {
    const fetchLayouts = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_IPCONFIG}api/getlayouts`,
          { productName: formData.product }
        );
        setLayouts(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    if (formData.product) {
      fetchLayouts();
    }
  }, [formData.product]);

  useEffect(() => {
    const fetchPageNames = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_IPCONFIG}api/pagenumber`,
          { deskName: formData.layout }
        );
        setPageNames(response.data.map((page) => page.page_id));
      } catch (error) {
        console.error(error);
      }
    };

    if (formData.layout) {
      fetchPageNames();
    }
  }, [formData.layout]);

  const handleProductChange = async (e) => {
    const selectedProduct = e.target.value;
    localStorage.setItem("selectedProduct", selectedProduct);
    setFormData({
      ...formData,
      product: selectedProduct,
      layout: "",
      pagename: "",
    });
    setNews([]);
    setFilteredNews([]);
    setStatuses([]);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IPCONFIG}api/getlayouts`,
        { productName: selectedProduct }
      );
      setLayouts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const refzones = [
    { Zone_Code: "BG", Zone_Name: "Dharmapuri" },
    { Zone_Code: "CB", Zone_Name: "Coimbatore" },
    { Zone_Code: "CH", Zone_Name: "Chennai" },
    { Zone_Code: "DE", Zone_Name: "Tanjavur" },
    { Zone_Code: "DG", Zone_Name: "Ramnad" },
    { Zone_Code: "KP", Zone_Name: "Kancheepuram" },
    { Zone_Code: "MA", Zone_Name: "Madurai" },
    { Zone_Code: "PY", Zone_Name: "Puducherry" },
    { Zone_Code: "SM", Zone_Name: "Salem" },
    { Zone_Code: "TI", Zone_Name: "Tirunelveli" },
    { Zone_Code: "TU", Zone_Name: "Tirupur" },
    { Zone_Code: "TV", Zone_Name: "Thiruvananthapuram" },
    { Zone_Code: "TY", Zone_Name: "Tiruchirapalli" },
    { Zone_Code: "VE", Zone_Name: "Vellore" },
    { Zone_Code: "ALL", Zone_Name: "ALL" },
  ];

  const handleZoneChange = async (e) => {
    const selectedZone = e.target.value;
    localStorage.setItem("selectedZone", selectedZone);
    setFormData({ ...formData, zone: selectedZone });
    setNews([]);
    setFilteredNews([]);
    setStatuses([]);
    // try {
    //   const response = await axios.post(
    //     `${process.env.REACT_APP_IPCONFIG}api/assignuser`,
    //     { zoneName: selectedZone }
    //   );
    //   // setAssignUsers(response.data.map((user) => user.User_name));
    //   console.log(response.data);
    // } catch (error) {
    //   console.error(error);
    // }

    fetchAssignuserValues();
  };

  useEffect(() => {
    const fetchUserzoneData = async () => {
      // console.log("userId::", emp_id);

      if (!emp_id) {
        setError("No User ID found in local storage");
        return;
      }
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_IPCONFIG}api/reporter/articleuserzoneids`,
          {
            UserId: emp_id,
          }
        );
        if (response.data.length === 0) {
          setError("No user data found");
        } else {
          setUserData(response.data);
          console.log("response data", response.data[0]);
          localStorage.setItem("userZone", response.data[0].Zone_Code);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("Failed to fetch user data");
      }
    };

    fetchUserzoneData();
  }, [emp_id]);

  const fetchAssignuserValues = async () => {
    const selectedZone = localStorage.getItem("selectedZone");
    if (!selectedZone) {
      console.error("No selected zone in session storage");
      return;
    }

    const refselectedZone = refzones.find(
      (zone) => zone.Zone_Name === selectedZone
    );
    if (!refselectedZone) {
      console.error("Selected zone not found in reference zones");
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IPCONFIG}api/article/userfilterdetail`,
        { params: { zonecode: refselectedZone.Zone_Code } }
      );
      setAssignUsers(response.data);
    } catch (error) {
      console.error("Error fetching assign values:", error);
    }
  };

  const handleLayoutChange = async (e) => {
    const selectedLayout = e.target.value;
    localStorage.setItem("selectedLayout", selectedLayout);
    setFormData({ ...formData, layout: selectedLayout, pagename: "" });
    setNews([]);
    setFilteredNews([]);
    setStatuses([]);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IPCONFIG}api/pagenumber`,
        { deskName: selectedLayout }
      );
      setPageNames(response.data.map((page) => page.page_id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    localStorage.setItem("selectedDate", selectedDate);
    setFormData({ ...formData, selectedDate });
    setNews([]);
    setFilteredNews([]);
    setStatuses([]);
  };

  const handleStatusChange = (e) => {
    const selectedStatus = e.target.value;
    localStorage.setItem("selectedStatus", selectedStatus);
    setFormData({ ...formData, status: selectedStatus });

    if (selectedStatus) {
      const filteredArticles = news.filter(
        (article) => article.Status === selectedStatus
      );
      setFilteredNews(filteredArticles);
      setAssignUsers([]);
      fetchAssignuserValues();
    } else {
      setFilteredNews(news);
    }
  };

  const handleNewsSearch = (e) => {
    const searchText = e.target.value.trim().toLowerCase();

    if (searchText) {
      const filteredArticles = news.filter((article) =>
        article.Head.toLowerCase().includes(searchText)
      );
      setFilteredNews(filteredArticles);
    } else {
      setFilteredNews(news);
    }
  };

  const handleUserChange = (e) => {
    const selectedUser = e.target.value;
    setSelectedUser(selectedUser);
    localStorage.setItem("selectedAssignedUser", selectedUser);

    if (selectedUser) {
      const filteredArticles = news.filter(
        (article) =>
          article.Created_user === selectedUser ||
          article.Report_User === selectedUser ||
          article.Chief_Report_User === selectedUser ||
          article.Sub_Editorial_User === selectedUser ||
          article.SP_Sub_Editor === selectedUser ||
          article.Editorial_User === selectedUser ||
          article.SP_Editor === selectedUser
      );
      setFilteredNews(filteredArticles);
      setShowAssignedOnly(false);
    } else {
      setFilteredNews(news);
    }
  };

  const handleShowAssignedOnlyChange = (e) => {
    const checked = e.target.checked;
    setShowAssignedOnly(checked);

    if (checked) {
      const filteredArticles = news.filter(
        (article) => article.Assigned_USER === FetchAssignValue
      );
      setFilteredNews(filteredArticles);
      setFormData((prevFormData) => ({ ...prevFormData, status: "" }));
      setAssignUsers([]);
      fetchAssignuserValues();
    } else {
      setFilteredNews(news);
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_IPCONFIG}api/fetchnews`,
          formData
        );
        const fetchedNews = response.data;
        console.log("fetched news data", response.data);
        setNews(fetchedNews);
        setFilteredNews(fetchedNews);
        const fetchedStatuses = [
          ...new Set(fetchedNews.map((article) => article.Status)),
        ];
        setStatuses(fetchedStatuses);
        setShowAssignedOnly(false);

        // Reset the status filter
        setFormData((prevFormData) => ({ ...prevFormData, status: "" }));

        // Reset the user selection
        localStorage.removeItem("selectedAssignedUser");
        setAssignUsers([]);
        fetchAssignuserValues();
        setSelectedUser("");
        setFilteredNews(fetchedNews);
      } catch (error) {
        console.error("Error fetching news", error);
      }
    }
  };

  // // Effect to check form data and call handleSubmit
  // useEffect(() => {
  //   const { product, layout, zone, selectedDate } = formData;
  //   if (product && layout && zone && selectedDate) {
  //     handleSubmit();
  //   }
  // }, [formData]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const articleView = async (
    articleId,
    articleIssueDate,
    view,
    articleStatus,
    Processed_User
  ) => {
    console.log("articleStatus :", articleStatus, Processed_User);
    var issueDate = formatDate(articleIssueDate);
    console.log(issueDate, articleIssueDate);

    try {
      if (view == "Non_view") {
        await axios.post(
          `${process.env.REACT_APP_IPCONFIG}api/reporter/processedUser`,
          {
            xml_name: articleId,
            IssueDate: issueDate,
            Processed_user: emp_id,
            article_status: 1,
          }
        );
        console.log("updated succesfully");
      }
      navigate(`/article-editor/${articleId}/${issueDate}`, {
        state: { view },
      });
    } catch (error) {
      console.error(
        "Error updating article or navigating to article view",
        error
      );
    }
  };

  const userMap = usersData.reduce((acc, user) => {
    acc[user.User_ID] = user.User_name;
    return acc;
  }, {});

  const getUserName = (userId) => userMap[userId] || userId;

  const statusMap = [
    { stage: "Submit", status: "T" },
    { stage: "Approved", status: "P" },
    { stage: "Assigned", status: "S" },
    { stage: "PR Done", status: "D" },
    { stage: "Finalize", status: "A" },
    { stage: "Saved", status: "F" },
    { stage: "Rejected", status: "R" },
  ].reduce((acc, item) => {
    acc[item.status] = item.stage;
    return acc;
  }, {});

  const getStatusStage = (status) => statusMap[status] || status;

  const newsLength = filteredNews.length;

  const userZoneCode = localStorage.getItem("userZone");

  const canEdit = (
    userRole,
    status,
    createduser,
    Assigned_USER,
    emp_id,
    Zone_Code
  ) => {
    console.log("Zone_Code value:", Zone_Code, userZoneCode);

    const finalZone = userZoneCode.includes(Zone_Code);
    console.log("finalZone value:", finalZone);

    // console.log(Zone_Code === userZoneCode.includes(Zone_Code));

    if (userRole === "RPT") {
      if (
        status === "P" ||
        status === "S" ||
        status === "D" ||
        status === "A" ||
        status === "R"
      ) {
        return false;
      }
      if ((status === "F" || status === "T") && emp_id === createduser) {
        return true;
      }
    }

    if (userRole === "CHRPT") {
      if (status === "S" || status === "D" || status === "A") {
        return false;
      }
      if (status === "F" && emp_id === createduser) {
        return true;
      }
      if (status === "R" && emp_id == Assigned_USER) {
        return true;
      }
      if (status === "F") {
        return false;
      }

      if (status === "R") {
        return false;
      }
      if ((status === "T" || status === "P") && Zone_Code === userZoneCode) {
        return true;
      }
    }

    if (userRole === "SPSUBEDT") {
      if ((status === "P" || status === "T") && Zone_Code === "ALL") {
        return true;
      }
      if (status === "P" || status === "A" || status === "R") {
        return false;
      }
      if (status === "F" && emp_id === createduser) {
        return true;
      }
      if (status === "F") {
        return false;
      }
      if (status === "S" || status === "D") {
        return true;
      }
    }

    if ((userRole === "SPEDT" && status === "T") || status === "R")
      return false;
    if (userRole === "SPEDT" && status === "R") return false;
    if (userRole === "SPEDT" && status === "F" && emp_id === createduser)
      return true;

    if (userRole === "SPEDT" && status === "F") return false;
    if (userRole === "SPEDT" && status === "P") return true;
    if (userRole === "SPEDT" && status === "A") return true;
    if (userRole === "SPEDT" && status === "S") return true;
    if (userRole === "SPEDT" && status === "D") return true;

    if (userRole === "EDT") {
      if ((status === "P" || status === "T") && finalZone) {
        return true;
      }

      if (status === "F" && emp_id === createduser && finalZone) {
        return true;
      }
      if (
        status === "F" ||
        status === "A" ||
        status === "S" ||
        status === "D"
      ) {
        return false;
      }
      if (status === "R" && emp_id === Assigned_USER) {
        return true;
      }
      if (status === "R") {
        return false;
      }
    }

    if (userRole === "SUP" && (status === "T" || status === "S")) return true;
    if (userRole === "SUP" && status === "F" && emp_id === createduser)
      return true;
    if (userRole === "SUP" && status === "F") return true;
    if (userRole === "SUP" && status === "P") return true;
    if (userRole === "SUP" && status === "D") return true;
    if (userRole === "SUP" && status === "A") return true;
    if (userRole === "SUP" && status === "R") return true;

    return false;
  };

  const activity = [
    { Status_Code: "0", Status_Name: "Active" },
    { Status_Code: "", Status_Name: "Closed" },
    { Status_Code: "1", Status_Name: "Editing.." },
  ];

  const getStatusName = (statusCode) => {
    const status = activity.find((item) => item.Status_Code === statusCode);
    return status ? status.Status_Name : "Unknown Status";
  };

  return (
    <div className="main-content">
      <div>
        <fieldset className="f_fieldset">
          <legend>Select Details</legend>
          <Row className="mb-3" style={{ justifyContent: "space-evenly" }}>
            <Col xs={6} sm={6} md={2} className="mb-3">
              {" "}
              {/* 2x2 grid on mobile */}
              <Form.Group>
                <Form.Control
                  type="date"
                  value={formData.selectedDate}
                  onChange={handleDateChange}
                  className="form-select-sm custom-select"
                />
              </Form.Group>
            </Col>

            <Col xs={6} sm={6} md={2} className="mb-3">
              {" "}
              {/* 2x2 grid on mobile */}
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

            <Col xs={6} sm={6} md={2} className="mb-3">
              {" "}
              {/* 2x2 grid on mobile */}
              <Form.Select
                aria-label="Zone select example"
                onChange={handleZoneChange}
                value={formData.zone}
                className="form-select-sm custom-select"
              >
                <option value="">No Zone selected</option>
                {zones.map((zoneName, index) => (
                  <option key={index} value={zoneName}>
                    {zoneName}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={6} sm={6} md={2} className="mb-3">
              {" "}
              {/* 2x2 grid on mobile */}
              <Form.Select
                aria-label="Layout desk select example"
                onChange={handleLayoutChange}
                value={formData.layout}
                className="form-select-sm custom-select"
              >
                <option>No Layout selected</option>
                {layouts.map((layout, index) => (
                  <option key={index} value={layout.desk_name}>
                    {layout.desk_name}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12} sm={6} md={2} className="mb-3" style={{display:'flex', justifyContent:'center'}}>
              {" "}
              {/* Same row on larger screens, new row on mobile */}
              <Button
                onClick={handleSubmit}
                className="action-btn"
                variant="primary"
                style={{ width: "35%" }} // Ensures full-width button on all screens
              >
                Submit
              </Button>
            </Col>
          </Row>

          <>
            {/* Toggle Button for Mobile */}
            <div className="d-md-none mb-3">
              <Button
                className="action-btn"
                variant="primary"
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)} // Toggle the collapse
                aria-controls="advanced-filter-collapse"
                aria-expanded={showAdvancedFilter}
              >
                Advanced Filter
              </Button>
            </div>

            {/* Collapsible Advanced Filter Row */}
            <Collapse in={showAdvancedFilter}>
              <div id="advanced-filter-collapse">
                <Row
                  className="mb-3"
                  id="advanced"
                  style={{
                    justifyContent: "flex-start",
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "2%",
                  }}
                >
                  <Col
                    xs={12}
                    sm={6}
                    md={2}
                    className="mb-3"
                    style={{ width: "max-content" }}
                  >
                    <div
                      style={{
                        fontSize: "larger",
                        fontWeight: "bold",
                        color: "#015BAB",
                        width: "max-content",
                        fontStyle: "italic",
                        fontSize: "1rem",
                      }}
                    >
                      Advanced Filter :
                    </div>
                  </Col>

                  <Col xs={12} sm={6} md={2} className="mb-3">
                    <Form.Select
                      aria-label="Status select example"
                      onChange={handleStatusChange}
                      value={formData.status}
                      className="form-select-sm custom-select"
                      style={{ fontStyle: "italic", fontSize: "1rem" }}
                    >
                      <option value="">Select Status</option>
                      {statuses.map((status, index) => (
                        <option key={index} value={status}>
                          {getStatusStage(status)}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col xs={12} sm={6} md={2} className="mb-3">
                    <Form.Select
                      aria-label="User select example"
                      onChange={handleUserChange}
                      className="form-select-sm custom-select"
                      style={{ fontStyle: "italic", fontSize: "1rem" }}
                    >
                      <option value="">Select User</option>
                      {assignUsers.map((user, index) => (
                        <option key={index} value={user.User_Id}>
                          {user.User_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col xs={12} sm={6} md={2} className="mb-3">
                    <Form.Group controlId="formShowAssignedOnly">
                      <Form.Check
                        type="checkbox"
                        label="Show Assigned"
                        checked={showAssignedOnly}
                        onChange={handleShowAssignedOnlyChange}
                        className="custom-checkbox"
                        style={{
                          width: "100%",
                          fontStyle: "italic",
                          fontSize: "1rem",
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} sm={6} md={3} className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Search Story"
                      style={{ fontWeight: 600 }}
                      onChange={handleNewsSearch}
                    />
                  </Col>
                </Row>
              </div>
            </Collapse>

            {/* Advanced Filter is visible by default on medium and larger screens */}
            <style jsx>{`
              @media (min-width: 768px) {
                #advanced-filter-collapse {
                  display: block !important;
                }
              }
            `}</style>
          </>
        </fieldset>

        <fieldset className="f_fieldset">
  <legend>Stories Details</legend>

  <div
    style={{
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    }}
  >
    <div className="S-heading">Total Stories: {newsLength}</div>
    <div className="S-heading" style={{ color: "red" }}>
      *Note: Before Editing Click 'Submit' button
    </div>
  </div>

  <div className="table-responsive">
    <Table striped bordered hover responsive="md">
      <thead>
        <tr>
          <th className="ST-heading">Heading</th>
          <th className="d-none d-md-table-cell">Assigned To</th>
          <th className="d-none d-md-table-cell">Reporter</th>
          <th className="d-none d-md-table-cell">Ch.Reporter</th>
          <th className="d-none d-md-table-cell">SP Sub Editor</th>
          <th className="d-none d-md-table-cell">Editor</th>
          <th className="d-none d-md-table-cell">SP Editor</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {filteredNews.length > 0 ? (
          [...filteredNews].reverse().map((article, index) => (
            <tr key={index}>
              <td className="ST-content">
                <div>{article.Head}</div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    alignContent: "center",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div className="Created_user">
                    {" "}
                    - {getUserName(article.Created_user)}
                  </div>
                  <div>
                    {article.Images && (
                      <span>
                        <FaRegImage
                          style={{
                            color: "red",
                            marginLeft: "25%",
                            fontSize: "larger",
                          }}
                        />
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="d-none d-md-table-cell">
                {getUserName(article.Assigned_USER)}
              </td>
              <td className="d-none d-md-table-cell">
                <div>{getUserName(article.Report_User)}</div>
                <div className="Time">{article.Report_User_time}</div>
              </td>
              <td className="d-none d-md-table-cell">
                <div>{getUserName(article.Chief_Report_User)}</div>
                <div className="Time">{article.Chief_Report_User_time}</div>
              </td>
              <td className="d-none d-md-table-cell">
                <div>{getUserName(article.SP_Sub_Editor)}</div>
                <div className="Time">{article.SP_Sub_Editor_time}</div>
              </td>
              <td className="d-none d-md-table-cell">
                <div>{getUserName(article.Editorial_User)}</div>
                <div className="Time">{article.Editorial_User_time}</div>
              </td>
              <td className="d-none d-md-table-cell">
                <div>{getUserName(article.SP_Editor)}</div>
                <div className="Time">{article.SP_Editor_time}</div>
              </td>
              <td
                style={{
                  fontWeight: 700,
                  backgroundColor:
                    getStatusStage(article.Status) === "Finalize"
                      ? "#b1efb1"
                      : "transparent",
                }}
              >
                <div>{getStatusStage(article.Status)}</div>

                <div
                  className="statusCss"
                  style={{
                    fontWeight: 700,
                    backgroundColor:
                      article.article_status === "1" ? "red" : "green",
                  }}
                >
                  {getStatusName(article.article_status)}
                </div>
              </td>
              <td className="action-buttons">
                <Button
                  className="action-btn"
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    articleView(
                      article.parent_object_id,
                      article.IssueDate,
                      "view",
                      article.article_status,
                      article.Processed_user
                    )
                  }
                >
                  View
                </Button>
                {canEdit(
                  userRole,
                  article.Status,
                  article.Created_user,
                  article.Assigned_USER,
                  emp_id,
                  article.Zone_Code
                ) && (
                  <Button
                    className="action-btn"
                    variant="warning"
                    size="sm"
                    onClick={async () => {
                      var issueDate = formatDate(article.IssueDate);
                      try {
                        const response = await fetch(
                          `${process.env.REACT_APP_IPCONFIG}api/getarticlestatus?date=${issueDate}&xmlName=${article.parent_object_id}`
                        );
                        const data = await response.json();

                        if (response.ok) {
                          const articleStatus = data.article_status;
                          const ProcessedUser = data.Processed_user;

                          if (articleStatus === "1") {
                            if (ProcessedUser === emp_id) {
                              articleView(
                                article.parent_object_id,
                                article.IssueDate,
                                "Non_view",
                                article.article_status,
                                article.Processed_user
                              );
                            } else {
                              alert(
                                `The Story is already opened by ${getUserName(
                                  ProcessedUser
                                )}`
                              );
                            }
                          } else if (
                            articleStatus === "" ||
                            articleStatus === "0"
                          ) {
                            articleView(
                              article.parent_object_id,
                              article.IssueDate,
                              "Non_view",
                              article.article_status,
                              article.Processed_user
                            );
                          }
                        } else {
                          console.error(
                            "Error fetching article status:",
                            data.error
                          );
                        }
                      } catch (error) {
                        console.error("Error in onClick handler:", error);
                      }
                    }}
                  >
                    Edit
                  </Button>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="12" className="text-center">
              No Articles Found
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  </div>
</fieldset>

      </div>
    </div>
  );
}
