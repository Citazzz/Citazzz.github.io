import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react'; // 引入关闭图标用于清空标签

// --- 1. 内部组件：高亮文本渲染器 (保持不变) ---
const HighlightText = ({ text, query }) => {
  if (!query.trim()) return text;
  const keywords = query.trim().split(/\s+/).filter(k => k.length > 0);
  if (keywords.length === 0) return text;
  const pattern = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) => (
        keywords.some(k => k.toLowerCase() === part.toLowerCase()) ? (
          <span key={i} className="bg-rhine-green text-black px-0.5 font-bold rounded-sm">
            {part}
          </span>
        ) : (
          part
        )
      ))}
    </>
  );
};

export default function SearchPanel({ posts }) {
  const [query, setQuery] = useState('');
  // 🟢 修改：使用数组存储多选标签
  const [selectedTags, setSelectedTags] = useState([]);
  // 🟢 新增：日期范围筛选
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- URL 参数同步逻辑 (支持多选) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tagsParam = params.get('tags'); // 获取 ?tags=A,B
    if (tagsParam) {
      // 将字符串 "A,B" 转为数组 ["A", "B"]
      setSelectedTags(tagsParam.split(',').filter(Boolean));
    }
    // 同步日期参数
    const startParam = params.get('start');
    const endParam = params.get('end');
    if (startParam) setStartDate(startParam);
    if (endParam) setEndDate(endParam);
  }, []);

  // 提取所有 Tag
  const allTags = useMemo(() => {
    const tags = new Set();
    posts.forEach(post => post.data.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort(); // 这里的 sort 让标签按字母排序，显得整齐
  }, [posts]);

  // --- 2. 核心逻辑：多重筛选与打分 ---
  const processedPosts = useMemo(() => {
    let results = [...posts];

    // 步骤 A: 多标签筛选 (AND 逻辑：文章必须包含所有选中的标签)
    if (selectedTags.length > 0) {
      results = results.filter(post => 
        // 检查 selectedTags 里的每一个 tag，文章是否都有
        selectedTags.every(tag => post.data.tags.includes(tag))
      );
    }

    // 步骤 A.5: 日期范围筛选
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (end) {
        // 包含结束日期当天的所有时间
        end.setHours(23, 59, 59, 999);
      }
      
      results = results.filter(post => {
        const postDate = new Date(post.data.pubDate);
        if (start && postDate < start) return false;
        if (end && postDate > end) return false;
        return true;
      });
    }

    // 步骤 B: 搜索词打分排序
    if (!query.trim()) return results; // 如果没搜词，就返回筛选结果（默认按时间）

    const lowerQuery = query.toLowerCase().trim();
    const keywords = lowerQuery.split(/\s+/).filter(k => k.length > 0);

    const scoredResults = results.map(post => {
      let score = 0;
      const title = post.data.title.toLowerCase();
      const desc = post.data.description.toLowerCase();

      // 规则：标题完整匹配 > 标题关键词 > 描述关键词
      if (title.includes(lowerQuery)) score += 100;

      keywords.forEach(word => {
        if (title.includes(word)) score += 10;
        if (desc.includes(word)) score += 1;
      });

      if (score === 0) return null;
      return { ...post, _score: score };
    }).filter(Boolean);

    // 步骤 C: 排序 (分数优先 -> 时间次之)
    scoredResults.sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      return new Date(b.data.pubDate) - new Date(a.data.pubDate);
    });

    return scoredResults;

  }, [query, selectedTags, startDate, endDate, posts]);

  // --- 标签点击处理 ---
  const toggleTag = (tag) => {
    let newTags;
    if (selectedTags.includes(tag)) {
      // 如果已选中，则移除
      newTags = selectedTags.filter(t => t !== tag);
    } else {
      // 如果未选中，则添加
      newTags = [...selectedTags, tag];
    }
    
    setSelectedTags(newTags);

    // 更新 URL
    const url = new URL(window.location);
    if (newTags.length > 0) {
      url.searchParams.set('tags', newTags.join(','));
    } else {
      url.searchParams.delete('tags');
    }
    window.history.pushState({}, '', url);
  };

  // 清空所有标签
  const clearTags = () => {
    setSelectedTags([]);
    const url = new URL(window.location);
    url.searchParams.delete('tags');
    window.history.pushState({}, '', url);
  };

  // 日期变化处理
  const handleDateChange = (type, value) => {
    const url = new URL(window.location);
    if (type === 'start') {
      setStartDate(value);
      if (value) {
        url.searchParams.set('start', value);
      } else {
        url.searchParams.delete('start');
      }
    } else {
      setEndDate(value);
      if (value) {
        url.searchParams.set('end', value);
      } else {
        url.searchParams.delete('end');
      }
    }
    window.history.pushState({}, '', url);
  };

  // 清空日期
  const clearDates = () => {
    setStartDate('');
    setEndDate('');
    const url = new URL(window.location);
    url.searchParams.delete('start');
    url.searchParams.delete('end');
    window.history.pushState({}, '', url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 🟢 修改：新的控制台布局 */}
      <div className="bg-rhine-dark p-6 mb-8 shadow-lg border-b-4 border-rhine-green">
        
        {/* 上部分：搜索栏 (全宽) */}
        <div className="relative mb-6">
          <span className="absolute left-3 top-3 text-rhine-green font-mono">{'>'}</span>
          <input 
            type="text" 
            placeholder="SEARCH_LOGS..." 
            className="w-full bg-black/30 text-white border border-gray-600 p-3 pl-8 font-mono focus:border-rhine-green focus:outline-none transition-colors placeholder-gray-600"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        {/* 下部分：标签过滤器 (多选 + 自动换行) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-2">
             <span>FILTER_BY_TAGS [{selectedTags.length}]</span>
             {selectedTags.length > 0 && (
                <button onClick={clearTags} className="text-rhine-green hover:underline flex items-center gap-1">
                   CLEAR_ALL <X size={10} />
                </button>
             )}
          </div>

          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button 
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`
                    px-3 py-1.5 text-xs font-mono border transition-all duration-200
                    ${isSelected 
                        ? 'bg-rhine-green text-black border-rhine-green shadow-[0_0_10px_rgba(140,198,63,0.3)]' 
                        : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-400 hover:text-gray-200'
                    }
                  `}
                >
                  {isSelected ? `[x] ${tag}` : tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 日期范围过滤器 */}
        <div className="space-y-2 mt-6">
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-2">
             <span>FILTER_BY_DATE</span>
             {(startDate || endDate) && (
                <button onClick={clearDates} className="text-rhine-green hover:underline flex items-center gap-1">
                   CLEAR <X size={10} />
                </button>
             )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs font-mono text-gray-400">FROM:</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="bg-black/30 text-white border border-gray-600 px-3 py-1.5 text-xs font-mono focus:border-rhine-green focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-mono text-gray-400">TO:</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="bg-black/30 text-white border border-gray-600 px-3 py-1.5 text-xs font-mono focus:border-rhine-green focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 结果列表 */}
      <div className="grid gap-4">
        <AnimatePresence mode='popLayout'>
          {processedPosts.map((post) => (
            <motion.a
              layout
              key={post.slug}
              href={`/blog/${post.slug}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className="block bg-white border border-gray-200 p-6 hover:border-rhine-green transition-colors group relative overflow-hidden"
            >
               <div className="absolute right-0 top-0 p-4 text-6xl font-black text-gray-100 -z-0 pointer-events-none opacity-50">
                 LOG
               </div>

               <div className="relative z-10">
                 <div className="flex gap-2 mb-2 flex-wrap">
                    {post.data.tags.map(tag => (
                        <span 
                            key={tag} 
                            // 如果这个 tag 被选中了，高亮显示，方便用户一眼看出匹配原因
                            className={`text-[10px] font-mono px-1 transition-colors ${selectedTags.includes(tag) ? 'bg-rhine-green text-black' : 'bg-gray-100 text-gray-500'}`}
                        >
                            {tag}
                        </span>
                    ))}
                 </div>

                 {/* 标题高亮 */}
                 <h3 className="text-xl font-bold text-rhine-dark group-hover:text-rhine-green transition-colors">
                    <HighlightText text={post.data.title} query={query} />
                 </h3>
                 
                 {/* 描述高亮 */}
                 <p className="text-sm text-gray-500 mt-2 font-mono">
                    {post.data.pubDate.toString().slice(0,10)} // <HighlightText text={post.data.description} query={query} />
                 </p>
               </div>
            </motion.a>
          ))}
        </AnimatePresence>
        
        {processedPosts.length === 0 && (
            <div className="text-center py-20 text-gray-400 font-mono border-2 border-dashed border-gray-200">
                NO_DATA_FOUND // 请尝试减少筛选条件
            </div>
        )}
      </div>
    </div>
  );
}