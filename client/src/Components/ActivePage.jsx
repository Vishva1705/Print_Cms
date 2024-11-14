import React, { useState, useEffect } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form, Row, Col, Table, Modal } from 'react-bootstrap';
import '../Styles/Revoke.css';
 
const getCurrentDate = () => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
 
const AlertBox = ({ show, handleClose, message }) => {
  return(
  <Modal show={show} onHide={handleClose} centered>
    <Modal.Body style={{ paddingBottom: "10PX" }}>
      <p style={{ textAlign: 'center', fontSize: '18px' }}>{message}</p>
    </Modal.Body>
    <Modal.Footer style={{ justifyContent: 'center' }}>
      <Button variant="primary" onClick={handleClose}>OK</Button>
    </Modal.Footer>
  </Modal>
);
}
 
const ConfirmationBox = ({ show, handleClose, handleConfirm, message }) =>{
  return(
  <Modal show={show} onHide={handleClose} centered>
    <Modal.Body style={{ paddingBottom: "10PX" }}>
      <p style={{ textAlign: 'center', fontSize: '18px' }}>{message}</p>
    </Modal.Body>
    <Modal.Footer style={{ justifyContent: 'center' }}>
      <Button variant="primary" onClick={handleConfirm} style={{ marginRight: '10px' }}>Confirm</Button>
      <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    </Modal.Footer>
  </Modal>
);
}
 
