import React from 'react';

export default function SciCard({ children, className = "", href }) {
  const Component = href ? 'a' : 'div';
  
  return (
    <Component 
      href={href}
      className={`
        relative group block bg-white/80 backdrop-blur-sm 
        border-t border-b border-gray-200 
        hover:bg-white transition-all duration-500
        ${className}
      `}
    >
      {/* 左侧节点装饰 */}
      <div className="absolute top-1/2 left-0 w-1 h-1 bg-gray-300 -translate-x-1/2 rounded-full group-hover:bg-rhine-green group-hover:scale-150 transition-all duration-300"></div>
      
      {/* 右侧节点装饰 */}
      <div className="absolute top-1/2 right-0 w-1 h-1 bg-gray-300 translate-x-1/2 rounded-full group-hover:bg-rhine-green group-hover:scale-150 transition-all duration-300"></div>

      {/* 悬停特效：上下边缘的光束从中心向两侧展开 */}
      <div className="absolute top-[-1px] left-1/2 w-0 h-[1px] bg-rhine-green -translate-x-1/2 group-hover:w-full transition-all duration-700 ease-in-out"></div>
      <div className="absolute bottom-[-1px] left-1/2 w-0 h-[1px] bg-rhine-green -translate-x-1/2 group-hover:w-full transition-all duration-700 ease-in-out"></div>

      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
}