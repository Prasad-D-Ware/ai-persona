"use client";
import ChatInterface from "@/components/chat-interface";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [persona,setPersona]= useState("");

  return (
  <div className="flex flex-col h-screen justify-center items-center relative z-10 max-w-6xl mx-auto">
    <div className="font-afacad font-bold text-5xl  text-black ">AI-Persona Simulator</div>
    <div className="flex gap-10 mt-5">
      <div className={`w-[50%] border-purple-500 border p-4 rounded-xl hover:scale-110 transition-transform duration-300 ease-in-out ${persona === "hitesh" ? "bg-purple-200" : ""}`} onClick={()=>setPersona("hitesh")} >
        <div className="flex gap-2 items-center">
          <Image src={"/hitesh-pfp.jpg"} height={100} width={100} alt="Hitesh Choudhary" className="rounded-full"/>
          <div className="text-3xl font-afacad font-semibold text-purple-500 ">Hitesh Choudhary <br/>
            <span className="text-xl text-gray-500">Chai aur Code</span>
          </div>
        </div>
      </div><div className={`w-[50%] border-purple-500 border p-4 rounded-xl hover:scale-110 transition-transform duration-300 ease-in-out ${persona === "piyush"  ? "bg-purple-200" : ""}`} onClick={()=>setPersona("piyush")} >
        <div className="flex gap-2 items-center">
          <Image src={"/piyush-pfp.jpg"} height={100} width={100} alt="Hitesh Choudhary" className="rounded-full"/>
          <div className="text-3xl font-afacad font-semibold text-purple-500">Piyush <br/>Garg <br/>
            <span className="text-xl text-gray-500">piyushgargdev</span>
          </div>
        </div>
      </div>
    </div>

    {persona && <ChatInterface persona={persona}/>}
  </div>
  );
}