const App = () => {
 
  const initialIssueDate = getCurrentDate();
  const [issueDate, setIssueDate] = useState(initialIssueDate);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(localStorage.getItem("product") || "");
  const [zones, setZones] = useState([]);
  const [zone, setZone] = useState("Select Zone");
  const [pageIds, setPageIds] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState("Select Page");
  const [edition, setEdition] = useState("Select Edition");
  const [pages, setPages] = useState([]);
  const [pagess, setPagess] = useState([]);
  const [viewMode, setViewMode] = useState(false);
  const [showConfirmBox, setShowConfirmBox] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState(null);
  const [showAlertBox, setShowAlertBox] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectAll, setSelectAll] = useState(false);
 
  const [initialPagesState, setInitialPagesState] = useState([]);
  const [initialPagessState, setInitialPagessState] = useState([]);
 
 
  useEffect(() => {
    setViewMode(false);
    if (issueDate) {
      fetchProductIds(issueDate);
      fetchPageIds(issueDate, product);
    }
  }, [issueDate, product]);
 
  useEffect(() => {
    if (issueDate && product) {
      fetchZoneIds(issueDate, product);
    }
  }, [issueDate, product]);
 
  useEffect(() => {
    if (issueDate && product && zone) {
      fetchPages(issueDate, product, zone);
    }
  }, [issueDate, product, zone]);
 
 
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setIssueDate(newDate);
    localStorage.setItem("issueDate", newDate);
    setSelectedPageId("Select Page");
    setZone(["Select Zone"]);
    setPages([]);
    setViewMode(false);
  };
 
  const handleProductChange = (e) => {
    const newProduct = e.target.value;
    setProduct(newProduct);
    localStorage.setItem("product", newProduct);
    setSelectedPageId("Select Page");
    setZone("Select Zone");
    setPages([]);
    setViewMode(false);
  };
 
  const handleZoneChange = (e) => {
    const newZone = e.target.value;
    setZone(newZone);
    localStorage.setItem("Select Zone", newZone);
    setSelectedPageId("Select Page");
    setViewMode(false);
  };
 
  const handleEditionChange = (e) => {
    const newEdition = e.target.value;
    setEdition(newEdition);
  };
 
  const handlePageSelect = (e) => {
    setSelectedPageId(e.target.value);
    localStorage.setItem("page", e.target.value);
    setZone("Select Zone");
  };
 
  const handleViewClick = async () => {
    try {
      if (issueDate && product) {
        if (zone !== "Select Zone" && selectedPageId === "Select Page") {
          await fetchPages(issueDate, product, zone);
        } else if (zone === "Select Zone" && selectedPageId !== 'Select Page') {
          await fetchPagess(issueDate, product, selectedPageId);
        }
        setViewMode(true);
      } else {
        setShowAlertBox(true);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      setAlertMessage("Failed to fetch pages");
      setShowAlertBox(true);
    }
  };
 
  const handleCheckboxChange = (index, isPagess = false) => {
 
    if (zone !== "Select Zone" && selectedPageId === "Select Page") {
      const updatedPages = [...pages];
      updatedPages[index].Active = updatedPages[index].Active === 1 ? 2 : 1;
      setPages(updatedPages);
 
    } else if (selectedPageId !== 'Select Page'&& zone === "Select Zone") {
      console.log('checkbox 2' );      
      const updatedPagess = [...pagess];
      updatedPagess[index].ACTIVE = updatedPagess[index].ACTIVE === 1 ? 2 : 1;
      setPagess(updatedPagess);
    }
  };
 
  const handleSelectUnselectAll = () => {
  if (zone !== "Select Zone" && selectedPageId === "Select Page") {
    const updatedPages = pages.map((page) => ({
      ...page,
      Active: selectAll ? 2 : 1,
    }));
    setPages(updatedPages);
  } else if (selectedPageId !== 'Select Page' && zone === "Select Zone") {
    const updatedPagess = pagess.map((page) => ({
      ...page,
      ACTIVE: selectAll ? 2 : 1,
    }));
    setPagess(updatedPagess);
  }
  setSelectAll(!selectAll); // Toggle the selectAll state
};
 
 
const handleSubmit = (e) => {
  e.preventDefault();
 
  let isAnySelected = false;
  let isAnyChanged = false;
 
  if (zone !== "Select Zone" && selectedPageId === "Select Page") {
    isAnySelected = pages.some((page) => page.Active === 1);
    isAnyChanged = pages.some((page, index) => page.Active !== initialPagesState[index]);
  } else if (selectedPageId !== "Select Page" && zone === "Select Zone") {
    isAnySelected = pagess.some((page) => page.ACTIVE === 1);
    isAnyChanged = pagess.some((page, index) => page.ACTIVE !== initialPagessState[index]);
  }
 
  if (!isAnySelected) {
    setAlertMessage("Please select at least one checkbox.");
    setShowAlertBox(true);
    return;
  }
 
  if (!isAnyChanged) {
    setAlertMessage("Please select checkbox before submitting");
    setShowAlertBox(true);
    return;
  }
 
  // Show confirmation box
  setConfirmCallback(() => submitChanges);
  setShowConfirmBox(true);
};
 
const submitChanges = async () => {
  try {
    let activeUpdates = [];
    let activeUpdate = [];
    let requestData = {};
 
    if (zone !== "Select Zone" && selectedPageId === "Select Page") {
      activeUpdates = pages.map((page) => ({
        pageId: page.Page_id,
        isActive: page.Active !== undefined ? page.Active : 2
      }));
      requestData = {
        issueDate,
        productId: product,
        zoneId: zone,
        activeUpdates,
      };
      await axios.post(`${process.env.REACT_APP_IPCONFIG}api/pageactive`, requestData);
    } else if (selectedPageId !== "Select Page" && zone === "Select Zone") {
      activeUpdate = pagess.map((page) => ({
        pageId: page.page_id,
        isActive: page.ACTIVE
      }));
      requestData = {
        issueDate,
        productId: product,
        pageId: selectedPageId,
        activeUpdate,
      };
      await axios.post(`${process.env.REACT_APP_IPCONFIG}api/pageIdactive`, requestData);
    }
 
 
    // Show success message
    setAlertMessage("Pages have been Activated");
    setShowAlertBox(true);
 
    // Hide the confirm box after successful submission
    setShowConfirmBox(false);
 
    // Refresh the page after a short delay to allow the alert box to be displayed
    setTimeout(() => {
      window.location.reload();
    }, 1000);
 
  } catch (error) {
    console.error("Error updating pages:", error);
    setAlertMessage("Failed to update pages");
    setShowAlertBox(true);
    setShowConfirmBox(false);
  }
};
 
 
  const fetchProductIds = async (date) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/products-ids?date=${date}`
      );
      const productIds = response.data.map((item) => item.PRODUCT_ID);
      setProducts(productIds);
      if (!productIds.includes(product)) {
        setProduct(productIds[0] || "");
      }
    } catch (error) {
      console.error("Error fetching product IDs:", error);
    }
  };
 
  const fetchZoneIds = async (date, productId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/zone-ids-by-product?date=${date}&productId=${productId}`
      );
      const zoneIds = response.data.map((item) => item.ZONE_ID);
      setZones(zoneIds);
      setZone(zoneIds[-1] || "Select Zone");
    } catch (error) {
      console.error("Error fetching zone IDs:", error);
    }
  };
 
  const fetchPageIds = async (date, productId) => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getPageIds?date=${date}&productId=${productId}`);
        const pageIds = response.data.map((item) => item.page_id); // Adjust based on actual response structure
        setPageIds(pageIds);
        setSelectedPageId(pageIds[-1] || "Select Page");
    } catch (error) {
        console.error("Error fetching page IDs:", error);
    }
  };
 
 
 
  const fetchPages = async (date, productId, zoneId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/pages-zones?date=${date}&productId=${productId}&zoneId=${zoneId}`
      );
      setPages(response.data);
      setInitialPagesState(response.data.map(page => page.Active)); // Store initial Active states
    } catch (error) {
      console.error("Error fetching pages:", error);
      throw error;
    }
  };
 
  const fetchPagess = async (date, productId, pageId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IPCONFIG}api/getPageDetails?date=${date}&productId=${productId}&pageId=${pageId}`
      );
      setPagess(response.data);
      setInitialPagessState(response.data.map(page => page.ACTIVE)); // Store initial ACTIVE states
    } catch (error) {
      console.error("Error fetching pages:", error);
      throw error;
    }
  };
 
  const inputValue = selectedPageId !== "Select Page" ? ` ${selectedPageId}` : ` ${zone}`;
 
  return (
    <div className="main-content">
      <fieldset className="f_fieldset">
        <legend>Active Page</legend>
        <Form>
          <Row className="mb-3">
            <Col xs={6} sm={6} md={2} className="mb-3">
              <Form.Control type="date" className="form-select-sm custom-select" value={issueDate} onChange={handleDateChange} />
            </Col>
            <Col xs={6} sm={6} md={2} className="mb-3">
              <Form.Select value={product} className="form-select-sm custom-select" onChange={handleProductChange}>
                <option value="">Select Product</option>
                {products.map((id, index) => (
                  <option key={index} value={id}>{id}</option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6} sm={6} md={2} className="mb-3">
              <Form.Select value={zone} className="form-select-sm custom-select" onChange={handleZoneChange}>
                <option value="Select Zone">Select Zone</option>
                {zones.map((id, index) => (
                  <option key={index} value={id}>{id}</option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6} sm={6} md={2} className="mb-3">
              <Form.Select value={edition} className="form-select-sm custom-select" onChange={handleEditionChange}>
                <option value="">Select Edition</option>
                <option value="1">1</option>
               
              </Form.Select>
            </Col>
            <Col xs={6} sm={6} md={2} className="mb-3">
              <Form.Select value={selectedPageId} className="form-select-sm custom-select" onChange={handlePageSelect}>
                <option value="all pages  ">Select Page</option>
                {pageIds.map((id, index) => (
                  <option key={index} value={id}>{id}</option>
                ))}
              </Form.Select>
            </Col>
           
            <Col xs={6} sm={6} md={2}>
              <Button  className="re_btn" onClick={handleViewClick}>View</Button>
            </Col>
          </Row>
        </Form>
      </fieldset>
 
      {viewMode && (
 
<fieldset className="f_fieldset">
         
<div style={{ display: 'flex', alignItems: 'center', paddingTop: "10px", paddingRight: "15px" }}>
  <input
    type="text"
    value={new Date(issueDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).replace(/\//g, "-")}
    readOnly
    className="form-control-plaintext responsive-font"
    style={{
      color: "#015BAB",
      fontWeight: "800",
      maxWidth: "100px",
      marginRight: '10px', // Space between date input and colon
    }}
  />
 
  <span
    className="responsive-font"
    style={{
      fontWeight: "bold",
      display: "flex",
      alignItems: "center", // Vertically center the span
      margin: '0 10px', // Space around the colon
    }}
  >:</span>
 
  <input
    type="text"
    value={inputValue}
    readOnly
    className="form-control-plaintext responsive-font"
    style={{
      color: "#015BAB",
      fontWeight: "800",
      maxWidth: "220px",
    }}
  />
</div>
 
 
<Form onSubmit={handleSubmit} className="text-center">
  <div className="table-responsive" style={{ maxWidth: '100%', margin: '0 auto', paddingTop: "8px", paddingBottom: "20px" }}>
    <Table style={{ backgroundColor: "none" }} bordered className="table3">
      <thead>
        <tr>
          <th>Page No</th>
          <th>Zone</th>
          <th>Page Name</th>
          <th>Active</th>
        </tr>
      </thead>
      <tbody>
        {zone !== "Select Zone" && selectedPageId === "Select Page" ? (
          pages.map((page, index) => (
            <tr
              key={index}
              className={page.Active === 1 ? "table table-success table-striped" : "table-light"}
            >
              <td>{page.Page_Num}</td>
              <td style={{ fontSize: "15px" }}>{page.Zone_id}</td>
              <td style={{ fontSize: "15px" }}>{page.Page_id}</td>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={page.Active === 1}
                  onChange={() => handleCheckboxChange(index)}
                />
              </td>
            </tr>
          ))
        ) : (
          selectedPageId !== "Select Page" &&
          zone === "Select Zone" &&
          pagess.map((page, index) => (
            <tr
              key={index}
              className={page.ACTIVE === 1 ? "table table-success table-striped" : "table-light"}
            >
              <td>{page.Page_num}</td>
              <td style={{ fontSize: "15px" }}>{page.Zone_id}</td>
              <td style={{ fontSize: "15px" }}>{page.page_id}</td>
              <td>
                {!page.Zone_id.includes("ALL") && (
                  <Form.Check
                    type="checkbox"
                    checked={page.ACTIVE === 1}
                    onChange={() => handleCheckboxChange(index, true)}
                  />
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
 
    {/* Button container */}
  {(pages.length > 0 || pagess.length > 0) && (
  <div className="re_center-button text-center d-flex flex-row justify-content-center align-items-center" style={{ gap: "10px", marginTop: "10px" }}>
    <Button type="submit" className="buttonNew1">
      Submit
    </Button>
 
    <Button
      type="button"
      className="buttonNew1"
      onClick={handleSelectUnselectAll}
    >
      {selectAll ? "Unselect All" : "Select All"}
    </Button>
  </div>
    )}
  </div>
</Form>
 
              </fieldset>
       
       
      )}
 
 
      <ConfirmationBox
        show={showConfirmBox}
        handleClose={() => setShowConfirmBox(false)}
        handleConfirm={confirmCallback}
        message="Are you sure you want to proceed with the changes?"
      />
 
      <AlertBox
        show={showAlertBox}
        handleClose={() => setShowAlertBox(false)}
        message={alertMessage}
      />
    </div>
  );
};
 
export default App;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { Button, Form, Row, Col, Table, Modal } from 'react-bootstrap';
// import '../Styles/Revoke.css';
 
// const getCurrentDate = () => {
//   const today = new Date();
//   today.setDate(today.getDate() + 1);
//   const yyyy = today.getFullYear();
//   const mm = String(today.getMonth() + 1).padStart(2, "0");
//   const dd = String(today.getDate()).padStart(2, "0");
//   return `${yyyy}-${mm}-${dd}`;
// };
 
// const AlertBox = ({ show, handleClose, message }) => {
//   return(
//   <Modal show={show} onHide={handleClose} centered>
//     <Modal.Body style={{ paddingBottom: "10PX" }}>
//       <p style={{ textAlign: 'center', fontSize: '18px' }}>{message}</p>
//     </Modal.Body>
//     <Modal.Footer style={{ justifyContent: 'center' }}>
//       <Button variant="primary" onClick={handleClose}>OK</Button>
//     </Modal.Footer>
//   </Modal>
// );
// }
 
// const ConfirmationBox = ({ show, handleClose, handleConfirm, message }) =>{
//   return(
//   <Modal show={show} onHide={handleClose} centered>
//     <Modal.Body style={{ paddingBottom: "10PX" }}>
//       <p style={{ textAlign: 'center', fontSize: '18px' }}>{message}</p>
//     </Modal.Body>
//     <Modal.Footer style={{ justifyContent: 'center' }}>
//       <Button variant="primary" onClick={handleConfirm} style={{ marginRight: '10px' }}>Confirm</Button>
//       <Button variant="secondary" onClick={handleClose}>Cancel</Button>
//     </Modal.Footer>
//   </Modal>
// );
// }
 
// const App = () => {

//   const initialIssueDate = getCurrentDate();
//   const [issueDate, setIssueDate] = useState(initialIssueDate);
//   const [products, setProducts] = useState([]);
//   const [product, setProduct] = useState(localStorage.getItem("product") || "");
//   const [zones, setZones] = useState([]);
//   const [zone, setZone] = useState("Select Zone"); 
//   const [pageIds, setPageIds] = useState([]);
//   const [selectedPageId, setSelectedPageId] = useState("Select Page"); 
//   const [edition, setEdition] = useState("Select Edition");
//   const [pages, setPages] = useState([]);
//   const [pagess, setPagess] = useState([]);
//   const [viewMode, setViewMode] = useState(false);
//   const [showConfirmBox, setShowConfirmBox] = useState(false);
//   const [confirmCallback, setConfirmCallback] = useState(null);
//   const [showAlertBox, setShowAlertBox] = useState(false);
//   const [alertMessage, setAlertMessage] = useState('');
//   const [selectAll, setSelectAll] = useState(false);
 
//   const [initialPagesState, setInitialPagesState] = useState([]);
//   const [initialPagessState, setInitialPagessState] = useState([]);
 
 
//   useEffect(() => {
//     setViewMode(false);
//     if (issueDate) {
//       fetchProductIds(issueDate);
//       fetchPageIds(issueDate, product);
//     }
//   }, [issueDate, product]);
 
//   useEffect(() => {
//     if (issueDate && product) {
//       fetchZoneIds(issueDate, product);
//     }
//   }, [issueDate, product]);
 
//   useEffect(() => {
//     if (issueDate && product && zone) {
//       fetchPages(issueDate, product, zone);
//     }
//   }, [issueDate, product, zone]);
 
 
//   const handleDateChange = (e) => {
//     const newDate = e.target.value;
//     setIssueDate(newDate);
//     localStorage.setItem("issueDate", newDate);
//     setSelectedPageId("Select Page");
//     setZone(["Select Zone"]);
//     setPages([]);
//     setViewMode(false);
//   };
 
//   const handleProductChange = (e) => {
//     const newProduct = e.target.value;
//     setProduct(newProduct);
//     localStorage.setItem("product", newProduct);
//     setSelectedPageId("Select Page");
//     setZone("Select Zone");
//     setPages([]);
//     setViewMode(false);
//   };
 
//   const handleZoneChange = (e) => {
//     const newZone = e.target.value;
//     setZone(newZone);
//     localStorage.setItem("Select Zone", newZone);
//     setSelectedPageId("Select Page");
//     setViewMode(false);
//   };
 
//   const handleEditionChange = (e) => {
//     const newEdition = e.target.value;
//     setEdition(newEdition);
//   };
 
//   const handlePageSelect = (e) => {
//     setSelectedPageId(e.target.value);
//     localStorage.setItem("page", e.target.value);
//     setZone("Select Zone");
//   };
 
//   const handleViewClick = async () => {
//     try {
//       if (issueDate && product) {
//         if (zone !== "Select Zone" && selectedPageId === "Select Page") {
//           await fetchPages(issueDate, product, zone);
//         } else if (zone === "Select Zone" && selectedPageId !== 'Select Page') {
//           await fetchPagess(issueDate, product, selectedPageId);
//         }
//         setViewMode(true);
//       } else {
//         setShowAlertBox(true);
//       }
//     } catch (error) {
//       console.error("Error fetching pages:", error);
//       setAlertMessage("Failed to fetch pages");
//       setShowAlertBox(true);
//     }
//   };
 
//   const handleCheckboxChange = (index, isPagess = false) => {
 
//     if (zone !== "Select Zone" && selectedPageId === "Select Page") {
//       const updatedPages = [...pages];
//       updatedPages[index].Active = updatedPages[index].Active === 1 ? 2 : 1;
//       setPages(updatedPages);
 
//     } else if (selectedPageId !== 'Select Page'&& zone === "Select Zone") {
//       console.log('checkbox 2' );      
//       const updatedPagess = [...pagess];
//       updatedPagess[index].ACTIVE = updatedPagess[index].ACTIVE === 1 ? 2 : 1;
//       setPagess(updatedPagess);
//     }
//   };
 
//   const handleSelectUnselectAll = () => {
//   if (zone !== "Select Zone" && selectedPageId === "Select Page") {
//     const updatedPages = pages.map((page) => ({
//       ...page,
//       Active: selectAll ? 2 : 1,
//     }));
//     setPages(updatedPages);
//   } else if (selectedPageId !== 'Select Page' && zone === "Select Zone") {
//     const updatedPagess = pagess.map((page) => ({
//       ...page,
//       ACTIVE: selectAll ? 2 : 1,
//     }));
//     setPagess(updatedPagess);
//   }
//   setSelectAll(!selectAll); // Toggle the selectAll state
// };
 
 
// const handleSubmit = (e) => {
//   e.preventDefault();
 
//   let isAnySelected = false;
//   let isAnyChanged = false;
 
//   if (zone !== "Select Zone" && selectedPageId === "Select Page") {
//     isAnySelected = pages.some((page) => page.Active === 1);
//     isAnyChanged = pages.some((page, index) => page.Active !== initialPagesState[index]);
//   } else if (selectedPageId !== "Select Page" && zone === "Select Zone") {
//     isAnySelected = pagess.some((page) => page.ACTIVE === 1);
//     isAnyChanged = pagess.some((page, index) => page.ACTIVE !== initialPagessState[index]);
//   }
 
//   if (!isAnySelected) {
//     setAlertMessage("Please select at least one checkbox.");
//     setShowAlertBox(true);
//     return;
//   }
 
//   if (!isAnyChanged) {
//     setAlertMessage("Please select checkbox before submitting");
//     setShowAlertBox(true);
//     return;
//   }
 
//   // Show confirmation box
//   setConfirmCallback(() => submitChanges);
//   setShowConfirmBox(true);
// };
 
// const submitChanges = async () => {
//   try {
//     let activeUpdates = [];
//     let activeUpdate = [];
//     let requestData = {};
 
//     if (zone !== "Select Zone" && selectedPageId === "Select Page") {
//       activeUpdates = pages.map((page) => ({
//         pageId: page.Page_id,
//         isActive: page.Active !== undefined ? page.Active : 2
//       }));
//       requestData = {
//         issueDate,
//         productId: product,
//         zoneId: zone,
//         activeUpdates,
//       };
//       await axios.post(`${process.env.REACT_APP_IPCONFIG}api/pageactive`, requestData);
//     } else if (selectedPageId !== "Select Page" && zone === "Select Zone") {
//       activeUpdate = pagess.map((page) => ({
//         pageId: page.page_id,
//         isActive: page.ACTIVE
//       }));
//       requestData = {
//         issueDate,
//         productId: product,
//         pageId: selectedPageId,
//         activeUpdate,
//       };
//       await axios.post(`${process.env.REACT_APP_IPCONFIG}api/pageIdactive`, requestData);
//     }
 
 
//     // Show success message
//     setAlertMessage("Pages have been Activated");
//     setShowAlertBox(true);
 
//     // Hide the confirm box after successful submission
//     setShowConfirmBox(false);
 
//     // Refresh the page after a short delay to allow the alert box to be displayed
//     setTimeout(() => {
//       window.location.reload();
//     }, 1000);
 
//   } catch (error) {
//     console.error("Error updating pages:", error);
//     setAlertMessage("Failed to update pages");
//     setShowAlertBox(true);
//     setShowConfirmBox(false);
//   }
// };
 
 
//   const fetchProductIds = async (date) => {
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_IPCONFIG}api/reporter/products-ids?date=${date}`
//       );
//       const productIds = response.data.map((item) => item.PRODUCT_ID);
//       setProducts(productIds);
//       if (!productIds.includes(product)) {
//         setProduct(productIds[0] || "");
//       }
//     } catch (error) {
//       console.error("Error fetching product IDs:", error);
//     }
//   };
 
