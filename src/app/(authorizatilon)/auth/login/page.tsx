"use client";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import style from "./page.module.css";
import Image from "next/image";


import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  // Handle form submission
  const handleSubmit = (event: any) => {
    event.preventDefault(); // Prevent default form submission
    console.log("Email:", email);
    console.log("Password:", password);
    // You can add further logic here, such as form validation or API calls
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={style.logbody}>
      <div className={style.logo}>
        {/* <Image src={logo} alt="Logo" width={500} height={200} /> */}
        <h1>LOGO</h1>
      </div>
      <div className={style.form}>
        <div>
          {/* <Image src={photo} alt="pic" width={500} height={400} /> */}
          IMAGE
        </div>
        <div>
          <h2>Login to your account</h2>
          <form className={style.formbox} onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              style={{ marginBottom: "12px" }}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update email state
            />
            <div className={style.password}>
              <label htmlFor="password">Password</label>
              
                <Link className={style.forgotLink} href="/auth/forgotpassword">
                  Forgot Password ?
                </Link>
            </div>
            <div>
              <input
                id="password"
                type={showPassword ? "text" : "password"} // Toggle input type
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Update password state
              />
              <div className={style.forgot} onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </div>
            </div>
            <button type="submit" className={style.btn}>
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
