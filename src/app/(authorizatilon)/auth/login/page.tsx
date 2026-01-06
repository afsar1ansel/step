"use client";

import { useState, useRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import style from "./page.module.css";
import Image from "next/image";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;

    setIsSubmitting(true);

    if (!isStrongPassword(password)) {
      setIsSubmitting(false);
      return;
    }

    try {
      await fetcher();
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  async function fetcher() {
    const form = new FormData();
    form.append("email", email);
    form.append("password", password);

    try {
      const response = await fetch(`${baseURL}/admin-users/validate-user`, {
        method: "POST",
        body: form,
      });

      const responseData = await response.json();

      if (responseData.errFlag == 1) {
        throw new Error(responseData.message || "Login failed");
      }

      if (responseData.errFlag == 0) {
        localStorage.setItem("token", responseData.token.trim());
        localStorage.setItem("user", JSON.stringify(responseData.username));

        toast({
          title: "Login successful.",
          description: "You have logged in successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });

        router.push("/dashboard");
      }
    } catch (error: any) {
      // console.error("Error:", error.message);
      toast({
        title: "Login failed.",
        description: error.message || "Something went wrong.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      throw error; // Re-throw for the calling function to handle
    }
  }

  function isStrongPassword(password: string): boolean {
    const errors: string[] = [];

    if (password.length < 8) errors.push("at least 8 characters");
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
        <Image
          src="/Group19697.png"
          alt="Logo"
          width={200}
          height={75}
          priority
        />
      </div>
      <div className={style.form}>
        <div style={{ backgroundColor: "white" }}></div>
        <div>
          <Heading mt={"20px"} size={"md"}>
            Login to your account
          </Heading>
          <form className={style.formbox} onSubmit={handleSubmit} ref={formRef}>
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
              disabled={isSubmitting}
            />
            <div className={style.password}>
              <label htmlFor="password">Password</label>
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
                disabled={isSubmitting}
              />
              <div className={style.forgot} onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </div>
            </div>
            <button type="submit" className={style.btn} disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