//   const fetchZoneIds = async (date, productId) => {
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_IPCONFIG}api/reporter/zone-ids-by-product?date=${date}&productId=${productId}`
//       );
//       const zoneIds = response.data.map((item) => item.ZONE_ID);
//       setZones(zoneIds);
//       setZone(zoneIds[-1] || "Select Zone");
//     } catch (error) {
//       console.error("Error fetching zone IDs:", error);
//     }
//   };
 
//   const fetchPageIds = async (date, productId) => {
//     try {
//         const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getPageIds?date=${date}&productId=${productId}`);
//         const pageIds = response.data.map((item) => item.page_id); // Adjust based on actual response structure
//         setPageIds(pageIds);
//         setSelectedPageId(pageIds[-1] || "Select Page");
//     } catch (error) {
//         console.error("Error fetching page IDs:", error);
//     }
//   };
 
 
 
//   const fetchPages = async (date, productId, zoneId) => {
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_IPCONFIG}api/reporter/pages-zones?date=${date}&productId=${productId}&zoneId=${zoneId}`
//       );
//       setPages(response.data);
//       setInitialPagesState(response.data.map(page => page.Active)); // Store initial Active states
//     } catch (error) {
//       console.error("Error fetching pages:", error);
//       throw error;
//     }
//   };
 
//   const fetchPagess = async (date, productId, pageId) => {
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_IPCONFIG}api/getPageDetails?date=${date}&productId=${productId}&pageId=${pageId}`
//       );
//       setPagess(response.data);
//       setInitialPagessState(response.data.map(page => page.ACTIVE)); // Store initial ACTIVE states
//     } catch (error) {
//       console.error("Error fetching pages:", error);
//       throw error;
//     }
//   };
 
