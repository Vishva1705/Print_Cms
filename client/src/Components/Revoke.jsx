import React, { useState, useEffect } from "react";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../Styles/Revoke.css";
import { Modal, Button, Form, Row, Col, Table } from 'react-bootstrap';
 
const App = () => {
  const getCurrentDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
 
  const initialIssueDate = getCurrentDate();
  const [issueDate, setIssueDate] = useState(initialIssueDate);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(localStorage.getItem("product") || "TAMILTH");
  const [zones, setZones] = useState([]);
  const [zone, setZone] = useState("");
  const [edition, setEdition] = useState("1");
  const [lastRefreshTime, setLastRefreshTime] = useState("");
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [pageData, setPageData] = useState([]);
  const [updateData, setUpdateData] = useState([]);
  const [alertShow, setAlertShow] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmShow, setConfirmShow] = useState(false);
  const [showTables, setShowTables] = useState(false);
 
  useEffect(() => {
    updateRefreshTime();
  }, []);
 
  useEffect(() => {
    if (issueDate) {
      fetchProductIds(issueDate);
    }
  }, [issueDate]);
 
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
    setZone("");
    setPages([]);
    setSelectedPages([]);
  };
 
  const handleProductChange = (e) => {
    const newProduct = e.target.value;
    setProduct(newProduct);
    localStorage.setItem("product", newProduct);
    setZone("");
    setPages([]);
  };
 
  const handleZoneChange = (e) => {
    const newZone = e.target.value;
    setZone(newZone);
  };
 
  const handleEditionChange = (e) => {
    const newEdition = e.target.value;
    setEdition(newEdition);
  };
 
  const updateRefreshTime = () => {
    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0];
    setLastRefreshTime(timeString);
  };
 
  const fetchProductIds = async (date) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/reporter/products-ids?date=${date}`);
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
      const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/reporter/zone-ids-by-product?date=${date}&productId=${productId}`);
      const zoneIds = response.data.map((item) => item.ZONE_ID);
      setZones(zoneIds);
      setZone(zoneIds[0] || "");
    } catch (error) {
      console.error("Error fetching zone IDs:", error);
    }
  };
 
  const fetchPages = async (date, productId, zoneId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/reporter/pages-zones?date=${date}&productId=${productId}&zoneId=${zoneId}`);
      const pagesData = response.data.map((item) => ({
        pageId: item.Page_id,
        zoneId: item.Zone_id,
        status: item.Status,
        Page_Name: item.Page_Name
      }));
      setPages(pagesData);
      setSelectedPages(pagesData.filter(page => page.status === 'desired_status').map(page => page.pageId));
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };
 
  const fetchRevokeData = async () => {
    try {
      const dataToSend = {
        issueDate: issueDate,
        zoneId: zone,
        productId: product
      };
 
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/revokePagez`, dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
 
      setPageData(response.data);
      setShowTables(true);
    } catch (error) {
      console.error('Error fetching page data:', error);
    }
  };
 
  const handleCheckboxChange = (pageName) => (e) => {
    const isChecked = e.target.checked;
 
    setUpdateData((prevUpdateData) => {
      const newUpdateData = prevUpdateData.filter(update => update.pageName !== pageName);
 
      if (isChecked) {
        newUpdateData.push({
          issueDate,
          zoneId: zone,
          productId: product,
          pageName: pageName,
          newStatus: 'C',
          newNoOfRevokes: 1
        });
      }
 
      return newUpdateData;
    });
  };
 
  const handleSubmit = async () => {
    try {
      console.log(updateData);
      if (!updateData || updateData.length === 0) {
        setAlertTitle('Alert');
        setAlertMessage('Please select the checkbox to revoke the page.');
        setAlertShow(true);
        return;
      }
 
      setConfirmShow(true);
    } catch (error) {
      console.error('Error updating pages:', error);
      setAlertTitle('Error');
      setAlertMessage('Failed to Revoke the pages');
      setAlertShow(true);
    }
  };
 
  const handleConfirmSubmit = async () => {
    try {
      for (const update of updateData) {
        await axios.post(`${process.env.REACT_APP_IPCONFIG}api/updaterevoke`, update, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
 
      setAlertTitle('Success');
      setAlertMessage('Pages Revoked successfully');
      setAlertShow(true);
      setUpdateData([]);
      setConfirmShow(false);
    } catch (error) {
      console.error('Error updating pages:', error);
      setAlertTitle('Error');
      setAlertMessage('Failed to Revoke the pages');
      setAlertShow(true);
      setConfirmShow(false);
    }
  };
 
  const handleCancelConfirm = () => {
    setConfirmShow(false);
  };
 
  const handleCloseAlert = () => {
    setAlertShow(false);
  };
 
  const statusF = pageData.filter(page => page.Status === 'F');
  const statusW = pageData.filter(page => page.Status === 'W');
 
  // Determine if tables are empty
  const isEmpty = statusF.length === 0 && statusW.length === 0;
 
  return (
    <div className="main-content">
<fieldset className="f_fieldset">
  <legend>Revoke Page</legend>
  <Row className="mb-3">
    <Col xs={6} sm={6} md={2} className="mb-3">
      <Form.Control
        type="date"
        className="form-select-sm custom-select"
        value={issueDate}
        onChange={handleDateChange}
      />
    </Col>
    <Col xs={6} sm={6} md={2} className="mb-3">
      <Form.Select
        aria-label="Product select example"
        value={product}
        onChange={handleProductChange}
        className="form-select-sm custom-select"
      >
        {products.length === 0 && (
          <option value="TAMILTH">TAMILTH</option>
        )}
        {products.map((prod) => (
          <option key={prod} value={prod}>
            {prod}
          </option>
        ))}
      </Form.Select>
    </Col>
    <Col xs={6} sm={6} md={2} className="mb-3">
      <Form.Select
        aria-label="Zone select example"
        value={zone}
        onChange={handleZoneChange}
        className="form-select-sm custom-select"
      >
        <option value="Select Zone">Select Zone</option>
        {zones.map((zon) => (
          <option key={zon} value={zon}>
            {zon}
          </option>
        ))}
      </Form.Select>
    </Col>
    <Col xs={6} sm={6} md={2} className="mb-3">
      <Form.Select
        aria-label="Edition select example"
        value={edition}
        onChange={handleEditionChange}
        className="form-select-sm custom-select"
      >
        <option value="1">1</option>
      </Form.Select>
    </Col>
    <Col xs={6} sm={6} md={2} className="mb-3 d-flex align-items-center">
      <Button className="re_btn" onClick={fetchRevokeData}>
        View
      </Button>
    </Col>
  </Row>
</fieldset>
 
 
      {showTables && ( // Conditionally render the tables
        <fieldset className="f_fieldset">
          <div>
           
  {/* Display the selected date and zone */}
  <div style={{ display: 'flex', alignItems: 'center', paddingTop: "10px", paddingRight: "15px" }}>
  <input
    type="text"
    value={new Date(issueDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).replace(/\//g, "-")}
    readOnly
    className="form-control-plaintext reduce-font-size"
    style={{
      color: "#015BAB",
      fontWeight: "800",
      maxWidth: "100px",
      marginRight: '10px', // Space between date input and colon
    }}
  />
 
  <span
    className="reduce-font-size"
    style={{
      fontWeight: "bold",
      display: "flex",
      alignItems: "center", // Vertically center the span
      margin: '0 10px', // Space around the colon
    }}
  >:</span>
 
  <input
    type="text"
    value={zone}
    readOnly
    className="form-control-plaintext responsive-font reduce-font-size"
    style={{
      color: "#015BAB",
      fontWeight: "800",
      maxWidth: "220px",
     
    }}
  />
</div>
 
 
 
<Row>
  <Col xs={12} md={6} className="mb-4 reduce-space-mobile reduce-font-mobile" style={{ maxWidth: '70%', margin: '0 auto', paddingTop: "20px", paddingBottom: "40px" }}>
    <div>
      <div>
        <h5>Revoke</h5>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Page No</th>
            <th>Page Name</th>
            <th>Revoke</th>
          </tr>
        </thead>
        <tbody className="Status">
          {statusF.map((page, index) => (
            <tr key={index}>
              <td>{page.Page_No}</td>
              <td>{page.Page_Name}</td>
              <td>
                <Form.Check
                  type="checkbox"
                  onChange={handleCheckboxChange(page.Page_Name)}
                  checked={updateData.some(update => update.pageName === page.Page_Name)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  </Col>
 
  <Col xs={12} md={6} className="mb-4 reduce-space-mobile reduce-font-mobile" style={{ maxWidth: '70%', margin: '0 auto', paddingTop: "20px", paddingBottom: "40px" }}>
    <div>
      <div>
        <h5>Working</h5>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Page No</th>
            <th>Page Name</th>
            <th>Finalize</th>
          </tr>
        </thead>
        <tbody className="Status">
          {statusW.map((page, index) => (
            <tr key={index}>
              <td>{page.Page_No}</td>
              <td>{page.Page_Name}</td>
              <td>
                <Form.Check type="checkbox" onChange={handleCheckboxChange(page.Page_Name)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  </Col>
</Row>
 
 
          </div>
          {/* Conditionally render the Submit button based on isEmpty */}
          {!isEmpty && (
  <div className="re_center-button text-center fixed-button-mobile">
    <Button type="submit" className="buttonNew1" style={{ marginTop: '2px' }} onClick={handleSubmit}>
      Submit
    </Button>
  </div>
)}
 
        </fieldset>
      )}
 
      {/* Alert Modal */}
      <Modal show={alertShow} onHide={handleCloseAlert}>
        <Modal.Body style={{ paddingBottom: '5px' }}>
          <p style={{ textAlign: 'center', fontSize: '18px' }}>
            {alertMessage}
          </p>
        </Modal.Body>
        <Modal.Footer style={{ justifyContent: 'center' }}>
          <Button variant="primary" onClick={handleCloseAlert}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
 
      {/* Confirm Modal */}
      <Modal show={confirmShow} onHide={() => setConfirmShow(false)}>
        <Modal.Body style={{ paddingBottom: '10px' }}>
          <p style={{ textAlign: 'center', fontSize: '18px' }}>Are you sure you want to revoke the pages?</p>
        </Modal.Body>
        <Modal.Footer style={{ justifyContent: 'center', paddingTop: '10px' }}>
          <Button variant="primary" onClick={handleConfirmSubmit}>
            Confirm
          </Button>
          <Button variant="secondary" onClick={() => setConfirmShow(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
 
export default App;

// import React, { useState, useEffect } from "react";
// import axios from 'axios';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import "../Styles/Revoke.css";
// import { Modal, Button, Form, Row, Col, Table } from 'react-bootstrap';
 
// const App = () => {
//   const getCurrentDate = () => {
//     const today = new Date();
//     today.setDate(today.getDate() + 1);
//     const yyyy = today.getFullYear();
//     const mm = String(today.getMonth() + 1).padStart(2, "0");
//     const dd = String(today.getDate()).padStart(2, "0");
//     return `${yyyy}-${mm}-${dd}`;
//   };
 
//   const initialIssueDate = getCurrentDate();
//   const [issueDate, setIssueDate] = useState(initialIssueDate);
//   const [products, setProducts] = useState([]);
//   const [product, setProduct] = useState(localStorage.getItem("product") || "TAMILTH");
//   const [zones, setZones] = useState([]);
//   const [zone, setZone] = useState("");
//   const [edition, setEdition] = useState("1");
//   const [lastRefreshTime, setLastRefreshTime] = useState("");
//   const [pages, setPages] = useState([]);
//   const [selectedPages, setSelectedPages] = useState([]);
//   const [pageData, setPageData] = useState([]);
//   const [updateData, setUpdateData] = useState([]);
//   const [alertShow, setAlertShow] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [confirmShow, setConfirmShow] = useState(false);
//   const [showTables, setShowTables] = useState(false);
 
//   useEffect(() => {
//     updateRefreshTime();
//   }, []);
 
//   useEffect(() => {
//     if (issueDate) {
//       fetchProductIds(issueDate);
//     }
//   }, [issueDate]);
 
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
//     setZone("");
//     setPages([]);
//     setSelectedPages([]);
//   };
 
//   const handleProductChange = (e) => {
//     const newProduct = e.target.value;
//     setProduct(newProduct);
//     localStorage.setItem("product", newProduct);
//     setZone("");
//     setPages([]);
//   };
 
//   const handleZoneChange = (e) => {
//     const newZone = e.target.value;
//     setZone(newZone);
//   };
 
//   const handleEditionChange = (e) => {
//     const newEdition = e.target.value;
//     setEdition(newEdition);
//   };
 
//   const updateRefreshTime = () => {
//     const now = new Date();
//     const timeString = now.toTimeString().split(" ")[0];
//     setLastRefreshTime(timeString);
//   };
 
//   const fetchProductIds = async (date) => {
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/reporter/products-ids?date=${date}`);
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
//       const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/reporter/zone-ids-by-product?date=${date}&productId=${productId}`);
//       const zoneIds = response.data.map((item) => item.ZONE_ID);
//       setZones(zoneIds);
//       setZone(zoneIds[0] || "");
//     } catch (error) {
//       console.error("Error fetching zone IDs:", error);
//     }
//   };
 
//   const fetchPages = async (date, productId, zoneId) => {
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/reporter/pages-zones?date=${date}&productId=${productId}&zoneId=${zoneId}`);
//       const pagesData = response.data.map((item) => ({
//         pageId: item.Page_id,
//         zoneId: item.Zone_id,
//         status: item.Status,
//         Page_Name: item.Page_Name
//       }));
//       setPages(pagesData);
//       setSelectedPages(pagesData.filter(page => page.status === 'desired_status').map(page => page.pageId));
//     } catch (error) {
//       console.error("Error fetching pages:", error);
//     }
//   };
 
//   const fetchRevokeData = async () => {
//     try {
//       const dataToSend = {
//         issueDate: issueDate,
//         zoneId: zone,
//         productId: product
//       };
 
//       const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/revokePagez`, dataToSend, {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
 
//       setPageData(response.data);
//       setShowTables(true);
//     } catch (error) {
//       console.error('Error fetching page data:', error);
//     }
//   };
 
//   const handleCheckboxChange = (pageName) => (e) => {
//     const isChecked = e.target.checked;
 
//     setUpdateData((prevUpdateData) => {
//       const newUpdateData = prevUpdateData.filter(update => update.pageName !== pageName);
 
//       if (isChecked) {
//         newUpdateData.push({
//           issueDate,
//           zoneId: zone,
//           productId: product,
//           pageName: pageName,
//           newStatus: 'C',
//           newNoOfRevokes: 1
//         });
//       }
 
//       return newUpdateData;
//     });
//   };
 
//   const handleSubmit = async () => {
//     try {
//       console.log(updateData);
//       if (!updateData || updateData.length === 0) {
//         setAlertTitle('Alert');
//         setAlertMessage('Please select the checkbox to revoke the page.');
//         setAlertShow(true);
//         return;
//       }
 
//       setConfirmShow(true);
//     } catch (error) {
//       console.error('Error updating pages:', error);
//       setAlertTitle('Error');
//       setAlertMessage('Failed to Revoke the pages');
//       setAlertShow(true);
//     }
//   };
 
//   const handleConfirmSubmit = async () => {
//     try {
//       for (const update of updateData) {
//         await axios.post(`${process.env.REACT_APP_IPCONFIG}api/updaterevoke`, update, {
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         });
//       }
 
//       setAlertTitle('Success');
//       setAlertMessage('Pages Revoked successfully');
//       setAlertShow(true);
//       setUpdateData([]);
//       setConfirmShow(false);
//     } catch (error) {
//       console.error('Error updating pages:', error);
//       setAlertTitle('Error');
//       setAlertMessage('Failed to Revoke the pages');
//       setAlertShow(true);
//       setConfirmShow(false);
//     }
//   };
 
//   const handleCancelConfirm = () => {
//     setConfirmShow(false);
//   };
 
//   const handleCloseAlert = () => {
//     setAlertShow(false);
//   };
 
//   const statusF = pageData.filter(page => page.Status === 'F');
//   const statusW = pageData.filter(page => page.Status === 'W');
 
//   // Determine if tables are empty
//   const isEmpty = statusF.length === 0 && statusW.length === 0;
 
//   return (
//     <div className="main-content">
//       <fieldset className="f_fieldset">
//         <legend>Revoke Page</legend>
//         <Row className="mb-3">
//           <Col xs={12} sm={6} md={2} className="mb-3">
//             <Form.Control
//               type="date"
//               className="form-select-sm custom-select"
//               value={issueDate}
//               onChange={handleDateChange}
//             />
//           </Col>
//           <Col xs={12} sm={6} md={2} className="mb-3">
//             <Form.Select
//               aria-label="Product select example"
//               value={product}
//               onChange={handleProductChange}
//               className="form-select-sm custom-select"
//             >
//               {products.length === 0 && (
//                 <option value="TAMILTH">TAMILTH</option>
//               )}
//               {products.map((prod) => (
//                 <option key={prod} value={prod}>
//                   {prod}
//                 </option>
//               ))}
//             </Form.Select>
//           </Col>
//           <Col xs={12} sm={6} md={2} className="mb-3">
//             <Form.Select
//               aria-label="Zone select example"
//               value={zone}
//               onChange={handleZoneChange}
//               className="form-select-sm custom-select"
//             >
//               <option value="Select Zone">Select Zone</option>
//               {zones.map((zon) => (
//                 <option key={zon} value={zon}>
//                   {zon}
//                 </option>
//               ))}
//             </Form.Select>
//           </Col>
//           <Col xs={12} sm={6} md={2} className="mb-3">
//             <Form.Select
//               aria-label="Edition select example"
//               value={edition}
//               onChange={handleEditionChange}
//               className="form-select-sm custom-select"
//             >
//               <option value="1">1</option>
//             </Form.Select>
//           </Col>
//           <Col xs={12} sm={6} md={2} className="mb-3 d-flex align-items-center">
//             <Button className="re_btn" onClick={fetchRevokeData}>
//               View
//             </Button>
//           </Col>
//         </Row>
//       </fieldset>
 
//       {showTables && ( // Conditionally render the tables
//         <fieldset className="f_fieldset">
//           <div>
           
//               {/* Display the selected date and zone */}
             
//               <div style={{paddingTop:"10px",paddingRight:"15px"}}>
//               <input
//   type="text"
//   value={new Date(issueDate).toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric"
//   }).replace(/\//g, "-")}
//   readOnly
//   style={{
//     border: "none",
//     outline: "none",
//     fontSize: "1.1rem",
//     color: "#015BAB",
//     fontWeight: "800",
//     maxWidth: "110px" // Ensures a minimum width for readability
//   }}
//   />
 
//     <span  style={{
//       fontWeight: "bold",
//       fontSize: "1.5rem" // Keeps the colon aligned with the text
//     }}>:</span>
 
//   <input
//     type="text"
//     value={zone}
//     readOnly
//     style={{
//       border: "none",
//       outline: "none",
//       fontSize: "1.1rem",
//       color: "#015BAB",
//       fontWeight: "800",
//       maxWidth: "220px" // Ensures a minimum width for readability
//     }}
//   />
// </div>
 
//               <Row>
//               <Col xs={12} md={6} className="mb-4" style={{ maxWidth: '70%', margin: '0 auto', paddingTop: "20px", paddingBottom: "40px", paddingLeft: "10px" }}>
//                 <div>
//                   <div>
//                     <h5>Finalised</h5>
//                   </div>
//                   <Table striped bordered hover>
//                     <thead>
//                       <tr>
//                         <th>Page No</th>
//                         <th>Page Name</th>
//                         <th>Revoke</th>
//                       </tr>
//                     </thead>
//                     <tbody className="Status">
//                       {statusF.map((page, index) => (
//                         <tr key={index}>
//                           <td>{page.Page_No}</td>
//                           <td>{page.Page_Name}</td>
//                           <td>
//                             <Form.Check
//                               type="checkbox"
//                               onChange={handleCheckboxChange(page.Page_Name)}
//                               checked={updateData.some(update => update.pageName === page.Page_Name)}
//                             />
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>
//                 </div>
//               </Col>
//               <Col xs={12} md={6} className="mb-4" style={{ maxWidth: '70%', margin: '0 auto', paddingTop: "20px", paddingBottom: "40px" }}>
//                 <div>
//                   <div>
//                     <h5>Working</h5>
//                   </div>
 
//                   <Table striped bordered hover>
//                     <thead>
//                       <tr>
//                         <th>Page No</th>
//                         <th>Page Name</th>
//                         <th>Finalize</th>
//                       </tr>
//                     </thead>
//                     <tbody className="Status">
//                       {statusW.map((page, index) => (
//                         <tr key={index}>
//                           <td>{page.Page_No}</td>
//                           <td>{page.Page_Name}</td>
//                           <td>
//                             <Form.Check type="checkbox" onChange={handleCheckboxChange(page.Page_Name)} />
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>
 
//                 </div>
//               </Col>
//             </Row>
//           </div>
//           {/* Conditionally render the Submit button based on isEmpty */}
//           {!isEmpty && (
//             <div className="re_center-button text-center">
//               <Button type="submit" className="buttonNew1" style={{ marginTop: '2px' }} onClick={handleSubmit}>
//                 Submit
//               </Button>
//             </div>
//           )}
//         </fieldset>
//       )}
 
//       {/* Alert Modal */}
//       <Modal show={alertShow} onHide={handleCloseAlert}>
//         <Modal.Body style={{ paddingBottom: '5px' }}>
//           <p style={{ textAlign: 'center', fontSize: '18px' }}>
//             {alertMessage}
//           </p>
//         </Modal.Body>
//         <Modal.Footer style={{ justifyContent: 'center' }}>
//           <Button variant="primary" onClick={handleCloseAlert}>
//             OK
//           </Button>
//         </Modal.Footer>
//       </Modal>
 
//       {/* Confirm Modal */}
//       <Modal show={confirmShow} onHide={() => setConfirmShow(false)}>
//         <Modal.Body style={{ paddingBottom: '10px' }}>
//           <p style={{ textAlign: 'center', fontSize: '18px' }}>Are you sure you want to revoke the pages?</p>
//         </Modal.Body>
//         <Modal.Footer style={{ justifyContent: 'center', paddingTop: '10px' }}>
//           <Button variant="primary" onClick={handleConfirmSubmit}>
//             Confirm
//           </Button>
//           <Button variant="secondary" onClick={() => setConfirmShow(false)}>
//             Cancel
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };
 
// export default App;