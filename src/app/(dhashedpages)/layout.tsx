"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./globals.css";
import Image from "next/image";
// import logo from "/public/Mesha_inc_logo-1.png";
import profile from "/public/Group19697.png";
import { FaUserDoctor } from "react-icons/fa6";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { IoIosHome } from "react-icons/io";
import { TbDeviceAnalytics } from "react-icons/tb";
import { FaRegIdCard } from "react-icons/fa6";
import { PiVideoConferenceFill } from "react-icons/pi";
import { RiUserSettingsFill } from "react-icons/ri";
import { FaUsers } from "react-icons/fa6";
import { FaPowerOff } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { FaUserEdit } from "react-icons/fa";
import { GrNotes } from "react-icons/gr";
import { CiBoxList } from "react-icons/ci";
import { FaRegImages } from "react-icons/fa6";
import { FaUsersViewfinder } from "react-icons/fa6";
import { GrTestDesktop } from "react-icons/gr";

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

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";

type NavItem =
  | "dashboard"
  | "StudentData"
  | "AdminUsers"
  | "Doctors"
  | "steps"
  // | "test"
  | "BannerMaster"
  | "videos"
  | "Notes"
  | "AppUser"
  | "Masters"
  | "College"
  | "teacher"
  | "subject"
  | "course"
  | "Support"
  | "Settings"
  | "Logout"
  | "test"
  | "precourse-qa"
  | "postcourse-test"
  | "postcourse-qa"
  | "appUserPurchase" 
  | "ExamModule" 
  | "exam-test" 
  | "exam-qa";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const cleanedPathname = pathname.replace(/^\/+/, ""); // Remove leading slashes
  const basePath = cleanedPathname.split("/")[0]; // Extract the base path
  // console.log(basePath); // Check the base path

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [active, setActive] = useState<NavItem>(basePath as NavItem);




  useEffect(() => {

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      console.warn("No token found, redirecting to login...");
      window.location.href = "/auth/login";
    }

    if (["teacher", "subject", "course"].includes(basePath)) {
      setActive("Masters");
    } else if (
      [
        "test",
        "precourse-qa",
        "postcourse-test",
        "postcourse-qa",
      ].includes(basePath)
    ) {
      setActive("test");
    } else if (
      [
        "exam-test",
        "exam-qa",
      ].includes(basePath)
    ) {
      setActive("ExamModule");
    } else {
      setActive(basePath as NavItem);
    }
  }, [pathname]);

  const handleLogout = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // if (!token) {
      console.warn("No token found, redirecting to login...");
      localStorage.removeItem("token");
      localStorage.removeItem("permits");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
      // return;
    // }

    // fetch(`${baseURL}/app-users/logout/${token}`, {
    //   method: "GET",
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     // console.log(data);
    //     localStorage.removeItem("token");
    //     localStorage.removeItem("permits");
    //     window.location.href = "/auth/login";
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching data:", error);
    //   });
  };

  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <div className="app-container">
            {/* Header Section */}
            <header className="header">
              {/* <div className="search-bar">
                <div>
                  <FaSearch className="searchIcon" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="search-input"
                  />
                </div>
                <div className="icons">
                  <div className="user"></div>
                </div>
              </div> */}
            </header>

            <div className="main-content">
              {/* Sidebar Navigation */}
              <nav className="sidebar">
                <div
                  // style={{
                  //   display: "flex",
                  //   justifyContent: "center",
                  //   padding: "20px",
                  //   marginBottom: "20px",
                  //   borderBottom: "1px solid #ccc",
                  // }}
                  className="sidebar-logo-container"
                >
                  <Image src={profile} alt="Logo" width={200} height={200} />
                </div>
                {/* Scrollable navigation items container */}
                <div className="sidebar-nav-container">
                  <ul>
                    <li className={active === "dashboard" ? "active" : ""}>
                      <IoIosHome />
                      <Link className="link" href="/dashboard">
                        <p className="linkname">Dashboard</p>
                      </Link>
                    </li>
                    {/* <li className={active === "StudentData" ? "active" : ""}>
                      <FaRegIdCard />
                      <Link href="/StudentData">
                        <p className="linkname">Student Data</p>
                      </Link>
                    </li> */}
                    <li className={active === "AdminUsers" ? "active" : ""}>
                      <MdOutlineAdminPanelSettings />
                      <Link href="/AdminUsers">
                        <p className="linkname">Admin Users</p>
                      </Link>
                    </li>
                    {/* <li className={active === "Doctors" ? "active" : ""}>
                      <FaUserDoctor />
                      <Link href="/Doctors">
                        <p className="linkname">Doctors</p>
                      </Link>
                    </li> */}
                    <li className={active === "steps" ? "active" : ""}>
                      <TbDeviceAnalytics />
                      <Link href="/steps">
                        <p className="linkname">Course Step Details</p>
                      </Link>
                    </li>
                    <li
                      style={{ padding: 0, margin: 0 }}
                      className={
                        ["Doctors", "subject", "course"].includes(basePath)
                          ? "active"
                          : ""
                      }
                    >
                      <Accordion allowToggle>
                        <AccordionItem border="none">
                          <AccordionButton
                            style={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              padding: "0.5rem 20px",
                            }}
                          >
                            <CiBoxList />
                            <p
                              style={{
                                flex: 1,
                                textAlign: "left",
                                marginLeft: "0.5rem",
                              }}
                            >
                              Masters
                            </p>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel pb={0} pl={1} margin={0} padding={0}>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                              <li>
                                <Link href="/course">
                                  <p
                                    className={
                                      basePath === "course"
                                        ? "active-sub-option"
                                        : ""
                                    }
                                    style={{
                                      margin: 0,
                                      marginLeft: "1rem",
                                      padding: "0",
                                    }}
                                  >
                                    Course Master
                                  </p>
                                </Link>
                              </li>

                              <li>
                                <Link href="/subject">
                                  <p
                                    className={
                                      basePath === "subject"
                                        ? "active-sub-option"
                                        : ""
                                    }
                                    style={{
                                      margin: 0,
                                      marginLeft: "1rem",
                                      padding: "0",
                                    }}
                                  >
                                    Subject Master
                                  </p>
                                </Link>
                              </li>

                              <li>
                                <Link href="/Doctors">
                                  <p
                                    className={
                                      basePath === "Doctors"
                                        ? "active-sub-option"
                                        : ""
                                    }
                                    style={{
                                      margin: 0,
                                      marginLeft: "1rem",
                                      padding: "0",
                                    }}
                                  >
                                    Doctors Master
                                  </p>
                                </Link>
                              </li>
                              <li>
                                <Link href="/Course_price">
                                  <p
                                    className={
                                      basePath === "Course_price"
                                        ? "active-sub-option"
                                        : ""
                                    }
                                    style={{
                                      margin: 0,
                                      marginLeft: "1rem",
                                      padding: "0",
                                    }}
                                  >
                                    Course Price
                                  </p>
                                </Link>
                              </li>
                            </ul>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </li>
                    {/* <li className={active === "test" ? "active" : ""}>
                    <FaUserEdit />
                    <Link href="/test">
                      <p className="linkname">Test</p>
                    </Link>
                  </li> */}
                    <li
                      style={{ padding: 0, margin: 0 }}
                      className={
                        [
                          "test",
                          "precourse-qa",
                          "postcourse-test",
                          "postcourse-qa",
                        ].includes(basePath)
                          ? "active"
                          : ""
                      }
                    >
                      <Accordion allowToggle>
                        <AccordionItem border="none">
                          <AccordionButton
                            style={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              padding: "0.5rem 20px",
                            }}
                          >
                            <FaUserEdit />
                            <p
                              style={{
                                flex: 1,
                                textAlign: "left",
                                marginLeft: "0.5rem",
                              }}
                            >
                              Test
                            </p>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel
                            pb={0}
                            pl={1}
                            margin={0}
                            padding={0}
                            style={{ marginTop: "-2px" }}
                          >
                            <ul style={{ listStyle: "none", padding: 0 }}>
                              <li>
                                <Link href="/test">
                                  <p
                                    className={
                                      basePath === "test"
                                        ? "active-sub-option"
                                        : ""
                                    }
                                    style={{
                                      margin: 0,
                                      marginLeft: "1rem",
                                      padding: "0",
                                    }}
                                  >
                                    Precourse Test
                                  </p>
                                </Link>
                              </li>
                              <li>
                                <Link href="/precourse-qa">
                                  <p
                                    className={
                                      basePath === "precourse-qa"
                                        ? "active-sub-option"
                                        : ""
                                    }
                                    style={{
                                      margin: 0,
                                      marginLeft: "1rem",
                                      padding: "0",
                                    }}
                                  >
                                    Precourse Q/A
                                  </p>
                                </Link>
                              </li>
                              <li>
                                <Link href="/postcourse-test">
                                  <p
                                    className={
                                      basePath === "postcourse-test"
                                        ? "active-sub-option"
                                        : ""
                                    }
                                    style={{
                                      margin: 0,
                                      marginLeft: "1rem",
                                      padding: "0",
                                    }}
                                  >
                                    Postcourse Test
                                  </p>
                                </Link>
                              </li>
                              <li>
                                <Link href="/postcourse-qa">
                                  <p
                                    className={
                                      basePath === "postcourse-qa"
                                        ? "active-sub-option"
                                        : ""
                                    }
                                    style={{
                                      margin: 0,
                                      marginLeft: "1rem",
                                      padding: "0",
                                    }}
                                  >
                                    Postcourse Q/A
                                  </p>
                                </Link>
                              </li>
                            </ul>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </li>
                    <li
                      style={{ padding: 0, margin: 0 }}
                      className={
                        ["ExamModule", "exam-test", "exam-qa"].includes(
                          active
                        ) || ["exam-test", "exam-qa"].includes(basePath)
                          ? "active"
                          : ""
                      }
                    >
                      <Accordion
                        allowToggle
                        defaultIndex={
                          ["exam-test", "exam-qa"].includes(basePath) ? [0] : []
                        }
                      >
                        <AccordionItem border="none">
                          <AccordionButton
                            style={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              padding: "0.5rem 20px",
                            }}
                          >
                            <GrTestDesktop />
                            <p
                              style={{
                                flex: 1,
                                textAlign: "left",
                                marginLeft: "0.5rem",
                              }}
                            >
                              Exam Module
                            </p>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel
                            pb={0}
                            pl={1}
                            margin={0}
                            padding={0}
                            style={{ marginTop: "-2px" }}
                          >
                            <ul style={{ listStyle: "none", padding: 0 }}>
                              <li>
                                <Link href="/exam-test">
                                  <p
                                    className={
                                      basePath === "exam-test"
                                        ? "active-sub-option"
                                        : ""
                                    }
                                    style={{
                                      margin: 0,
                                      marginLeft: "1rem",
                                      padding: "0",
                                    }}
                                  >
                                    Test
                                  </p>
                                </Link>
                              </li>
                              <li>
                                <Link href="/exam-qa">
                                  <p
                                    className={
                                      basePath === "exam-qa"
                                        ? "active-sub-option"
                                        : ""
                                    }
                                    style={{
                                      margin: 0,
                                      marginLeft: "1rem",
                                      padding: "0",
                                    }}
                                  >
                                    Q/A
                                  </p>
                                </Link>
                              </li>
                            </ul>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </li>
                    <li className={active === "BannerMaster" ? "active" : ""}>
                      <FaRegImages />
                      <Link href="/BannerMaster">
                        <p className="linkname">Banner Master</p>
                      </Link>
                    </li>
                    <li className={active === "videos" ? "active" : ""}>
                      <PiVideoConferenceFill />
                      <Link href="/videos">
                        <p className="linkname">Videos</p>
                      </Link>
                    </li>
                    <li className={active === "Notes" ? "active" : ""}>
                      <GrNotes />
                      <Link href="/Notes">
                        <p className="linkname">Notes</p>
                      </Link>
                    </li>
                    <li className={active === "College" ? "active" : ""}>
                      <FaUserEdit />
                      <Link href="/College">
                        <p className="linkname">College</p>
                      </Link>
                    </li>
                    <li className={active === "AppUser" ? "active" : ""}>
                      <FaUsers />
                      <Link href="/AppUser">
                        <p className="linkname">App User</p>
                      </Link>
                    </li>
                    <li
                      className={active === "appUserPurchase" ? "active" : ""}
                    >
                      <FaUsersViewfinder />
                      <Link href="/appUserPurchase">
                        <p className="linkname">App User Purchase</p>
                      </Link>
                    </li>
                    {/* <li className={active === "Settings" ? "active" : ""}>
                      <RiUserSettingsFill />
                      <Link href="/Settings">
                        <p className="linkname">Settings</p>
                      </Link>
                    </li> */}
                    <li
                      className={active === "Logout" ? "active" : ""}
                      onClick={onOpen}
                      style={{ cursor: "pointer" }}
                    >
                      <FaPowerOff />
                      <p className="linkname">Logout</p>
                    </li>
                  </ul>
                </div>
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
                    onClick={handleLogout}
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