//   const inputValue = selectedPageId !== "Select Page" ? ` ${selectedPageId}` : ` ${zone}`;
 
//   return (
//     <div className="main-content">
//       <fieldset className="f_fieldset">
//         <legend>Active Page</legend>
//         <Form>
//           <Row className="mb-3">
//             <Col xs={12} sm={6} md={2} className="mb-3">
//               <Form.Control type="date" className="form-select-sm custom-select" value={issueDate} onChange={handleDateChange} />
//             </Col>
//             <Col xs={12} sm={6} md={2} className="mb-3">
//               <Form.Select value={product} className="form-select-sm custom-select" onChange={handleProductChange}>
//                 <option value="">Select Product</option>
//                 {products.map((id, index) => (
//                   <option key={index} value={id}>{id}</option>
//                 ))}
//               </Form.Select>
//             </Col>
//             <Col xs={12} sm={6} md={2} className="mb-3">
//               <Form.Select value={zone} className="form-select-sm custom-select" onChange={handleZoneChange}>
//                 <option value="Select Zone">Select Zone</option>
//                 {zones.map((id, index) => (
//                   <option key={index} value={id}>{id}</option>
//                 ))}
//               </Form.Select>
//             </Col>
//             <Col xs={12} sm={6} md={2} className="mb-3">
//               <Form.Select value={edition} className="form-select-sm custom-select" onChange={handleEditionChange}>
//                 <option value="">Select Edition</option>
//                 <option value="1">1</option>
               
