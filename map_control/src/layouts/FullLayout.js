import { Outlet } from "react-router-dom";
import { Container } from "reactstrap";
import Header from "./Header";
import Sidebar from "./Sidebar";
import styles from "./FullLayout.module.css";

const FullLayout = () => {
  return (
    <main>
      <div className={styles.wholeLayout}>
      <aside className={styles.sidebarArea} id="sidebarArea">
          <Sidebar />
        </aside>
        <div className={styles.contentArea}>
          <Header />
          <Container className={styles.container} fluid>
            <Outlet />
          </Container>
        </div>
      </div>
    </main>
  );
};

export default FullLayout;