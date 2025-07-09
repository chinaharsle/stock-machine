'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VercelDebugPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTest, setActiveTest] = useState<string>('');

  const runTest = async (action: string) => {
    setLoading(true);
    setActiveTest(action);
    
    try {
      const response = await fetch('/api/vercel-debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      setResults({
        success: false,
        message: '测试失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
      setActiveTest('');
    }
  };

  const tests = [
    {
      id: 'check-env',
      title: '检查环境变量',
      description: '验证所有邮件相关环境变量是否正确设置',
      color: 'bg-blue-500'
    },
    {
      id: 'test-vercel-connection',
      title: '测试SMTP连接',
      description: '验证Vercel环境是否能连接到邮件服务器',
      color: 'bg-green-500'
    },
    {
      id: 'test-vercel-send',
      title: '发送测试邮件',
      description: '在Vercel环境中发送一封测试邮件',
      color: 'bg-purple-500'
    },
    {
      id: 'test-alternatives',
      title: '查看备用方案',
      description: '获取Gmail、SendGrid等备用邮件服务配置',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vercel邮件调试工具</h1>
        <p className="text-gray-600">诊断和解决Vercel部署环境中的邮件发送问题</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {tests.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className={`w-3 h-3 rounded-full ${test.color} mb-2`}></div>
              <CardTitle className="text-lg">{test.title}</CardTitle>
              <CardDescription className="text-sm">
                {test.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => runTest(test.id)}
                disabled={loading}
                className="w-full"
                variant={activeTest === test.id ? "default" : "outline"}
              >
                {loading && activeTest === test.id ? '测试中...' : '运行测试'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.success ? (
                <span className="text-green-500">✅ 成功</span>
              ) : (
                <span className="text-red-500">❌ 失败</span>
              )}
              测试结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 