//               </Form.Select>
//             </Col>
//             <Col xs={12} sm={6} md={2} className="mb-3">
//               <Form.Select value={selectedPageId} className="form-select-sm custom-select" onChange={handlePageSelect}>
//                 <option value="all pages  ">Select Page</option>
//                 {pageIds.map((id, index) => (
//                   <option key={index} value={id}>{id}</option>
//                 ))}
//               </Form.Select>
//             </Col>
           
//             <Col xs={12} sm={6} md={2}>
//               <Button onClick={handleViewClick}>View</Button>
//             </Col>
//           </Row>
//         </Form>
//       </fieldset>
 
//       {viewMode && (
 
// <fieldset className="f_fieldset">
         
// <div style={{
// paddingTop: "10px",
// paddingRight: "15px",
// display: "flex",
// alignItems: "center",
// flexWrap: "wrap" // Allows wrapping for small screens
// }}>
//     <input
// type="text"
// value={new Date(issueDate).toLocaleDateString("en-GB", {
// day: "2-digit",
// month: "2-digit",
// year: "numeric"
// }).replace(/\//g, "-")}
// readOnly
// style={{
// border: "none",
// outline: "none",
// fontSize: "1.1rem",
// color: "#015BAB",
// // flex: "1  auto", // Allows the input to resize
// fontWeight: "800",
// maxWidth: "110px" // Ensures a minimum width for readability
// }}
// />
 
