"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { SiFacebook } from "react-icons/si";
import { Label } from  "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React from "react";

export default function LoginCard( ){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin  = (event: React.FormEvent) => {
        event.preventDefault();
        console.log("Login Success")
        console.log(email)
        console.log(password)
    }

    return (
        <Card className="h-full w-1/2 bg-black bg-opacity-75">
            <div className="flex h-full w-full my- 5  flex flex-col ">
                <h1 className="text-center mt-10 font-roboto text-2xl">
                    AI-enhanced Security Testing Platform
                </h1>
                <h2 className="text-center font-roboto text-xl">
                    Login
                </h2>
                <form onSubmit={handleLogin} className="h-60 w-full flex-col mt-5 flex place-content-center">
                        <div className="mb-4 w-full flex place-content-center">
                            <Label className="flex items-center justify-center text-md ms-7" htmlFor="email">Email</Label>
                            <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-60 ms-4 bg-black opacity-75"
                            />
                        </div>
                        <div className="mb-6 w-full flex place-content-center">
                            <Label className="flex items-center justify-center text-md" htmlFor="password">Password</Label>
                            <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-60 ms-4 bg-black opacity-75"
                            />
                        </div>
                        <div  className="my-4 flex place-content-center">
                            <Button type="submit">
                                Login
                            </Button>
                        </div>
                </form>
                <hr className="place-self-center dashed my-4 w-4/5 border-gray-300" />
                <div className="flex h-60 w-full flex-col place-content-center">
                    <div className="mb-4 w-full flex place-content-center">
                        <Button className = "flex items-center w-full w-60 rounded-full" variant="outline">
                        <FcGoogle />
                        Sign in with Google
                        </Button>
                    </div>

                    <div className="mb-4 w-full flex place-content-center">
                        <Button className = "flex items-center w-full my-5 w-60 rounded-full" variant="outline">
                        <FaGithub />
                        Sign in with Github
                        </Button>
                    </div>

                    <div className="mb-4 w-full flex place-content-center">
                        <Button className = "flex items-center w-full w-60 rounded-full" variant="outline">
                        <SiFacebook style={{ color: '#3b5998' }}/>
                        Sign in with Facebook
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}