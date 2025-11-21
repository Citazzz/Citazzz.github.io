// src/components/ui/DecodeText.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;:,.<>?";

export default function DecodeText({ text, className = "", delay = 0 }) {
  const [display, setDisplay] = useState("");
  
  useEffect(() => {
    let i = 0;
    // 延迟启动
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        const scrambled = text.split("").map((char, index) => {
          if (index < i) return text[index]; // 已经解码的部分
          return CHARS[Math.floor(Math.random() * CHARS.length)]; // 尚未解码的部分显示乱码
        }).join("");

        setDisplay(scrambled);
        i += 1/2; // 控制解码速度，越小越慢

        if (i >= text.length) clearInterval(interval);
      }, 30);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, delay]);

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
}
