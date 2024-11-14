import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { FaBars, FaUser, FaImage } from "react-icons/fa";
import { IoCreateSharp, IoArrowRedoCircle, IoLockOpen } from "react-icons/io5";
import { FaRectangleList } from "react-icons/fa6";
import { RiPagesFill, RiAdminFill } from "react-icons/ri";
import {
  MdAssignmentTurnedIn,
  MdOutlineRestorePage,
  MdOutlineOpenInBrowser,
} from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import HTTimage from "../Assest/HTTimage.png";
import "../Styles/Sidebar.css";

const Sidebar = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  const handleToggle = () => setShow(!show);
  const handleClose = () => setShow(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const shouldShowSidebar = true;
    if (shouldShowSidebar) {
      setShow(true);
    }
  }, []);

  const USER_ROLES_WITH_Story = [
    "SPSUBEDT",
    "EDT",
    "SUP",
    "SPEDT",
    "CHRPT",
    "RPT",
  ];
  const USER_ROLES_WITH_ASSIGN = ["SPSUBEDT", "EDT", "SUP", "SPEDT"];
  const USER_ROLES_WITH_ASSIGN_PREVIEW = [
    "SPSUBEDT",
    "EDT",
    "SUP",
    "SPEDT",
    "CHRPT",
    "PRD",
  ];
  const USER_ROLES_WITH_Revoke = ["SUP", "PRD"];
  const USER_ROLES_WITH_dashboard = ["SUP"];

  return (
    <>
      <button className="btn-toggle" onClick={handleToggle}>
        <FaBars />
      </button>

      <div className={`sidebar ${show ? "show" : ""}`}>
        <div className="sidebar-header">
          <img src={HTTimage} alt="HTT Logo" />
          {/* <button className="btn-close" onClick={handleClose}>
            &times;
          </button> */}
        </div>
        <div
          className="sidebar-body"
          style={{ fontFamily: "Franklin Gothic, sans-serif" }}
        >
          <nav className="nav flex-column">
            {USER_ROLES_WITH_Story.includes(userRole) && (
              <>
                <NavLinkWithActive to="/add-article" onClick={handleClose}>
                  <IoCreateSharp size={33} className="custom-icon" />
                  <div className="icon-style">Story Creation</div>
                </NavLinkWithActive>

                <NavLinkWithActive to="/article-view" onClick={handleClose}>
                  <FaRectangleList size={33} className="custom-icon" />
                  <div className="icon-style">Stories List</div>
                </NavLinkWithActive>
              </>
            )}

            <NavLinkWithActive to="/imageconverter" onClick={handleClose}>
              <FaImage size={33} className="custom-icon" />
              <div className="icon-style">IMG Converter</div>
            </NavLinkWithActive>

            {USER_ROLES_WITH_ASSIGN.includes(userRole) && (
              <div
                onClick={() =>
                  window.open("http://192.168.90.33:7156/", "_blank")
                }
                className="nav-link"
                style={{
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <MdAssignmentTurnedIn size={33} className="custom-icon" />
                <div className="icon-style">Story Assign</div>
              </div>
            )}

            {USER_ROLES_WITH_ASSIGN_PREVIEW.includes(userRole) && (
              <>
                {/* <div
                  onClick={() =>
                    window.open("/thumbnail", "_blank")
                  }
                  className="nav-link"
                  style={{
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <RiPagesFill size={33} className="custom-icon" />
                  <div className="icon-style">Page Preview</div>
                </div> */}

                <div
                  onClick={() => window.open("/pagepreview", "_blank")}
                  className="nav-link"
                  style={{
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <RiPagesFill size={33} className="custom-icon" />
                  <div className="icon-style">Page Preview</div>
                </div>
              </>
            )}

            {USER_ROLES_WITH_Revoke.includes(userRole) && (
              <>
                <NavLinkWithActive to="/revoke" onClick={handleClose}>
                  <IoArrowRedoCircle size={33} className="custom-icon" />
                  <div className="icon-style">Revoke</div>
                </NavLinkWithActive>

                <NavLinkWithActive to="/active-page" onClick={handleClose}>
                  <IoLockOpen size={33} className="custom-icon" />
                  <div className="icon-style">Activate </div>
                </NavLinkWithActive>
              </>
            )}

            {USER_ROLES_WITH_dashboard.includes(userRole) && (
              <div
                onClick={() =>
                  window.open("http://192.168.90.132:8000/", "_blank")
                }
                className="nav-link"
                style={{
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <RiAdminFill size={33} className="custom-icon" />
                <div className="icon-style">User Master</div>
              </div>
            )}

            {USER_ROLES_WITH_dashboard.includes(userRole) && (
              <div
                onClick={() =>
                  window.open("http://192.168.90.33:7156/PressFtp", "_blank")
                }
                className="nav-link"
                style={{
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <RiAdminFill size={33} className="custom-icon" />
                <div className="icon-style">Press FTP</div>
              </div>
            )}

            <NavLinkWithActive to="/profilepage" onClick={handleClose}>
              <FaUser size={33} className="custom-icon" />
              <div className="icon-style">Profile</div>
            </NavLinkWithActive>

            <Button className="btn-logout" onClick={handleLogout}>
              Logout
            </Button>
          </nav>
        </div>
      </div>
      <div
        className={`overlay ${show ? "show" : ""}`}
        onClick={handleClose}
      ></div>
    </>
  );
};

const NavLinkWithActive = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`nav-link ${isActive ? "active" : ""}`}
    >
      {children}
    </Link>
  );
};

export default Sidebar;
