// src/components/BootSequence.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';

export default function BootSequence() {
  // 1. 初始状态设为 true，保证第一次加载时用户能立刻看到背景
  // 但我们不在这里读 sessionStorage，避免服务端和客户端结果打架
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);

  const systemLogs = [
    "INITIALIZING KERNEL...",
    "LOADING MODULES: [ASTRO, REACT, TAILWIND]...",
    "CHECKING MEMORY INTEGRITY... OK",
    "ESTABLISHING NEURAL LINK...",
    "ACCESS GRANTED: USER [CITAZZZ]",
    "WELCOME TO RHINE LAB TERMINAL."
  ];

  useEffect(() => {
    // --- 核心修复逻辑 ---
    
    // 1. 组件挂载后，立刻检查 SessionStorage
    const hasBooted = typeof window !== 'undefined' && sessionStorage.getItem('rhine_booted');

    // 2. 如果已经启动过，直接强制关闭，不运行后续动画
    if (hasBooted) {
      setIsVisible(false);
      return; 
    }

    // 3. 如果没启动过，开始运行动画逻辑
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 100);

    let logIndex = 0;
    const logTimer = setInterval(() => {
      if (logIndex < systemLogs.length) {
        setLogs(prev => [...prev, systemLogs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logTimer);
        
        // 动画完成，延迟关闭
        setTimeout(() => {
          setIsVisible(false);
          // 写入标记
          sessionStorage.setItem('rhine_booted', 'true');
        }, 800); 
      }
    }, 300);

    return () => {
      clearInterval(timer);
      clearInterval(logTimer);
    };
  }, []);

  // 如果不可见，返回 null，彻底从 DOM 中移除
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-rhine-dark text-rhine-green font-mono flex flex-col items-center justify-center p-8"
          // 退出动画：透明度变0 + 模糊滤镜 + 稍微放大 = 穿透感
          exit={{ 
            opacity: 0, 
            filter: "blur(10px)",
            scale: 1.05,
            transition: { duration: 0.8, ease: "easeInOut" } 
          }}
          // 初始状态
          initial={{ opacity: 1 }}
          // 动画状态
          animate={{ opacity: 1 }}
        >
          <div className="w-full max-w-md space-y-6">
            <div className="flex justify-between items-end border-b border-rhine-green/30 pb-2">
              <div className="flex items-center gap-2 text-xl font-black tracking-tighter">
                <Terminal size={24} />
                <span>SYSTEM_BOOT</span>
              </div>
              <div className="text-xs animate-pulse">v2.0.25</div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>LOADING_ASSETS</span>
                <span>{Math.min(progress, 100)}%</span>
              </div>
              <div className="h-1 w-full bg-gray-800 overflow-hidden">
                <motion.div 
                  className="h-full bg-rhine-green"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="h-32 overflow-hidden border-l-2 border-rhine-green/50 pl-4 text-xs text-gray-400 space-y-1 font-mono">
              {logs.map((log, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="text-rhine-green mr-2">➜</span>
                  {log}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}