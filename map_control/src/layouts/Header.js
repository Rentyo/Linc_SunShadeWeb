import React from "react";
import { Link } from "react-router-dom";
import { ToastContainer } from 'react-toastify';    
import 'react-toastify/dist/ReactToastify.css';   
import {
  Navbar,
  Collapse,
  Nav,
  NavItem,
  NavbarBrand,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Dropdown,
  Button,
} from "reactstrap";
import { ReactComponent as LogoWhite } from "../assets/lettuce_White.svg";
import icon_user from "../assets/lettuce.png";
import styles from "./Header.module.css";
import styles_Full from "./FullLayout.module.css";
import { PiList } from "react-icons/pi";
import "bootstrap/dist/css/bootstrap.min.css";

function Header() {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const showMobilemenu = () => {
    document
      .getElementById("sidebarArea")
      .classList.toggle(styles_Full.showSidebar);
  };
  return (
    <Navbar color="dark" dark expand="md">
      <div className={styles.leftBtns}>
        <NavbarBrand href="/" className={styles.listBtn}>
          <LogoWhite />
        </NavbarBrand>
        <Button className={styles.listBtn} onClick={() => showMobilemenu()}>
          <PiList size="1.5em" />
        </Button>
      </div>
      <ToastContainer
        autoClose={2000}
        hideProgressBar
        pauseOnHover = {false}
      />
      <Collapse navbar>
        <Nav className="me-auto" navbar>
          <NavItem>
            <Link to="/" className="nav-link">
              Home
            </Link>
          </NavItem>
        </Nav>
        {/* <Button className="btn btn-info btn-sm">{isLoggedIn? dept + "관리자" : "사용자명"}</Button> */}
        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
          <DropdownToggle color="dark">
            <img
              src={icon_user}
              alt="profile"
              className={styles.user_icon}
              width="30"
            ></img>
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Info</DropdownItem>
            <DropdownItem>My Account</DropdownItem>
            <DropdownItem>Edit Profile</DropdownItem>
            <DropdownItem divider />
            <DropdownItem>Logout</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </Collapse>
    </Navbar>
  );
}

export default Header;
