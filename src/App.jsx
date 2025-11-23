import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import toast, { Toaster } from 'react-hot-toast'
import { convertWhitespace } from './lib/whitespaceConverter'
import { replaceText, DEFAULT_RULES } from './lib/textReplacer'

const HISTORY_KEY = 'fb-poster-history'
const SETTINGS_KEY = 'fb-poster-settings'
const MAX_HISTORY = 50

function App() {
  const { t, i18n } = useTranslation()
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [replacementRules, setReplacementRules] = useState(DEFAULT_RULES)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [outputFormat, setOutputFormat] = useState('plain') // 'plain' 或 'fb'

  // refs for textarea synchronization
  const inputRef = useRef(null)
  const outputRef = useRef(null)

  // 同步捲動
  const handleInputScroll = () => {
    if (inputRef.current && outputRef.current) {
      outputRef.current.scrollTop = inputRef.current.scrollTop
    }
  }

  const handleOutputScroll = () => {
    if (inputRef.current && outputRef.current) {
      inputRef.current.scrollTop = outputRef.current.scrollTop
    }
  }

  // 同步高度
  useEffect(() => {
    const adjustHeight = () => {
      if (inputRef.current && outputRef.current) {
        // 保存當前滾動位置和游標位置
        const inputScrollTop = inputRef.current.scrollTop
        const outputScrollTop = outputRef.current.scrollTop
        const selectionStart = inputRef.current.selectionStart
        const selectionEnd = inputRef.current.selectionEnd
        const activeElement = document.activeElement

        // 重置高度以獲取正確的 scrollHeight
        inputRef.current.style.height = 'auto'
        outputRef.current.style.height = 'auto'

        // 取得兩者中較高的那個
        const inputHeight = inputRef.current.scrollHeight
        const outputHeight = outputRef.current.scrollHeight
        const maxHeight = Math.max(inputHeight, outputHeight)

        // 設定相同的高度,最小 300px
        const finalHeight = Math.max(maxHeight, 300)
        inputRef.current.style.height = `${finalHeight}px`
        outputRef.current.style.height = `${finalHeight}px`

        // 恢復滾動位置
        inputRef.current.scrollTop = inputScrollTop
        outputRef.current.scrollTop = outputScrollTop

        // 如果 input 是當前焦點元素,恢復游標位置
        if (activeElement === inputRef.current) {
          inputRef.current.setSelectionRange(selectionStart, selectionEnd)
        }
      }
    }

    // 使用 requestAnimationFrame 避免跳動
    requestAnimationFrame(adjustHeight)
  }, [inputText, outputText])

  // 切換語言
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
  }

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
    if (confirm(t('history.confirm'))) {
      setHistory([])
      localStorage.removeItem(HISTORY_KEY)
    }
  }

  // 複製到剪貼簿
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('toast.copySuccess'), {
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
      toast.error(t('toast.copyError'), {
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
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="title-brutalist text-brutalist-white border-brutalist-white">
                {t('app.title')}
              </h1>
              <p className="mt-4 text-lg md:text-xl font-bold text-brutalist-white uppercase">
                {t('app.subtitle')}
              </p>
            </div>
            {/* 語言切換器 */}
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 font-bold border-4 border-brutalist-black transition-all ${
                  i18n.language === 'zh-TW'
                    ? 'bg-brutalist-yellow text-brutalist-black'
                    : 'bg-brutalist-white text-brutalist-black hover:translate-x-1 hover:translate-y-1'
                }`}
                onClick={() => changeLanguage('zh-TW')}
              >
                繁中
              </button>
              <button
                className={`px-4 py-2 font-bold border-4 border-brutalist-black transition-all ${
                  i18n.language === 'en'
                    ? 'bg-brutalist-yellow text-brutalist-black'
                    : 'bg-brutalist-white text-brutalist-black hover:translate-x-1 hover:translate-y-1'
                }`}
                onClick={() => changeLanguage('en')}
              >
                EN
              </button>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左欄：輸入區 */}
          <div className="space-y-6">
            {/* 輸入框 */}
            <div className="container-brutalist p-6 bg-brutalist-white">
              <h2 className="text-2xl font-bold uppercase mb-4 border-b-4 border-brutalist-black pb-2">
                {t('input.title')}
              </h2>
              <textarea
                id="input"
                ref={inputRef}
                className="input-brutalist min-h-[300px] resize-none overflow-y-auto"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onScroll={handleInputScroll}
                placeholder={t('input.placeholder')}
              />
            </div>

            {/* 轉換與複製按鈕 */}
            <div className="container-brutalist p-6 bg-brutalist-white">
              <button
                className="btn-brutalist-primary w-full text-xl py-4"
                onClick={handleConvertAndCopy}
              >
                {t('buttons.convertAndCopy')}
              </button>
            </div>

            {/* 說明 */}
            <div className="container-brutalist p-6 bg-brutalist-yellow border-brutalist-black">
              <h3 className="text-2xl font-bold uppercase mb-3">{t('instructions.title')}</h3>
              <div className="space-y-3 font-mono text-base">
                <div>
                  <p className="font-bold mb-2">{t('instructions.problem.title')}</p>
                  <p className="pl-4">{t('instructions.problem.line1')}</p>
                  <p className="pl-4">{t('instructions.problem.line2')}</p>
                </div>
                <hr className="border-2 border-brutalist-black my-3" />
                <div>
                  <p className="font-bold mb-1">{t('instructions.step1.title')}</p>
                  <p className="pl-4">{t('instructions.step1.line1')}</p>
                  <p className="pl-4">{t('instructions.step1.line2')}</p>
                </div>
                <div>
                  <p className="font-bold mb-1">{t('instructions.step2.title')}</p>
                  <p className="pl-4">{t('instructions.step2.line1')}</p>
                  <p className="pl-4">{t('instructions.step2.line2')}</p>
                </div>
                <hr className="border-2 border-brutalist-black my-3" />
                <div>
                  <p className="font-bold mb-2">{t('instructions.rules.title')}</p>
                  <p className="pl-4">{t('instructions.rules.rule1')}</p>
                  <p className="pl-4">{t('instructions.rules.rule2')}</p>
                  <p className="pl-4">{t('instructions.rules.rule3')}</p>
                  <p className="pl-4">{t('instructions.rules.rule4')}</p>
                  <p className="pl-4">{t('instructions.rules.rule5')}</p>
                  <p className="pl-4 mt-2 text-sm">{t('instructions.rules.note')}</p>
                </div>
              </div>
            </div>

            {/* 歷史紀錄 */}
            <div className="container-brutalist p-6 bg-brutalist-pink">
              <div className="flex justify-between items-center mb-4 border-b-4 border-brutalist-black pb-2">
                <h3 className="text-2xl font-bold uppercase text-brutalist-black">{t('history.title')}</h3>
                <div className="flex gap-2">
                  <button
                    className="text-sm px-3 py-1 bg-white text-black border-2 border-brutalist-black font-bold hover:translate-x-1 hover:translate-y-1 transition-transform"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    {showHistory ? t('buttons.collapse') : `${t('buttons.expand')} (${history.length})`}
                  </button>
                  {history.length > 0 && (
                    <button
                      className="btn-brutalist-danger text-sm px-3 py-1"
                      onClick={clearAllHistory}
                    >
                      {t('buttons.clear')}
                    </button>
                  )}
                </div>
              </div>

              {showHistory && (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-brutalist-black text-center py-4 font-mono bg-white p-4 border-4 border-brutalist-black">
                      {t('history.empty')}
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
                              {new Date(record.timestamp).toLocaleString(i18n.language === 'zh-TW' ? 'zh-TW' : 'en-US')}
                            </span>
                            {record.format && (
                              <span className={`text-xs px-2 py-0.5 mt-1 inline-block border border-black font-bold ${
                                record.format === 'fb' 
                                  ? 'bg-brutalist-green text-black' 
                                  : 'bg-gray-200 text-black'
                              }`}>
                                {t(`history.format.${record.format}`)}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="text-xs px-2 py-1 bg-white text-black border-2 border-brutalist-black font-bold hover:translate-x-1 hover:translate-y-1 transition-transform"
                              onClick={() => loadFromHistory(record)}
                            >
                              {t('buttons.load')}
                            </button>
                            <button
                              className="text-xs px-2 py-1 bg-brutalist-red text-brutalist-white border-2 border-brutalist-black font-bold hover:bg-brutalist-orange"
                              onClick={() => deleteHistoryItem(record.id)}
                            >
                              {t('buttons.deleteItem')}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-mono truncate mb-1 text-brutalist-black">
                          <strong>{t('history.input')}</strong>{record.input}
                        </p>
                        <p className="text-sm font-mono truncate text-brutalist-black">
                          <strong>{t('history.output')}</strong>{record.output}
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
                  {t('output.title')}
                </h2>
              </div>
              <textarea
                id="output"
                ref={outputRef}
                className="input-brutalist min-h-[300px] resize-none overflow-y-auto bg-gray-50"
                value={outputText}
                readOnly
                onScroll={handleOutputScroll}
                placeholder={t('output.placeholder')}
              />
            </div>

            {/* 文字替換規則 */}
            <div className="container-brutalist p-6 bg-brutalist-blue">
              <h2 className="text-2xl font-bold uppercase mb-4 text-brutalist-black border-b-4 border-brutalist-black pb-2">
                {t('rules.title')}
              </h2>
              <div className="space-y-3">
                {replacementRules.map((rule, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="input-brutalist flex-1 p-2 text-sm"
                      placeholder={t('rules.fromPlaceholder')}
                      value={rule.from}
                      onChange={(e) => updateRule(index, 'from', e.target.value)}
                    />
                    <span className="text-2xl font-bold text-brutalist-white">→</span>
                    <input
                      type="text"
                      className="input-brutalist flex-1 p-2 text-sm"
                      placeholder={t('rules.toPlaceholder')}
                      value={rule.to}
                      onChange={(e) => updateRule(index, 'to', e.target.value)}
                    />
                    <button
                      className="btn-brutalist-danger text-sm px-4 py-2"
                      onClick={() => removeRule(index)}
                    >
                      {t('buttons.delete')}
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button className="btn-brutalist-secondary flex-1" onClick={addRule}>
                  {t('buttons.add')}
                </button>
                <button className="btn-brutalist text-sm" onClick={loadDefaultRules}>
                  {t('buttons.loadDefault')}
                </button>
              </div>
            </div>

            {/* 輸出格式選擇 */}
            <div className="container-brutalist p-6 bg-brutalist-green">
              <h2 className="text-2xl font-bold uppercase mb-4 border-b-4 border-brutalist-black pb-2">
                {t('format.title')}
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
                    <span className="text-lg font-bold uppercase block">{t('format.plain.title')}</span>
                    <span className="text-sm text-gray-600">{t('format.plain.description')}</span>
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
                    <span className="text-lg font-bold uppercase block">{t('format.fb.title')}</span>
                    <span className="text-sm text-gray-600">{t('format.fb.description')}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Copyright */}
        <footer className="container-brutalist p-4 bg-brutalist-white text-center">
          <p className="font-mono text-brutalist-black uppercase tracking-wide">
            {t('footer.copyright')}
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
