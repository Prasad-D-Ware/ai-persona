"use client";
import ChatInterface from "@/components/chat-interface";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [persona,setPersona]= useState("");

  return (
  <div className="flex flex-col min-h-screen justify-center items-center relative z-10 max-w-6xl mx-auto px-4 py-6">
    <div className="font-afacad font-bold text-3xl md:text-5xl text-black text-center mb-6">AI-Persona Simulator</div>
    <div className="flex flex-col md:flex-row gap-4 md:gap-10 w-full max-w-4xl">
      <div className={`w-full md:w-[50%] border-purple-500 border p-4 rounded-xl hover:scale-105 md:hover:scale-110 transition-transform duration-300 ease-in-out cursor-pointer ${persona === "hitesh" ? "bg-purple-200" : ""}`} onClick={()=>setPersona("hitesh")} >
        <div className="flex gap-3 items-center">
          <Image src={"/hitesh-pfp.jpg"} height={80} width={80} alt="Hitesh Choudhary" className="rounded-full md:w-[100px] md:h-[100px]"/>
          <div className="text-xl md:text-3xl font-afacad font-semibold text-purple-500">Hitesh Choudhary <br/>
            <span className="text-base md:text-xl text-gray-500">Chai aur Code</span>
          </div>
        </div>
      </div>
      <div className={`w-full md:w-[50%] border-purple-500 border p-4 rounded-xl hover:scale-105 md:hover:scale-110 transition-transform duration-300 ease-in-out cursor-pointer ${persona === "piyush"  ? "bg-purple-200" : ""}`} onClick={()=>setPersona("piyush")} >
        <div className="flex gap-3 items-center">
          <Image src={"/piyush-pfp.jpg"} height={80} width={80} alt="Piyush Garg" className="rounded-full md:w-[100px] md:h-[100px]"/>
          <div className="text-xl md:text-3xl font-afacad font-semibold text-purple-500">Piyush Garg <br/>
            <span className="text-base md:text-xl text-gray-500">piyushgargdev</span>
          </div>
        </div>
      </div>
    </div>

    {persona && <ChatInterface persona={persona}/>}
  </div>
  );
}