// <span  style={{
// // paddingRight: "5px",
// fontWeight: "bold",
// fontSize: "1.1rem" // Keeps the colon aligned with the text
// }}>:</span>
 
// <input
//         type="text"
//         value={inputValue}
//         readOnly
//         style={{
//           border: "none",
//           outline: "none",
//           fontSize: "1.1rem",
//           color: "#015BAB",
//           fontWeight: "800",
//           maxWidth: "220px" // Ensures a minimum width for readability
//         }}
//       />
// </div>
 
 
// <Form onSubmit={handleSubmit} className="text-center">
//   <div className="table-responsive" style={{ maxWidth: '80%', margin: '0 auto', paddingTop: "8px", paddingBottom: "20px" }}>
//   <Table style={{backgroundColor:"none"}} bordered className="table3">
//   <thead>
//     <tr>
//       <th>Page No</th>
//       <th>Zone</th>
//       <th>Page Name</th>
//       <th>Active</th>
//     </tr>
//   </thead>
//   <tbody>
//   {zone !== "Select Zone" && selectedPageId === "Select Page" ? (
//     pages.map((page, index) => (
//       <tr
//         key={index}
//         className={page.Active === 1 ? "table table-success table-striped" : "table-light"}
//       >
//         <td>{page.Page_Num}</td>
//         <td style={{ fontSize: "17px" }}>{page.Zone_id}</td>
//         <td style={{ fontSize: "17px" }}>{page.Page_id}</td>
       
