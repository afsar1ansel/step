"use client";

import React, { useEffect, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import styles from "./page.module.css";
import Image from "next/image";

import { FiUpload } from "react-icons/fi";


import {
  Button,
  ButtonGroup,
  // CheckboxIcon,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  useEditableControls,
} from "@chakra-ui/react";

import { CiEdit } from "react-icons/ci";
import { FaCheck } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { AiTwotoneMail } from "react-icons/ai";
import { BiPhoneCall } from "react-icons/bi";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";

ModuleRegistry.registerModules([AllCommunityModule]);

const Settings = () => {




  // Handle file selection
  // const [files, setFiles] = useState<File[]>([]);
  // const handleFiles = (selectedFiles: FileList | null) => {
  //   if (!selectedFiles) return;
  //   const newFiles = Array.from(selectedFiles);
  //   setFiles((prevFiles) => [
  //     ...prevFiles,
  //     ...newFiles.filter(
  //       (file) => !prevFiles.some((f) => f.name === file.name)
  //     ),
  //   ]);
  // };

  // Handle removing a file
  // const removeFile = (fileName: string) => {
  //   setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  // };

  //   password
  const [show, setShow] = React.useState(false);
  const [newPass, setNewpass] = React.useState(false);
  const [confirm , setConfirm] = React.useState(false);

  const handleClick = () => setShow(!show);



  // ediltable
function EditableControls() {
  const {
    isEditing,
    getSubmitButtonProps,
    getCancelButtonProps,
    getEditButtonProps,
  } = useEditableControls();

  return isEditing ? (
    <ButtonGroup justifyContent="center" size="sm">
      <IconButton
        size="sm"
        bgColor={"transparent"}
        icon={<FaCheck />}
        // aria-label="Save changes"
        {...{ ...getSubmitButtonProps(), "aria-label": "Save changes" }}
      />
      <IconButton
        size="sm"
        bgColor={"transparent"}
        icon={<IoMdClose />}
        // aria-label="Cancel editing"
        {...{ ...getCancelButtonProps(), "aria-label": "Cancel editing" }}
      />
    </ButtonGroup>
  ) : (
    <Flex justifyContent="center">
      <IconButton
        size="sm"
        bgColor={"transparent"}
        icon={<CiEdit />}
        // aria-label="Edit field"
        {...{ ...getEditButtonProps(), "aria-label": "Edit field" }}
      />
    </Flex>
  );
}




  return (
    <div className={styles.container}>
      <div className={styles.hello}>
        <h3>Notification Configuration Panel</h3>
        <p>
          Set up and manage notifications to keep users informed about report
          availability, data upload issues, and system alerts.
        </p>
      </div>

      <div className={styles.mainBody}>
        {/* <div className={styles.profileBox}>
          <Image src={profile} alt="Profile" width={150} />
          <div>
            <div className={styles.uploadContainer}>
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  id="file-input"
                  className={styles.fileInput}
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <label htmlFor="file-input" className={styles.uploadLabel}>
                  <FiUpload />
                  Upload Profile Photo
                </label>
              </div>
              <button
                className={styles.uploadButton}
                onClick={() => {
                  if (files.length === 0) {
                    alert("No files selected!");
                    return;
                  }
                  alert(`Uploading ${files.length} file(s)`);
                  console.log("Files ready for upload:", files);
                }}
              >
                Upload Files
              </button>
              <ul className={styles.fileList}>
                {files.map((file, index) => (
                  <li key={index} className={styles.fileItem}>
                    <span className={styles.fileName}>{file.name}</span>
                    <button
                      className={styles.removeFile}
                      onClick={() => removeFile(file.name)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.remember}>
            <p>
              <span style={{ fontWeight: "bold" }}>Remember:</span> For best
              results, use an image at least 200px by 200px in .jpg or .png
              format
            </p>
          </div>
        </div> */}

        <div className={styles.info}>
          <div className={styles.infoHead}>
            <h3>Personal Info</h3>
          </div>

          <div className={styles.infoBody}>
            <div className={styles.infoBox}>
              <AiTwotoneMail size={30} />
              <div>
                <label htmlFor="email">email</label>
                <Editable
                  textAlign="center"
                  defaultValue="amogh@gmail.com"
                  fontSize="16px"
                  isPreviewFocusable={false}
                >
                  <Flex className={styles.editable}>
                    <EditablePreview />
                    <Input as={EditableInput} />
                    <EditableControls />
                  </Flex>
                </Editable>
              </div>
            </div>

            <div className={styles.infoBox}>
              <BiPhoneCall size={30} />
              <div>
                <label htmlFor="email">Phone</label>
                <Editable
                  textAlign="center"
                  defaultValue="+91 9876543210"
                  fontSize="16px"
                  isPreviewFocusable={false}
                >
                  <Flex className={styles.editable}>
                    <EditablePreview />
                    <Input as={EditableInput} />
                    <EditableControls />
                  </Flex>
                </Editable>
              </div>
            </div>

            <div className={styles.infoBox}>
              <IoLocationOutline size={30} />
              <div>
                <label htmlFor="email">Location</label>
                <Editable
                  textAlign="center"
                  defaultValue="Home 1024/N, Road# 17/A, basveshwar nagar, Bangalore"
                  fontSize="16px"
                  isPreviewFocusable={false}
                >
                  <Flex className={styles.editable}>
                    <EditablePreview />
                    <Input as={EditableInput} />
                    <EditableControls />
                  </Flex>
                </Editable>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.password}>
          <div className={styles.infoHead}>
            <h3>Change Password</h3>
          </div>

          <div className={styles.passBody}>
            <div>
              <FormLabel>Current Password</FormLabel>
              <InputGroup size="md">
                <Input
                  pr="4.5rem"
                  type={show ? "text" : "password"}
                  placeholder="Enter password"
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={handleClick}
                    bgColor={"white"}
                  >
                    {show ? <FaRegEye /> : <FaRegEyeSlash />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </div>

            {/* Second Password Field */}
            <div>
              <FormLabel>New Password</FormLabel>
              <InputGroup size="md">
                <Input
                  pr="4.5rem"
                  type={newPass ? "text" : "password"}
                  placeholder="Enter new password"
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => setNewpass(!newPass)}
                    bgColor={"white"}
                  >
                    {newPass ? <FaRegEye /> : <FaRegEyeSlash />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </div>

            {/* Third Password Field */}
            <div>
              <FormLabel>Confirm Password</FormLabel>
              <InputGroup size="md">
                <Input
                  pr="4.5rem"
                  type={confirm ? "text" : "password"}
                  placeholder="Confirm new password"
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => setConfirm(!confirm)}
                    bgColor={"white"}
                  >
                    {confirm ? <FaRegEye /> : <FaRegEyeSlash />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
