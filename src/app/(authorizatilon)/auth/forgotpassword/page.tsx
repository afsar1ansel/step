"use client";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import style from "./page.module.css";
import Image from "next/image";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle form submission
  const handleSubmit = (event: any) => {
    event.preventDefault(); 
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

    const togglePasswordVisibility1 = () => {
      setShowConfirmPassword(!showConfirmPassword);
    };

  return (
    <div className={style.logbody}>
      <div className={style.logo}>
        <Image src="/Group19697.png" alt="Logo" width={200} height={75} />
        {/* <h1>LOGO</h1> */}
      </div>
      <div className={style.form}>
        {/* <div>
          <Image src="/Group19697.png" alt="pic" width={500} height={400} />
          IMAGE
        </div> */}
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
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="password">Password</label>
            <div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className={style.forgot} onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </div>
            </div>

            <label htmlFor="password">Comfirm Password</label>
            <div>
              <input
                id="comfirmpassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Comfirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className={style.forgot} onClick={togglePasswordVisibility1}>
                {showConfirmPassword ? (
                  <FaEyeSlash size={20} />
                ) : (
                  <FaEye size={20} />
                )}
              </div>
            </div>
            <button type="submit" className="btn">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
