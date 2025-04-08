"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import style from "./page.module.css";
import Image from "next/image";
import photo from "/public/Group19697.png";
import Link from "next/link";
import { Heading, useToast } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isStrongPassword(password)) return;

    await fetcher();
  };

  async function fetcher() {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);
    // console.log(Object.fromEntries(form));
    try {
      const response = await fetch(`${baseURL}/admin-users/validate-user`, {
        method: "POST",
        body: form,
      });

      const responseData = await response.json();
      console.log(responseData);
      if (responseData.errFlag == 1) {
        // const responseData = await response.json();
        throw new Error(responseData.message || "Login failed");
      }

      // const data = await response.json();
      // console.log("Login successful:", responseData);
      if (responseData.errFlag == 0) {
        localStorage.setItem("token", responseData.token.trim());
        localStorage.setItem("user", JSON.stringify(responseData.username));
        router.push("/dashboard");
      }

      toast({
        title: "Login successful.",
        description: "You have logged in successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      // TODO: Redirect to dashboard or set auth state
    } catch (error: any) {
      console.error("Error:", error.message);

      toast({
        title: "Login failed.",
        description: error.message || "Something went wrong.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  }

  function isStrongPassword(password: string): boolean {
    const errors: string[] = [];

    if (password.length < 8) errors.push("at least 8 characters");
    // if (!/[A-Z]/.test(password)) errors.push("an uppercase letter");
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
      errors.push("a special character");

    if (errors.length > 0) {
      toast({
        title: "Weak Password",
        description: `Password must contain ${errors.join(", ")}.`,
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      return false;
    }

    return true;
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={style.logbody}>
      <div className={style.logo}>
        <Image src={photo} alt="Logo" width={200} height={75} />
      </div>
      <div className={style.form}>
        <div style={{ backgroundColor: "white" }}></div>
        <div>
          <Heading mt={"20px"} size={"md"}>
            Login to your account
          </Heading>
          <form className={style.formbox} onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              style={{ marginBottom: "12px" }}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className={style.password}>
              <label htmlFor="password">Password</label>
              {/* <Link className={style.forgotLink} href="/auth/forgotpassword">
                Forgot Password ?
              </Link> */}
            </div>
            <div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
