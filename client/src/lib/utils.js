import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import animationData from "@/assets/lottie-json"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const colors = [
  "bg-[#712c4a57] text-[#ff006e] border-[1px] border-[#ff006faa]",
  "bg-[#ff660a2a] text-[#ff660a] border-[1px] border-[#ff660abb]",
  "bg-[#0066aa2a] text-[#0066aa] border-[1px] border-[#0066aabb]",
  "bg-[#4cc9f02a] text-[#4cc9f0] border-[1px] border-[#4cc9f0bb]",
];

export const getColor = (color) => {
  if (color >= 0 && color < colors.length) {
    return colors[color];
  }
  return colors[0]; // fallback to the first color if out of range
};

export const animationDefaultOption = {
  loop: true,
  autoplay: true, 
  animationData,
};



// import { clsx } from "clsx";
// import { twMerge } from "tailwind-merge"
// import animationData from "@/assets/lottie-json"

// export function cn(...inputs) {
//   return twMerge(clsx(inputs));
// }


// export const colors = [
//   "bg-[#712c4a57] text-[#ff006e] border-[1px] border-[#ff006faa]",
//   "bg-[#ff660a2a] text-[#ff660a] border-[1px] border-[#ff660abb]",
//   "bg-[#0066aa2a] text-[#0066aa] border-[1px] border-[#0066aabb]",
//   "bg-[#4cc9f02a] text-[#4cc9f0] border-[1px] border-[#4cc9f0bb]",
// ];

// export const getColor = (color) => {
//   if (color >= 0 && color < colors.length) {
//     return colors[color];
//   }
//   return colors[0]; // fallback to the first color if out of range

//   export const animationDefaultOption ={
//     loop: true,
//     autoplay: true, 
//     animationData,
//   }
// }