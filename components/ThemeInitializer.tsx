"use client";
import { useEffect } from "react";

export default function ThemeInitializer(){
  useEffect(()=>{
    try{
      const value=JSON.parse(localStorage.getItem("saferoute-preferences")||"null");
      if(value?.theme==="dark"||value?.theme==="light")document.documentElement.dataset.theme=value.theme;
      else delete document.documentElement.dataset.theme;
    }catch{}
  },[]);
  return null;
}