//            <td><Form.Check
//               type="checkbox"
//               checked={page.Active === 1}
//               onChange={() => handleCheckboxChange(index)}
//             />
//             </td>
//       </tr>
//     ))
//   ) : (
//     selectedPageId !== "Select Page" &&
//     zone === "Select Zone" &&
//     pagess.map((page, index) => (
//       <tr
//         key={index}
//         className={page.ACTIVE === 1 ? "table table-success table-striped" : "table-light"}
//       >
//         <td>{page.Page_num}</td>
//         <td style={{ fontSize: "17px"}}>{page.Zone_id}</td>
//         <td style={{ fontSize: "17px" }}>{page.page_id}</td>
//         <td>
//           {/* Hide checkbox if page.page_id contains "ALL" */}
//           {!page.Zone_id.includes("ALL") && (
//             <Form.Check
//               type="checkbox"
//               checked={page.ACTIVE === 1}
//               onChange={() => handleCheckboxChange(index, true)}
//             />
//           )}
//         </td>
//       </tr>
//     ))
//   )}
// </tbody>
 
// </Table>
//           {(pages.length > 0 || pagess.length > 0) && (
//                 <div className="re_center-button text-center" style={{gap:"20px"}}>
//                   <Button type="submit" className="buttonNew1" style={{ marginTop: '2px' }} onClick={handleSubmit}>
//                     Submit
//                   </Button>
 
//                   <Button
//   type="button"
//   className="buttonNew1"
//   style={{ marginTop: '2px' }}
//   onClick={handleSelectUnselectAll}
// >
//   {selectAll ? "Unselect All" : "Select All"}
// </Button>
 
//                 </div>
//               )}
//             </div>
             
//               </Form>
//               </fieldset>
       
       
//       )}
 
 
//       <ConfirmationBox
//         show={showConfirmBox}
//         handleClose={() => setShowConfirmBox(false)}
//         handleConfirm={confirmCallback}
//         message="Are you sure you want to proceed with the changes?"
//       />
 
//       <AlertBox
//         show={showAlertBox}
//         handleClose={() => setShowAlertBox(false)}
//         message={alertMessage}
//       />
//     </div>
//   );
// };
 
// export default App;