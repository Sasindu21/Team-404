import type { MetadataRoute } from "next";

export default function manifest():MetadataRoute.Manifest{
  return {name:"SafeRoute Sri Lanka 2.0",short_name:"SafeRoute SL",description:"Disaster-aware route intelligence and official warning access for Sri Lanka.",start_url:"/",display:"standalone",background_color:"#f3f8f7",theme_color:"#09262d",lang:"en-LK",icons:[{src:"/icon.svg",sizes:"any",type:"image/svg+xml",purpose:"any"}]};
}
