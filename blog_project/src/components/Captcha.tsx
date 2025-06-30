import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onCaptchaChange: (value: string, isValid: boolean) => void;
  theme?: 'light' | 'dark';
  className?: string;
}

export function Captcha({ onCaptchaChange, theme = 'light', className = '' }: CaptchaProps) {
  const [challenge, setChallenge] = useState({ question: '', answer: '' });
  const [userAnswer, setUserAnswer] = useState('');

  const generateChallenge = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number, question: string;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 25;
        num2 = Math.floor(Math.random() * 25) + 1;
        answer = num1 - num2;
        question = `${num1} - ${num2} = ?`;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
        question = `${num1} × ${num2} = ?`;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
        question = '1 + 1 = ?';
    }
    
    setChallenge({ question, answer: answer.toString() });
    setUserAnswer('');
    onCaptchaChange('', false);
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  const handleAnswerChange = (value: string) => {
    setUserAnswer(value);
    const isValid = value.trim() === challenge.answer;
    onCaptchaChange(value, isValid);
  };

  const isCorrect = userAnswer.trim() === challenge.answer;
  const hasAnswer = userAnswer.trim().length > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      <label className={`block text-sm font-medium ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        人机验证
      </label>
      
      <div className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
        theme === 'dark' 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        {/* Challenge Display */}
        <div className={`flex-1 text-center py-2 px-4 rounded font-mono text-lg ${
          theme === 'dark' 
            ? 'bg-gray-800 text-gray-200 border-gray-600' 
            : 'bg-white text-gray-800 border-gray-300'
        } border`}>
          {challenge.question}
        </div>
        
        {/* Answer Input */}
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          className={`w-20 px-3 py-2 text-center rounded border transition-all focus:outline-none focus:ring-2 ${
            hasAnswer
              ? isCorrect
                ? 'border-green-500 bg-green-50 text-green-800 focus:ring-green-500'
                : 'border-red-500 bg-red-50 text-red-800 focus:ring-red-500'
              : theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white focus:ring-blue-500'
                : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'
          }`}
          placeholder="?"
        />
        
        {/* Refresh Button */}
        <button
          type="button"
          onClick={generateChallenge}
          className={`p-2 rounded transition-colors ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-white hover:bg-gray-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
          }`}
          title="刷新验证码"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      
      {/* Status Indicator */}
      {hasAnswer && (
        <div className={`text-sm flex items-center gap-2 ${
          isCorrect ? 'text-green-600' : 'text-red-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isCorrect ? 'bg-green-500' : 'bg-red-500'
          }`} />
          {isCorrect ? '验证通过' : '答案错误，请重试'}
        </div>
      )}
    </div>
  );
}
