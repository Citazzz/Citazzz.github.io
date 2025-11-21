import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  // 使用 ref 直接操作 DOM，避开 React 渲染周期，性能最高
  const cursorRef = useRef(null);
  // 仅用 state 控制交互状态（变大/旋转），位置不走 state
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // 性能优化：使用 requestAnimationFrame 节流
    let rafId;
    
    const onMouseMove = (e) => {
      // 1. 立刻让光标可见
      if (!isVisible) setIsVisible(true);

      // 2. 核心修复：位置更新逻辑
      // 直接操作 style，没有任何 transition，保证 1:1 跟随手速
      cursor.style.transform = `translate3d(${e.clientX - 16}px, ${e.clientY - 16}px, 0)`;

      // 3. 交互检测 (Hover Check)
      // 这个计算量很小，可以直接做
      const target = e.target;
      // 检查是否是可交互元素
      const isInteractive = target.closest('a, button, [role="button"], input, textarea, .cursor-pointer');
      setIsHovering(!!isInteractive);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseenter', onMouseEnter);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isVisible]);

  // 移动端彻底禁用，不渲染组件
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <div 
      ref={cursorRef}
      className={`
        fixed top-0 left-0 z-[9999] pointer-events-none 
        /* 关键修复：移除了这里的 transition-transform，只保留 opacity 的过渡 */
        transition-opacity duration-150 ease-out 
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      style={{ 
        // 开启硬件加速
        willChange: 'transform',
        // 混合模式：实现自动反色（黑底白字，白底黑字）
        mixBlendMode: 'difference' 
      }}
    >
      {/* 
         内层 SVG：负责动画
         只有这里的 transform (rotate/scale) 才会有 transition
      */}
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 32 32" 
        className={`
          transition-transform duration-300 ease-out 
          ${isHovering ? 'rotate-45 scale-125' : 'rotate-0 scale-100'}
        `}
        style={{
          fill: 'none',
          stroke: 'white', // 必须纯白，配合 difference 模式
          strokeWidth: '1.5px' // 线条稍微加粗一点点，防止反色后看不清
        }}
      >
        {/* 中空瞄准十字造型 */}
        <line x1="16" y1="2" x2="16" y2="10"/>
        <line x1="16" y1="22" x2="16" y2="30"/>
        <line x1="2" y1="16" x2="10" y2="16"/>
        <line x1="22" y1="16" x2="30" y2="16"/>
      </svg>
    </div>
  );
}