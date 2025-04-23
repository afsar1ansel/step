"use client";

import React, { useState } from "react";
import styles from "./page.module.css";



const TestDetails = () => {

   const [selectedFramework, setSelectedFramework] = useState("");

  const frameworks = [
    { label: "React.js", value: "react" },
    { label: "Vue.js", value: "vue" },
    { label: "Angular", value: "angular" },
    { label: "Svelte", value: "svelte" },
  ];


  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFramework(event.target.value);
  };

  return (
    <div style={{ width: "80vw", height: "60vh", maxWidth: "1250px" }}>
      <div
        style={{
          height: "100%",
          width: "80vw",
          marginTop: "40px",
        }}
      >
        <div
          style={{
            height: "60px",
            width: "100%",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px 10px 0px 0px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ fontSize: "16px", fontWeight: "600" }}>Test Details</p>
          <select
            value={selectedFramework}
            onChange={handleSelectChange}
            style={{
              width: "200px",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          >
            <option value="">Select framework</option>
            {frameworks.map((framework) => (
              <option key={framework.value} value={framework.value}>
                {framework.label}
              </option>
            ))}
          </select>
          {/* Display the selected framework */}
          {selectedFramework && (
            <p style={{ marginTop: "10px" }}>
              You selected: {selectedFramework}
            </p>
          )}
        </div>
        <div
          style={{
            height: "100%",
            width: "100%",
            padding: "20px",
            backgroundColor: "#fff",

          }}
        >
          <div 
          style={{
            height: "100%",
            width: "100%",
            padding: "20px",
            // backgroundColor: "#fff",
            border : "dashed 1px black"
          }}
          > 
            Question 1
             </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetails;
