import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Eye, Edit, Copy, Check, Code } from 'lucide-react';

interface EnhancedEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme?: 'light' | 'dark';
  height?: number;
  placeholder?: string;
}

export function EnhancedEditor({ 
  value, 
  onChange, 
  theme = 'light', 
  height = 400,
  placeholder = '开始写作...'
}: EnhancedEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview' | 'live'>('edit');
  const [copiedBlocks, setCopiedBlocks] = useState<Set<number>>(new Set());

  // 插入代码块模板
  const insertCodeBlock = (language = '') => {
    const codeTemplate = `\`\`\`${language}\n// 在这里输入你的代码\n\`\`\`\n\n`;
    const newValue = value + codeTemplate;
    onChange(newValue);
  };

  // 复制代码块内容
  const copyCodeBlock = async (code: string, blockIndex: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedBlocks(prev => new Set(prev).add(blockIndex));
      setTimeout(() => {
        setCopiedBlocks(prev => {
          const newSet = new Set(prev);
          newSet.delete(blockIndex);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 自定义渲染代码块，添加复制按钮
  const customComponents = {
    code: ({ children, className, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const code = String(children).replace(/\n$/, '');
      const blockIndex = Math.random();
      const isCopied = copiedBlocks.has(blockIndex);

      if (className) {
        return (
          <div className="relative group">
            <div className={`absolute top-2 right-2 z-10 flex items-center gap-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {language && (
                <span className={`text-xs px-2 py-1 rounded ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  {language}
                </span>
              )}
              <button
                onClick={() => copyCodeBlock(code, blockIndex)}
                className={`p-1.5 rounded transition-all hover:scale-110 ${
                  isCopied
                    ? 'bg-green-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                }`}
                title={isCopied ? '已复制!' : '复制代码'}
              >
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <pre className={className} {...props}>
              <code>{children}</code>
            </pre>
          </div>
        );
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* 编辑器工具栏 */}
      <div className="flex items-center justify-between">
        <div className={`flex rounded-lg p-1 ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <button
            onClick={() => setMode('edit')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === 'edit'
                ? theme === 'dark'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-800 shadow-sm'
                : theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Edit size={14} />
            编辑
          </button>
          
          <button
            onClick={() => setMode('preview')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === 'preview'
                ? theme === 'dark'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-800 shadow-sm'
                : theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Eye size={14} />
            预览
          </button>
          
          <button
            onClick={() => setMode('live')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === 'live'
                ? theme === 'dark'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-800 shadow-sm'
                : theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Eye size={14} />
            <Edit size={14} />
            分屏
          </button>
        </div>

        {/* 快捷插入按钮 */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Code size={14} />
              插入代码
            </button>
            
            {/* 代码语言选择下拉菜单 */}
            <div className={`absolute top-full mt-1 right-0 min-w-32 rounded-lg border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              {[
                { label: '纯文本', value: '' },
                { label: 'JavaScript', value: 'javascript' },
                { label: 'TypeScript', value: 'typescript' },
                { label: 'Python', value: 'python' },
                { label: 'Java', value: 'java' },
                { label: 'C++', value: 'cpp' },
                { label: 'HTML', value: 'html' },
                { label: 'CSS', value: 'css' },
                { label: 'SQL', value: 'sql' },
                { label: 'Bash', value: 'bash' },
                { label: 'JSON', value: 'json' },
                { label: 'Markdown', value: 'markdown' },
              ].map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => insertCodeBlock(lang.value)}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  } first:rounded-t-lg last:rounded-b-lg`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 编辑器主体 */}
      <div data-color-mode={theme} className="w-full">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          preview={mode === 'edit' ? 'edit' : mode === 'preview' ? 'preview' : 'live'}
          height={height}
          visibleDragbar={false}
          components={{
            preview: (source, state, dispatch) => {
              return (
                <MDEditor.Markdown
                  source={source}
                  components={customComponents}
                />
              );
            }
          }}
          data-color-mode={theme}
          textareaProps={{
            placeholder,
            style: {
              fontSize: 14,
              lineHeight: 1.6,
              fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
            }
          }}
        />
      </div>

      {/* 编辑器状态栏 */}
      <div className={`flex items-center justify-between text-xs ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <div className="flex items-center gap-4">
          <span>字数：{value.length}</span>
          <span>行数：{value.split('\n').length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>支持 Markdown 语法</span>
          <span>•</span>
          <span>Ctrl+S 快速保存</span>
        </div>
      </div>
    </div>
  );
}
