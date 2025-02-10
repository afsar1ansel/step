"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./globals.css";
import Image from "next/image";
// import logo from "/public/Mesha_inc_logo-1.png";
import profile from "/public/Profile.png";

import { IoIosHome } from "react-icons/io";
import { TbDeviceAnalytics } from "react-icons/tb";
import { FaRegIdCard } from "react-icons/fa6";
import { AiOutlineDatabase } from "react-icons/ai";
import { IoMdPaper } from "react-icons/io";
import { FaRegBell } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { MdHelpOutline } from "react-icons/md";
import { FaPowerOff } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { FaUserEdit } from "react-icons/fa";
import { FiAlertTriangle } from "react-icons/fi";
import { MdLogout } from "react-icons/md";

import { usePathname } from "next/navigation";
import {
  Button,
  ChakraProvider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";

type NavItem =
  | "dashboard"
  | "StudentData"
  | "CourseData"
  | "userRoll"
  | "dataLogs"
  | "alertLogs"
  | "Reports"
  | "Settings"
  | "Support"
  | "Logout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const cleanedPathname = pathname.replace(/^\/+/, ""); // Remove leading slashes
  const basePath = cleanedPathname.split("/")[0]; // Extract the base path
  console.log(basePath); // Check the base path

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [active, setActive] = useState<NavItem>(basePath as NavItem);

  useEffect(() => {
    setActive(basePath as NavItem); // Update active state when pathname changes
  }, [pathname]);

  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <div className="app-container">
            {/* Header Section */}
            <header className="header">
              <div className="search-bar">
                <div>
                  <FaSearch className="searchIcon" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="search-input"
                  />
                </div>
                <div className="icons">
                  <div className="user">
                    {/* <Image
                      src={profile}
                      alt="Logo"
                      width={40}
                      height={40}
                      className="user-image"
                    /> */}
                  </div>
                </div>
              </div>
            </header>

            <div className="main-content">
              {/* Sidebar Navigation */}
              <nav className="sidebar">
                <Image src={profile} alt="Logo" width={50} height={50} />
                {/* <h1>LOGO</h1> */}
                <ul>
                  <li className={active === "dashboard" ? "active" : ""}>
                    <IoIosHome />
                    <Link className="link" href="/dashboard">
                      <p className="linkname">Dashboard</p>
                    </Link>
                  </li>
                  <li className={active === "StudentData" ? "active" : ""}>
                    <FaRegIdCard />
                    <Link href="/StudentData">
                      <p className="linkname">Student Data</p>
                    </Link>
                  </li>
                  <li className={active === "CourseData" ? "active" : ""}>
                    <TbDeviceAnalytics />
                    <Link href="/CourseData">
                      <p className="linkname">Course</p>
                    </Link>
                  </li>
                  <li className={active === "userRoll" ? "active" : ""}>
                    <FaUserEdit />
                    <Link href="/userRoll">
                      <p className="linkname">User Role</p>
                    </Link>
                  </li>
                  <li className={active === "dataLogs" ? "active" : ""}>
                    <AiOutlineDatabase />
                    <Link href="/dataLogs">
                      <p className="linkname">Data Logs</p>
                    </Link>
                  </li>
                  <li className={active === "alertLogs" ? "active" : ""}>
                    <FiAlertTriangle />
                    <Link href="/alertLogs">
                      <p className="linkname">Alert Logs</p>
                    </Link>
                  </li>
                  <li className={active === "Reports" ? "active" : ""}>
                    <IoMdPaper />
                    <Link href="/Reports">
                      <p className="linkname">Reports</p>
                    </Link>
                  </li>
                  <li className={active === "Settings" ? "active" : ""}>
                    <IoSettingsOutline />
                    <Link href="/Settings">
                      <p className="linkname">Settings</p>
                    </Link>
                  </li>
                  <li className={active === "Support" ? "active" : ""}>
                    <MdHelpOutline />
                    <Link href="/Support">
                      <p className="linkname">Support</p>
                    </Link>
                  </li>
                  <li
                    className={active === "Logout" ? "active" : ""}
                    onClick={onOpen}
                    style={{ cursor: "pointer" }}
                  >
                    <FaPowerOff />
                    <p className="linkname">Logout</p>
                  </li>
                </ul>
              </nav>

              <main className="content">{children}</main>
            </div>
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalBody textAlign="center" padding="40px">
                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    width={"100%"}
                    flexDirection={"column"}
                    gap={4}
                  >
                    <MdLogout size={100} color="red" />
                    <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                      <h2
                        style={{
                          fontSize: "18px",
                          fontWeight: "500",
                          color: "rgba(25, 27, 28, 1)",
                        }}
                      >
                        Confirm Logout
                      </h2>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: "400",
                          color: "rgba(98, 108, 112, 1)",
                        }}
                      >
                        Are you sure you want to log out?
                      </p>
                    </div>
                  </Flex>
                </ModalBody>

                <ModalFooter justifyContent="space-around" padding="20px">
                  <Button
                    style={{
                      color: "red",
                      backgroundColor: "white",
                      border: "1px solid red",
                    }}
                    onClick={onClose}
                  >
                    Logout
                  </Button>
                  <Button colorScheme="gray" mr={3} onClick={onClose}>
                    Cancel
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </div>
        </ChakraProvider>
      </body>
    </html>
  );
}
