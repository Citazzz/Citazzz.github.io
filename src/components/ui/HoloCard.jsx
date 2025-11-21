// src/components/ui/HoloCard.jsx
import React from 'react';

export default function HoloCard({ children, href, className = "" }) {
  return (
    <a 
      href={href} 
      className={`group relative block bg-rhine-surface border border-gray-200 overflow-hidden transition-all hover:border-rhine-green/50 ${className}`}
    >
      {/* 扫描线特效：默认隐藏，Hover时从上扫到下 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rhine-green/10 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out pointer-events-none z-0" />
      
      {/* 角标装饰：四个角的小框框 */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-300 group-hover:border-rhine-green transition-colors"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-300 group-hover:border-rhine-green transition-colors"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-300 group-hover:border-rhine-green transition-colors"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gray-300 group-hover:border-rhine-green transition-colors"></div>

      {/* 内容插槽 */}
      <div className="relative z-10">
        {children}
      </div>
    </a>
  );
}
