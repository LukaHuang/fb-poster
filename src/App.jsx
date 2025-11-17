import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { convertWhitespace } from './lib/whitespaceConverter'
import { replaceText, DEFAULT_RULES } from './lib/textReplacer'

const HISTORY_KEY = 'fb-poster-history'
const SETTINGS_KEY = 'fb-poster-settings'
const MAX_HISTORY = 50

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [replacementRules, setReplacementRules] = useState(DEFAULT_RULES)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [outputFormat, setOutputFormat] = useState('plain') // 'plain' 或 'fb'

  // 載入歷史紀錄和設定
  useEffect(() => {
    // 載入歷史紀錄
    const savedHistory = localStorage.getItem(HISTORY_KEY)
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }

    // 載入設定
    const savedSettings = localStorage.getItem(SETTINGS_KEY)
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (settings.replacementRules) setReplacementRules(settings.replacementRules)
        if (settings.outputFormat) setOutputFormat(settings.outputFormat)
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
    }
  }, [])

  // 儲存設定到 localStorage
  useEffect(() => {
    const settings = {
      replacementRules,
      outputFormat
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [replacementRules, outputFormat])

  // 儲存到歷史紀錄
  const saveToHistory = (input, output, format) => {
    if (!input || !output) return

    const newRecord = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      input,
      output,
      format // 記錄使用的格式
    }

    const newHistory = [newRecord, ...history].slice(0, MAX_HISTORY)
    setHistory(newHistory)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
  }

  // 從歷史紀錄載入
  const loadFromHistory = (record) => {
    setInputText(record.input)
    setShowHistory(false)
    // 滾動到頁面頂部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 刪除單筆歷史紀錄
  const deleteHistoryItem = (id) => {
    const newHistory = history.filter(item => item.id !== id)
    setHistory(newHistory)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
  }

  // 清空所有歷史紀錄
  const clearAllHistory = () => {
    if (confirm('確定要清空所有歷史紀錄嗎？')) {
      setHistory([])
      localStorage.removeItem(HISTORY_KEY)
    }
  }

  // 複製到剪貼簿
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('✓ 已成功複製到剪貼簿！', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#fbbf24',
          color: '#000',
          fontWeight: 'bold',
          fontSize: '18px',
          padding: '16px 24px',
          border: '4px solid #000',
          boxShadow: '8px 8px 0 0 #000',
        },
        icon: '📋',
      })
    } catch (err) {
      toast.error('❌ 複製失敗，請手動複製', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '18px',
          padding: '16px 24px',
          border: '4px solid #000',
          boxShadow: '8px 8px 0 0 #000',
        },
      })
    }
  }

  // 自動執行轉換
  const performConversion = (text) => {
    let result = replaceText(text, replacementRules)
    
    // 如果是 FB 發文格式，加上 whitespace 轉換
    if (outputFormat === 'fb') {
      result = convertWhitespace(result)
    }
    
    return result
  }

  // 當輸入改變時，自動轉換
  useEffect(() => {
    if (inputText) {
      const result = performConversion(inputText)
      setOutputText(result)
    } else {
      setOutputText('')
    }
  }, [inputText, replacementRules, outputFormat])

  // 處理貼上事件 - 一貼上就自動轉換並複製
  const handlePaste = async (e) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    setInputText(pastedText)

    // 貼上後自動轉換並複製
    const result = performConversion(pastedText)
    setOutputText(result)

    if (result) {
      copyToClipboard(result)
      if (result !== pastedText) {
        saveToHistory(pastedText, result, outputFormat)
      }
    }
  }

  // 轉換與複製按鈕
  const handleConvertAndCopy = () => {
    if (inputText) {
      const result = performConversion(inputText)
      setOutputText(result)

      if (result) {
        copyToClipboard(result)
        saveToHistory(inputText, result, outputFormat)
      }
    }
  }

  // 新增規則
  const addRule = () => {
    setReplacementRules([...replacementRules, { from: '', to: '' }])
  }

  // 刪除規則
  const removeRule = (index) => {
    const newRules = replacementRules.filter((_, i) => i !== index)
    setReplacementRules(newRules)
  }

  // 更新規則
  const updateRule = (index, field, value) => {
    const newRules = [...replacementRules]
    newRules[index][field] = value
    setReplacementRules(newRules)
  }

  // 載入預設規則
  const loadDefaultRules = () => {
    setReplacementRules(DEFAULT_RULES)
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Toaster />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - 野獸派風格 */}
        <header className="container-brutalist p-6 md:p-8 bg-brutalist-red">
          <h1 className="title-brutalist text-brutalist-white border-brutalist-white">
            CLAUDE 發文救星
          </h1>
          <p className="mt-4 text-lg md:text-xl font-bold text-brutalist-white uppercase">
            用來取代 Claude 輸出的奇怪字元
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左欄：輸入區 */}
          <div className="space-y-6">
            {/* 輸入框 */}
            <div className="container-brutalist p-6 bg-brutalist-white">
              <h2 className="text-2xl font-bold uppercase mb-4 border-b-4 border-brutalist-black pb-2">
                📝 輸入文字
              </h2>
              <textarea
                id="input"
                className="input-brutalist min-h-[300px] resize-y"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onPaste={handlePaste}
                placeholder="輸入或貼上文字..."
              />
            </div>

            {/* 轉換與複製按鈕 */}
            <div className="container-brutalist p-6 bg-brutalist-white">
              <button
                className="btn-brutalist-primary w-full text-xl py-4"
                onClick={handleConvertAndCopy}
              >
                🚀 轉換與複製
              </button>
            </div>

            {/* 說明 */}
            <div className="container-brutalist p-6 bg-brutalist-yellow border-brutalist-black">
              <h3 className="text-2xl font-bold uppercase mb-3">💡 使用說明</h3>
              <div className="space-y-3 font-mono text-base">
                <div>
                  <p className="font-bold mb-2">🎯 這個工具解決什麼問題？</p>
                  <p className="pl-4">Claude 輸出的文字常常有奇怪的英文標點符號</p>
                  <p className="pl-4">自動轉換成適合發文的中文標點符號</p>
                </div>
                <hr className="border-2 border-brutalist-black my-3" />
                <div>
                  <p className="font-bold mb-1">📝 步驟一：貼上文字</p>
                  <p className="pl-4">在左側輸入框貼上 Claude 的輸出</p>
                  <p className="pl-4">⚡ 貼上後會瞬間自動轉換並複製</p>
                </div>
                <div>
                  <p className="font-bold mb-1">📋 步驟二：直接貼到社群</p>
                  <p className="pl-4">轉換完成自動複製到剪貼簿</p>
                  <p className="pl-4">直接到 Facebook、Instagram 貼上即可</p>
                </div>
                <hr className="border-2 border-brutalist-black my-3" />
                <div>
                  <p className="font-bold mb-2">🛠️ 預設轉換規則</p>
                  <p className="pl-4">• 英文逗號+空白 → 中文逗號</p>
                  <p className="pl-4">• 英文句號 → 中文句號</p>
                  <p className="pl-4">• 英文驚嘆號 → 中文驚嘆號</p>
                  <p className="pl-4">• 英文問號 → 中文問號</p>
                  <p className="pl-4">• 連字號 → 項目符號</p>
                  <p className="pl-4 mt-2 text-sm">※ 可以在右側自訂替換規則</p>
                </div>
              </div>
            </div>

            {/* 歷史紀錄 */}
            <div className="container-brutalist p-6 bg-brutalist-pink">
              <div className="flex justify-between items-center mb-4 border-b-4 border-brutalist-black pb-2">
                <h3 className="text-2xl font-bold uppercase text-brutalist-black">📜 歷史紀錄</h3>
                <div className="flex gap-2">
                  <button
                    className="text-sm px-3 py-1 bg-white text-black border-2 border-brutalist-black font-bold hover:translate-x-1 hover:translate-y-1 transition-transform"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    {showHistory ? '收合' : `展開 (${history.length})`}
                  </button>
                  {history.length > 0 && (
                    <button
                      className="btn-brutalist-danger text-sm px-3 py-1"
                      onClick={clearAllHistory}
                    >
                      清空
                    </button>
                  )}
                </div>
              </div>

              {showHistory && (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-brutalist-black text-center py-4 font-mono bg-white p-4 border-4 border-brutalist-black">
                      尚無歷史紀錄
                    </p>
                  ) : (
                    history.map((record) => (
                      <div
                        key={record.id}
                        className="bg-white border-4 border-brutalist-black p-3 hover:translate-x-1 hover:translate-y-1 transition-transform"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs font-mono text-gray-600 block">
                              {new Date(record.timestamp).toLocaleString('zh-TW')}
                            </span>
                            {record.format && (
                              <span className={`text-xs px-2 py-0.5 mt-1 inline-block border border-black font-bold ${
                                record.format === 'fb' 
                                  ? 'bg-brutalist-green text-black' 
                                  : 'bg-gray-200 text-black'
                              }`}>
                                {record.format === 'fb' ? 'FB 格式' : '純文字'}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="text-xs px-2 py-1 bg-white text-black border-2 border-brutalist-black font-bold hover:translate-x-1 hover:translate-y-1 transition-transform"
                              onClick={() => loadFromHistory(record)}
                            >
                              載入
                            </button>
                            <button
                              className="text-xs px-2 py-1 bg-brutalist-red text-brutalist-white border-2 border-brutalist-black font-bold hover:bg-brutalist-orange"
                              onClick={() => deleteHistoryItem(record.id)}
                            >
                              刪除
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-mono truncate mb-1 text-brutalist-black">
                          <strong>輸入：</strong>{record.input}
                        </p>
                        <p className="text-sm font-mono truncate text-brutalist-black">
                          <strong>輸出：</strong>{record.output}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 右欄：輸出區 */}
          <div className="space-y-6">
            {/* 輸出框 */}
            <div className="container-brutalist p-6 bg-brutalist-white relative">
              <div className="flex justify-between items-center mb-4 border-b-4 border-brutalist-black pb-2">
                <h2 className="text-2xl font-bold uppercase">
                  ✨ 轉換結果
                </h2>
              </div>
              <textarea
                id="output"
                className="input-brutalist min-h-[300px] resize-y bg-gray-50"
                value={outputText}
                readOnly
                placeholder="轉換結果會自動顯示並複製..."
              />
            </div>

            {/* 文字替換規則 */}
            <div className="container-brutalist p-6 bg-brutalist-blue">
              <h2 className="text-2xl font-bold uppercase mb-4 text-brutalist-black border-b-4 border-brutalist-black pb-2">
                ⚙️ 文字替換規則
              </h2>
              <div className="space-y-3">
                {replacementRules.map((rule, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="input-brutalist flex-1 p-2 text-sm"
                      placeholder="原文字"
                      value={rule.from}
                      onChange={(e) => updateRule(index, 'from', e.target.value)}
                    />
                    <span className="text-2xl font-bold text-brutalist-white">→</span>
                    <input
                      type="text"
                      className="input-brutalist flex-1 p-2 text-sm"
                      placeholder="替換文字"
                      value={rule.to}
                      onChange={(e) => updateRule(index, 'to', e.target.value)}
                    />
                    <button
                      className="btn-brutalist-danger text-sm px-4 py-2"
                      onClick={() => removeRule(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button className="btn-brutalist-secondary flex-1" onClick={addRule}>
                  + 新增
                </button>
                <button className="btn-brutalist text-sm" onClick={loadDefaultRules}>
                  載入預設
                </button>
              </div>
            </div>

            {/* 輸出格式選擇 */}
            <div className="container-brutalist p-6 bg-brutalist-green">
              <h2 className="text-2xl font-bold uppercase mb-4 border-b-4 border-brutalist-black pb-2">
                📋 輸出格式
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-white border-4 border-brutalist-black hover:translate-x-1 hover:translate-y-1 transition-transform">
                  <input
                    type="radio"
                    name="outputFormat"
                    value="plain"
                    checked={outputFormat === 'plain'}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <div>
                    <span className="text-lg font-bold uppercase block">純文字</span>
                    <span className="text-sm text-gray-600">只轉換標點符號</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-white border-4 border-brutalist-black hover:translate-x-1 hover:translate-y-1 transition-transform">
                  <input
                    type="radio"
                    name="outputFormat"
                    value="fb"
                    checked={outputFormat === 'fb'}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <div>
                    <span className="text-lg font-bold uppercase block">FB 發文格式</span>
                    <span className="text-sm text-gray-600">保留空白與換行</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Copyright */}
        <footer className="container-brutalist p-4 bg-brutalist-white text-center">
          <p className="font-mono text-brutalist-black uppercase tracking-wide">
            © 2025 @LukaHuang - All Rights Reserved
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
