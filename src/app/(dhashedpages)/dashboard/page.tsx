// import Image from "next/image";
import styles from "./page.module.css";

import { TbDeviceAnalytics } from "react-icons/tb";
import { RiUser3Line } from "react-icons/ri";
import { IoMdPaper } from "react-icons/io";
import { VscFileSymlinkDirectory } from "react-icons/vsc";





export default function Home() {
  return (
    <div className={styles.page}>
      {/* <div className={styles.hello}>
        <h3>👋 Hello, Admin</h3>
        <p>Here is all your analytics overview</p>
      </div> */}

      <div className={styles.statesContainer}>
        <div className={styles.stateBox}>
          <div className={styles.stateText}>
            <p>TOTAL STUDENTS</p>
            <h2>3990</h2>
            <p className={styles.measure}>↑ 3.5% Increase</p>
          </div>
          <div className={styles.stateIcon}>
            <RiUser3Line />
          </div>
        </div>

        <div className={styles.stateBox}>
          <div className={styles.stateText}>
            <p>COURSES</p>
            <h2>110</h2>
            <p className={styles.measure}>20 Unpaid , 90 paid</p>
          </div>
          <div className={styles.stateIcon}>
            <TbDeviceAnalytics />
          </div>
        </div>

        <div className={styles.stateBox}>
          <div className={styles.stateText}>
            <p>TESTS</p>
            <h2>300</h2>
            <p className={styles.measure}>240 under Course, 60 under misc</p>
          </div>
          <div className={styles.stateIcon}>
            <IoMdPaper />
          </div>
        </div>

        <div className={styles.stateBox}>
          <div className={styles.stateText}>
            <p>RESOURCES</p>
            <h2>1460</h2>
            <p className={styles.measure}>1000 under Course, 450 under misc</p>
          </div>
          <div className={styles.stateIcon}>
            <VscFileSymlinkDirectory />
          </div>
        </div>
      </div>

      <div className={styles.chartBox}>
        <h2>Business Metrics</h2>
      </div>

      {/* <div className={styles.charts}>
        <div className={styles.bChart}>
          <div>
            <p style={{ marginBottom: "4px" }}>Data Uploads</p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <h1>159</h1> <p style={{ color: "green" }}>230%</p>
            </div>
          </div>
          <BarChart />
        </div>
        <div className={styles.bChart}>
          <div>
            <p style={{ marginBottom: "4px" }}>Reports Generated</p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <h1>09</h1> <p style={{ color: "green" }}>90%</p>
            </div>
          </div>
          <LineChart />
        </div>
        <div className={styles.bChart}>
          <div>
            <p style={{ marginBottom: "60px" }}>Device Activity</p>
          </div>
          <PieChart />
        </div>
      </div> */}
    </div>
  );
}
