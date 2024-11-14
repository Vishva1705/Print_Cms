import React, { useState, useEffect } from "react";
import pageNotFound from "../Assest/pageNotFound1.pdf";
import "../Styles/Thumbnail.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
 
const getCurrentDate = () => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
 
const Thumbnail = () => {
  const navigate = useNavigate();
  const emp_id = localStorage.getItem("emp_id");
  const emp_name = localStorage.getItem("emp_name");
  const initialIssueDate = getCurrentDate();
  const [issueDate, setIssueDate] = useState(initialIssueDate);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState("TAMILTH");
  const [zones, setZones] = useState([]);
  const [zone, setZone] = useState("All");
  const [edition, setEdition] = useState("1");
  const [lastRefreshTime, setLastRefreshTime] = useState("");
  const [pages, setPages] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [plan, setPlan] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [initialThumbnails, setInitialThumbnails] = useState([]);
 
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
 
  useEffect(() => {
    if (emp_id) {
      getDetail();
    } else {
      navigate("/");
    }
  }, [emp_id, navigate]);
 
  const updateRefreshTime = () => {
    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0];
    setLastRefreshTime(timeString);
  };
 
  useEffect(() => {
    updateRefreshTime();
  }, []);
 
  useEffect(() => {
      fetchProductIds(issueDate);
  }, []);
  useEffect(() => {
    if (product) {
      fetchZoneIds(issueDate, product).then((zoneIds) => {
        if (zoneIds.length > 0) {
          setZone(zoneIds[0]);
          // fetchPages(issueDate, product, zoneIds[0]);
        }
      });
    }
  }, []);
 
  useEffect(() => {
    if (zone) {
      fetchPages(issueDate, product, zone);
    } else {
      fetchPagess(issueDate, product);
    }
  }, [zone]);
 
  const handleDateChange = (e) => {
    setThumbnails([]);
    const newDate = e.target.value;
    setIssueDate(newDate);
    localStorage.setItem("issueDate", newDate);
    // setProduct("");
    setZone("");
    setPages([]);
    setSelectedPage("");
  };
 
  const handleProductChange = (e) => {
    setProduct(e.target.value);
    localStorage.setItem("product", e.target.value);
    setZone("");
    setPages([]);
    setThumbnails([]);
    setPlan([]);
    setSelectedPage("");
  };
 
  const handleZoneChange = (e) => {
    setInitialThumbnails([]);
    setZone(e.target.value);
    localStorage.setItem("zone", e.target.value);
    setPages([]);
    setThumbnails([]);
    setPlan([]);
    setSelectedPage("");
  };
 
  const handleEditionChange = (e) => {
    setEdition(e.target.value);
    localStorage.setItem("edition", e.target.value);
    setThumbnails([]);
    setPlan([]);
    setSelectedPage("");
  };
 
  const handlePageSelect = (e) => {
    setSelectedPage(e.target.value);
    localStorage.setItem("page", e.target.value);
  };
 
  const fetchProductIds = async (date) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/products-ids?date=${date}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const productIds = data.map((item) => item.PRODUCT_ID);
      setProducts(productIds);
      return productIds;
    } catch (error) {
      console.error("Error fetching product IDs:", error);
      return [];
    }
  };
 
  const fetchZoneIds = async (date, productId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/zone-ids-by-product?date=${date}&productId=${productId}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const zoneIds = data.map((item) => item.ZONE_ID);
      setZones(zoneIds);
      return zoneIds;
    } catch (error) {
      console.error("Error fetching zone IDs:", error);
      return [];
    }
  };
 
  const fetchPages = async (date, productId, zoneId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/pages-zones?date=${date}&productId=${productId}&zoneId=${zoneId}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const pages = data.map((item) => ({
        pageId: item.Page_id,
        zoneId: item.Zone_id,
      }));
      console.log("pages", pages);
      setPages(pages);
      // fetchThumbnails(date, zoneId, productId, pages);
      // fetchPDFs(date, zoneId, productId, pages);
      fetchPlan(date, zoneId, productId);
      return pages;
    } catch (error) {
      console.error("Error fetching pages:", error);
      return [];
    }
  };
 
  const fetchPagess = async (date, productId, zoneId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/pages-withoutzones?date=${date}&productId=${productId}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const pages = data.map((item) => ({
        pageId: item.Page_Name,
      }));
      setPages(pages);
      return pages;
    } catch (error) {
      console.error("Error fetching pages:", error);
      return [];
    }
  };
 
  const fetchPlan = async (issueDate, zoneId, productId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/plandata?date=${issueDate}&zoneId=${zoneId}&productId=${productId}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const plan = data.map((item) => ({
        pageNumbers: item.Page_No,
        pageNames: item.Page_Name,
        pageStatus: item.Status,
        pageUser: item.use_user,
      }));
      setPlan(plan);
      return plan;
    } catch (error) {
      console.error("Error fetching plans:", error);
      return [];
    }
  };
 
  const formatDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };
 
  const handleListClick = async () => {
    if (selectedPage === "") {
      // console.log("empty pageno");
 
      setThumbnails([]);
      fetchThumbnails(issueDate, zone, product, pages);
    } else {
      const formattedDate = formatDate(issueDate);
 
      if (!zone || zone.length === 0) {
        // Assuming 'zones' is an array containing all available zones
        const imageUrls = zones.map(
          (singleZone) =>
            `${process.env.REACT_APP_IPCONFIG}api/reporter/pdf?date=${formattedDate}&zone=${singleZone}&product=${product}&page=${selectedPage}&edition=${edition}`
        );
 
        setThumbnails("");
 
        try {
          const thumbnails = await Promise.all(
            imageUrls.map(async (url, index) => {
              // Added index parameter to map function
              try {
                const response = await fetch(url);
                if (response.ok) {
                  const lastModified = response.headers.get("Last-Modified");
                  // const modifiedTime = lastModified ? extractTime(lastModified) : null;
 
                  const gmtDate = new Date(lastModified);
 
                  // Step 2: Convert to IST by adding 5 hours and 30 minutes (19800 seconds)
                  const options = {
                    timeZone: "Asia/Kolkata",
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                    hour12: false,
                  };
                  const istDate = new Intl.DateTimeFormat(
                    "en-IN",
                    options
                  ).format(gmtDate);
 
                  return {
                    src: response.url,
                    alt: `${selectedPage}`,
                    modifiedDate: istDate,
                    zone: zones[index], // Add singleZone value to response object
                  };
                } else {
                  console.error(
                    `Error fetching thumbnail for page ${selectedPage}: ${response.statusText}`
                  );
                  return null;
                }
              } catch (error) {
                console.error(
                  `Error fetching thumbnail for page ${selectedPage}:`,
                  error
                );
                return null;
              }
            })
          );
 
          const filteredThumbnails = thumbnails.filter(
            (thumbnail) => thumbnail !== null
          );
          setThumbnails(filteredThumbnails);
         
        } catch (error) {
          console.error("Error fetching thumbnails:", error);
        }
      } else {
        const imageUrl = `${process.env.REACT_APP_IPCONFIG}api/reporter/pdf?date=${formattedDate}&zone=${zone}&product=${product}&page=${selectedPage}&edition=${edition}`;
        setThumbnails("");
        try {
          const response = await fetch(imageUrl);
          if (response.ok) {
            const lastModified = response.headers.get("Last-Modified");
            const gmtDate = new Date(lastModified);
 
            // Step 2: Convert to IST by adding 5 hours and 30 minutes (19800 seconds)
            const options = {
              timeZone: "Asia/Kolkata",
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: false,
            };
            const istDate = new Intl.DateTimeFormat("en-IN", options).format(
              gmtDate
            );
            // console.log("Last-Modified in IST:", istDate);
            setThumbnails([
              {
                src: response.url,
                alt: `${selectedPage}`,
                modifiedDate: istDate,
                zone: `${zone}`,
              },
            ]);
          } else {
            console.error(
              `Error fetching thumbnail for page ${selectedPage}: ${response.statusText}`
            );
          }
        } catch (error) {
          console.error(
            `Error fetching thumbnail for page ${selectedPage}:`,
            error
          );
        }
      }
    }
  };
 
  const fetchThumbnails = async (issueDate, zone, product, pages) => {
    if (!pages || pages.length === 0) return;
    const formattedDate = formatDate(issueDate);
 
    if(!zone){
        alert("Please select Zone");
    }
 
    try {
      const thumbnails = await Promise.all(
        pages.map(async (page) => {
          const imageUrl = `${process.env.REACT_APP_IPCONFIG}api/reporter/pdf?date=${formattedDate}&zone=${zone}&product=${product}&page=${page.pageId}&edition=${edition}`;
 
          try {
            const response = await fetch(imageUrl);
            if (response.ok) {
              const lastModified = response.headers.get("Last-Modified");
              const gmtDate = new Date(lastModified);
              const options = {
                timeZone: "Asia/Kolkata",
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: false,
              };
              const istDate = new Intl.DateTimeFormat("en-IN", options).format(
                gmtDate
              );
              return {
                src: response.url,
                alt: `${page.pageId}`,
                zone: `${zone}`,
                modifiedDate: istDate,
              };
            } else {
              console.error(
                `Error fetching thumbnail for page ${page.pageId}: ${response.statusText}`
              );
              return null;
            }
          } catch (error) {
            console.error(
              `Error fetching thumbnail for page ${page.pageId}:`,
              error
            );
            return null;
          }
        })
      );
 
      const filteredThumbnails = thumbnails.filter(
        (thumbnail) => thumbnail !== null
      );
      setThumbnails(filteredThumbnails);
      console.log(filteredThumbnails);
      setInitialThumbnails(filteredThumbnails);
    } catch (error) {
      console.error("Error fetching thumbnails:", error);
    }
  };
 
  const fetchPDFs = async (imageUrls) => {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) return;
 
    try {
      await Promise.all(
        imageUrls.map(async (imageUrl) => {
          try {
            // Validate URL
            const url = new URL(imageUrl);
 
            // Construct URL for fetching the PDF
            const pdfUrl = `${
              process.env.REACT_APP_IPCONFIG
            }api/reporter/pdf?date=${url.searchParams.get(
              "date"
            )}&zone=${url.searchParams.get(
              "zone"
            )}&product=${url.searchParams.get(
              "product"
            )}&page=${url.searchParams.get(
              "page"
            )}&edition=${url.searchParams.get("edition")}`;
 
            const response = await fetch(pdfUrl);
            if (response.ok) {
              const pdfUrl = response.url;
              window.open(pdfUrl, "_blank"); // Open the PDF in a new tab
            } else {
              console.error(
                `Failed to fetch PDF for URL ${pdfUrl}. Status: ${response.status}, ${response.statusText}`
              );
            }
          } catch (error) {
            console.error(`Error fetching PDF for URL ${imageUrl}:`, error);
          }
        })
      );
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    }
  };
 
  const handleThumbnailClick = (imageUrl) => {
    if (imageUrl) {
      fetchPDFs([imageUrl]);
    } else {
      alert("No image found");
    }
  };
 
  useEffect(() => {
    if (initialThumbnails.length > 0 && plan.length > 0) {
      arrangeThumbnailsAccordingToPlan();
    }
  }, [initialThumbnails, plan]);
 
  const thumbstatus = [
    { Status_Code: "N", Status_Name: "Not Opened" },
    { Status_Code: "F", Status_Name: "Finalized" },
    { Status_Code: "W", Status_Name: "Working" },
    { Status_Code: "E", Status_Name: "E-Release" },
    { Status_Code: "R", Status_Name: "Release" },
  ];
 
  const getThumbStatus = (pageStatus) => {
    const status = thumbstatus.find((item) => item.Status_Code === pageStatus);
    return status ? status.Status_Name : "Unknown Status";
  };
 
  const [usersData, setUsersData] = useState([]);
 
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IPCONFIG}api/article/articleuserids`
        );
        setUsersData(response.data);
        // console.log("userData", response.data);
      } catch (error) {
        console.error(error);
      }
    };
 
    fetchUsersData();
  }, []);
 
  const getUserName = (pageUser) => {
    const user = usersData.find((item) => item.User_ID === pageUser);
    return user ? user.User_name : "";
  };
 
  const arrangeThumbnailsAccordingToPlan = () => {
    const arrangedThumbnails = plan.map((planItem) => {
      const matchingThumbnail = initialThumbnails.find((thumbnail) =>
        thumbnail.alt.includes(planItem.pageNames)
      );
 
      if (matchingThumbnail) {
        // If a matching thumbnail is found, add the status and user properties
        return {
          ...matchingThumbnail,
          status: getThumbStatus(planItem.pageStatus),
          user: getUserName(planItem.pageUser), // Add user property
        };
      }
 
      // If no matching thumbnail is found, return a placeholder with status and user
      return {
        src: pageNotFound,
        alt: `${planItem.pageNames} `,
        status: getThumbStatus(planItem.pageStatus), // Add status property
        user: getUserName(planItem.pageUser), // Add user property
      };
    });
 
    console.log("arrangedThumbnails", arrangedThumbnails);
    setThumbnails(arrangedThumbnails);
  };
 
 
  return (
    <div className="main-content">
      <div className="t-container">
        <h1>Page Preview</h1>
        <div className="t-input-container">
          <div className="t-form-group">
            <label>Issue Date:</label>
            <input
              type="date"
              className="t-date-input"
              value={issueDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="t-form-group">
            <label>Product:</label>
            <select value={product} onChange={handleProductChange}>
              <option value="">Select Product</option>
              {products.map((prod) => (
                <option key={prod} value={prod}>
                  {prod}
                </option>
              ))}
            </select>
          </div>
          <div className="t-form-group">
            <label>Zone:</label>
            <select value={zone} onChange={handleZoneChange}>
              <option value="">Select Zone</option>
              {zones.map((zon) => (
                <option key={zon} value={zon}>
                  {zon}
                </option>
              ))}
            </select>
          </div>
          <div className="t-form-group">
            <label>Edition:</label>
            <select value={edition} onChange={handleEditionChange}>
              <option value="1">1</option>
            </select>
          </div>
          <div className="t-form-group">
            <label>Select Page:</label>
            <select value={selectedPage} onChange={handlePageSelect}>
              <option value="all page">Select Page</option>
              {pages.map((page) => (
                <option key={page.pageId} value={page.pageId}>
                  {page.pageId}
                </option>
              ))}
            </select>
          </div>
          <div className="t-form-group1">
            <button className="t-list_button" onClick={handleListClick}>
              List
            </button>
          </div>
        </div>
        <div className="t-last-refresh">
          Last Refresh Page:{" "}
          <span className="t-refresh-time">{lastRefreshTime}</span>
        </div>
        <div className="t-output-container">
          <div className="t-thumbnails-grid">
            {Array.isArray(thumbnails) ? (
              thumbnails.map((thumbnail, index) => (
                <div
                  key={index}
                  className="t-thumbnail"
                  onClick={() => handleThumbnailClick(thumbnail.src)}
                >
                    <div style={{height:'10%', textAlign:'center', fontWeight:'bolder', fontStyle:'italic',backgroundColor: '#015BAB',color: 'white',paddingTop:'5%'}}>{thumbnail.zone}</div>
                  <iframe
                    src={`${thumbnail.src}#toolbar=0`}
                    title={thumbnail.alt}
                    className="pdf-iframe"
                 
                  ></iframe>
                  <div className="t-thumbnail-caption">
                    <span>{thumbnail.alt}</span>
                    <span>{thumbnail.modifiedDate}</span>
                    {/* <span>{thumbnail.zone}</span> */}
                    <div>
                      <span>
                        {thumbnail.status} - {thumbnail.user}
                      </span>
                    </div>
                  </div>
                  <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent', // Transparent background
          zIndex: 1, // Ensure the overlay is on top of the iframe
        }}
      />
    </div>
              ))
            ) : (
              <div
                className="t-thumbnail"
                onClick={() => handleThumbnailClick(thumbnails)}
              >
                <iframe
                  src={thumbnails.src}
                  title="Thumbnail"
                  className="pdf-iframe"
                ></iframe>
                <div className="t-thumbnail-caption">
                  <span>Thumbnail</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Thumbnail;
 
 