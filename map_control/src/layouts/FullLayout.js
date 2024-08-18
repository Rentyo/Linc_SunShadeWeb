import { Outlet } from "react-router-dom";
import { Container } from "reactstrap";
import Header from "./Header";
import Sidebar from "./Sidebar";
import styles from "./FullLayout.module.css";
import { useState } from "react";

const FullLayout = () => {

  const [clickedIcon,setClickedIcon] = useState(null);
  

  const clickIcon = (device) => {
    setClickedIcon(device);
  }
  const nullIcon = (device) => {
    setClickedIcon(null);
  }
  

  return (
    <main>
      <div className={styles.wholeLayout}>
      <aside className={styles.sidebarArea} id="sidebarArea">
          <Sidebar 
            {...(clickedIcon!==null && {clickedMapIcon : clickedIcon, nullIcon : nullIcon})}/>
        </aside>
        <div className={styles.contentArea}>
          <Header/>
          <Container className={styles.container} fluid>
            <Outlet context= {{clickIcon}}/>
          </Container>
        </div>
      </div>
    </main>
  );
};

export default FullLayout;