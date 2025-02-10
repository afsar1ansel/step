"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useMemo, useState } from "react";
import { HiDownload } from "react-icons/hi";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin6Line } from "react-icons/ri";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import styles from "./page.module.css";
import { FaSearch } from "react-icons/fa";
import Image from "next/image";
import photo from "/public/BG.png";

ModuleRegistry.registerModules([AllCommunityModule]);

const DataLogs = () => {
  return (
    <div
      style={{
        width: "80vw",
        height: "60vh",
        maxWidth: "1250px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        margin: "0 auto",
      }}
    >
      <div className={styles.hello}>
        <h2>All Recources</h2>
        <p>
          Access, monitor, and manage uploaded data logs with detailed
          processing history for better transparency and control.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchinput}
          />
        </div>
      </div>
      <div
        style={{
          height: "100%",
          width: "80vw",
          marginTop: "40px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            border: "solid 1px black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className={styles.card}>
            <div className={styles.cardImage}>
              <Image src={photo} alt="Logo" width={100} height={75} />
            </div>
            <div className={styles.cardText}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  gap: "40px",
                  borderBottom: "solid 1px black",
                  alignItems: "center",
                  width: "400px",
                }}
              >
                <p>5 jan 2024</p>
                <p>catogory</p>
                <p>name</p>
              </div>

              <h2 style={{fontSize: "20px", fontWeight: "600", marginTop: "10px"}}>Heading</h2>
              <p>Lorem ipsum dolor seius officia ipsa reprehenderit minus, enim quis explicabo. Qui.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataLogs;
