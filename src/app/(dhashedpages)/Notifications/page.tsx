"use client";

import React, { useEffect, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import styles from "./page.module.css";
import { IoIosArrowForward } from "react-icons/io";
import {
  Button,
  Flex,
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const Notification = () => {
 
  // modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [deviceId, setDeviceId] = useState("");
  const [value, setValue] = useState<string>("");

  const setValueHandler = () => {
    console.log("Selected Value:", value); // Log the value selected from the RadioGroup
    const newDevice = {
      deviceId,
      value, // Include the selected value in your new device data
    };
    console.log(newDevice);
    // Clear inputs and close modal (optional)
    setDeviceId("");
    onClose();
  };

  return (
    <div style={{ width: "80vw", height: "60vh", maxWidth: "1250px" }}>
      <div className={styles.hello}>
        <h3>Notification Configuration Panel</h3>
        <p>
          Set up and manage notifications to keep users informed about report
          availability, data upload issues, and system alerts.
        </p>
        {/* <Button onClick={onOpen} colorScheme="green">
            Add New User
          </Button> */}
      </div>

      <div className={styles.mainBody}>
        <div className={styles.firstNot}>
          <div>
            <h2>Set frequency of notifications</h2>
            <p>
              Configure how often users receive notifications to stay updated on
              Reports and system activities.
            </p>
          </div>
          <div onClick={onOpen} className={styles.firstNotBtn}>
            Daily <IoIosArrowForward />
          </div>
        </div>

        <div className={styles.firstNot}>
          <div>
            <h2>Notifications</h2>
            <p>Toggle for enabling/disabling specific notification types.</p>
          </div>
          <div onClick={onOpen} className={styles.firstNotBtn}>
            Set specifications <IoIosArrowForward />
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Set frequency of notifications</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <RadioGroup value={value} onChange={setValue}>
                <VStack
                  spacing="6"
                  direction="column"
                  align="start"
                  ml={"20px"}
                >
                  <Radio value="1" colorScheme="green">Daily</Radio>
                  <Radio value="2" colorScheme="green">Weekly</Radio>
                  <Radio value="3" colorScheme="green">Monthly</Radio>
                </VStack>
              </RadioGroup>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Flex width="100%" justify="center">
              <Button colorScheme="green" onClick={setValueHandler}>
                Add Device
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Notification;


