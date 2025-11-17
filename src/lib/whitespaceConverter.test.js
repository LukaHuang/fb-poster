import { describe, it, expect } from 'vitest'
import {
  convertWhitespace,
  removeZeroWidthSpaces,
  hasZeroWidthSpaces,
  addSpacingAfterSpaces,
  addExtraLineBreaks,
} from './whitespaceConverter'

const ZERO_WIDTH_SPACE = '\u200B'

describe('whitespaceConverter', () => {
  describe('convertWhitespace', () => {
    it('應該在每個空格後插入零寬度空格', () => {
      const input = 'Hello World'
      const output = convertWhitespace(input)

      expect(output).toContain(ZERO_WIDTH_SPACE)
      expect(output).toBe(`Hello ${ZERO_WIDTH_SPACE}World`)
    })

    it('應該在連續空格後都插入零寬度空格', () => {
      const input = 'Hello  World'
      const output = convertWhitespace(input)

      // 兩個空格都應該被處理
      const zwsCount = (output.match(/\u200B/g) || []).length
      expect(zwsCount).toBe(2)
    })

    it('應該處理多個連續空格', () => {
      const input = 'Test    multiple    spaces'
      const output = convertWhitespace(input)

      // 每個空格後面都應該有零寬度空格
      expect(output).toContain(ZERO_WIDTH_SPACE)
      expect(output.length).toBeGreaterThan(input.length)
    })

    it('應該在每個換行後插入零寬度空格', () => {
      const input = 'Line 1\nLine 2'
      const output = convertWhitespace(input)

      expect(output).toContain(ZERO_WIDTH_SPACE)
      expect(output).toBe(`Line 1\n${ZERO_WIDTH_SPACE}Line 2`)
    })

    it('應該在連續換行後都插入零寬度空格', () => {
      const input = 'Line 1\n\nLine 2'
      const output = convertWhitespace(input)

      // 兩個換行都應該被處理
      const zwsCount = (output.match(/\u200B/g) || []).length
      expect(zwsCount).toBe(2)
    })

    it('應該處理多個連續換行', () => {
      const input = 'Paragraph 1\n\n\nParagraph 2'
      const output = convertWhitespace(input)

      expect(output).toContain(ZERO_WIDTH_SPACE)
      // 換行應該被保留
      const newlineCount = (output.match(/\n/g) || []).length
      expect(newlineCount).toBe(3)
      // 應該有3個零寬度空格（每個換行後一個）
      const zwsCount = (output.match(/\u200B/g) || []).length
      expect(zwsCount).toBe(3)
    })

    it('應該處理空字串', () => {
      expect(convertWhitespace('')).toBe('')
    })

    it('應該處理 null 或 undefined', () => {
      expect(convertWhitespace(null)).toBe('')
      expect(convertWhitespace(undefined)).toBe('')
    })

    it('應該處理混合情況（空格和換行）', () => {
      const input = 'Title\n\n\nContent  with  spaces'
      const output = convertWhitespace(input)

      expect(output).toContain(ZERO_WIDTH_SPACE)
      expect(output).toContain('\n')
      // 3個換行 + 4個空格 = 7個零寬度空格
      const zwsCount = (output.match(/\u200B/g) || []).length
      expect(zwsCount).toBe(7)
    })

    it('應該保留原始文字內容', () => {
      const input = 'Hello  World\n\nTest'
      const output = convertWhitespace(input)

      // 移除零寬度空格後應該等於原始輸入
      const cleaned = output.replace(/\u200B/g, '')
      expect(cleaned).toBe(input)
    })

    it('應該在每個空格和換行後插入零寬度空格', () => {
      const input = 'A B\nC'
      const output = convertWhitespace(input)
      
      // 應該有2個零寬度空格（1個空格 + 1個換行）
      const zwsCount = (output.match(/\u200B/g) || []).length
      expect(zwsCount).toBe(2)
      expect(output).toBe(`A ${ZERO_WIDTH_SPACE}B\n${ZERO_WIDTH_SPACE}C`)
    })
  })

  describe('removeZeroWidthSpaces', () => {
    it('應該移除所有零寬度空格', () => {
      const input = `Hello${ZERO_WIDTH_SPACE}World`
      const output = removeZeroWidthSpaces(input)

      expect(output).toBe('HelloWorld')
      expect(output).not.toContain(ZERO_WIDTH_SPACE)
    })

    it('應該移除多個零寬度空格', () => {
      const input = `A${ZERO_WIDTH_SPACE}B${ZERO_WIDTH_SPACE}C${ZERO_WIDTH_SPACE}D`
      const output = removeZeroWidthSpaces(input)

      expect(output).toBe('ABCD')
    })

    it('應該處理空字串', () => {
      expect(removeZeroWidthSpaces('')).toBe('')
    })

    it('應該處理 null 或 undefined', () => {
      expect(removeZeroWidthSpaces(null)).toBe('')
      expect(removeZeroWidthSpaces(undefined)).toBe('')
    })

    it('應該不影響沒有零寬度空格的文字', () => {
      const input = 'Normal text without special chars'
      const output = removeZeroWidthSpaces(input)

      expect(output).toBe(input)
    })
  })

  describe('hasZeroWidthSpaces', () => {
    it('應該檢測到零寬度空格', () => {
      const input = `Hello${ZERO_WIDTH_SPACE}World`
      expect(hasZeroWidthSpaces(input)).toBe(true)
    })

    it('應該回傳 false 當沒有零寬度空格', () => {
      const input = 'Normal text'
      expect(hasZeroWidthSpaces(input)).toBe(false)
    })

    it('應該處理空字串', () => {
      expect(hasZeroWidthSpaces('')).toBe(false)
    })

    it('應該處理 null 或 undefined', () => {
      expect(hasZeroWidthSpaces(null)).toBe(false)
      expect(hasZeroWidthSpaces(undefined)).toBe(false)
    })

    it('應該檢測多個零寬度空格', () => {
      const input = `A${ZERO_WIDTH_SPACE}B${ZERO_WIDTH_SPACE}C`
      expect(hasZeroWidthSpaces(input)).toBe(true)
    })
  })

  describe('addSpacingAfterSpaces', () => {
    it('應該在每個空格後添加零寬度空格', () => {
      const input = 'Hello World Test'
      const output = addSpacingAfterSpaces(input)

      expect(output).toContain(ZERO_WIDTH_SPACE)
      // 應該有兩個零寬度空格（兩個空格）
      const zwsCount = (output.match(/\u200B/g) || []).length
      expect(zwsCount).toBe(2)
    })

    it('應該處理多個空格', () => {
      const input = 'A B C D E'
      const output = addSpacingAfterSpaces(input)

      const zwsCount = (output.match(/\u200B/g) || []).length
      expect(zwsCount).toBe(4) // 四個空格
    })

    it('應該處理空字串', () => {
      expect(addSpacingAfterSpaces('')).toBe('')
    })

    it('應該處理 null 或 undefined', () => {
      expect(addSpacingAfterSpaces(null)).toBe('')
      expect(addSpacingAfterSpaces(undefined)).toBe('')
    })

    it('應該處理沒有空格的文字', () => {
      const input = 'NoSpaces'
      const output = addSpacingAfterSpaces(input)

      expect(output).toBe(input)
      expect(output).not.toContain(ZERO_WIDTH_SPACE)
    })

    it('應該處理連續空格', () => {
      const input = 'Hello  World'
      const output = addSpacingAfterSpaces(input)

      // 兩個空格都應該被處理
      const zwsCount = (output.match(/\u200B/g) || []).length
      expect(zwsCount).toBe(2)
    })
  })

  describe('addExtraLineBreaks', () => {
    it('應該在每個換行後添加額外的換行和零寬度空格', () => {
      const input = 'Line 1\nLine 2'
      const output = addExtraLineBreaks(input)

      expect(output).toContain(ZERO_WIDTH_SPACE)
      expect(output).toContain('\n')
      // 應該有更多換行
      const outputNewlines = (output.match(/\n/g) || []).length
      const inputNewlines = (input.match(/\n/g) || []).length
      expect(outputNewlines).toBeGreaterThan(inputNewlines)
    })

    it('應該處理多個換行', () => {
      const input = 'A\nB\nC'
      const output = addExtraLineBreaks(input)

      // 應該有零寬度空格
      expect(output).toContain(ZERO_WIDTH_SPACE)

      // 原本 2 個換行，應該變成更多
      const outputNewlines = (output.match(/\n/g) || []).length
      expect(outputNewlines).toBeGreaterThan(2)
    })

    it('應該處理空字串', () => {
      expect(addExtraLineBreaks('')).toBe('')
    })

    it('應該處理 null 或 undefined', () => {
      expect(addExtraLineBreaks(null)).toBe('')
      expect(addExtraLineBreaks(undefined)).toBe('')
    })

    it('應該處理沒有換行的文字', () => {
      const input = 'No newlines here'
      const output = addExtraLineBreaks(input)

      expect(output).toBe(input)
      expect(output).not.toContain(ZERO_WIDTH_SPACE)
    })

    it('應該處理連續換行', () => {
      const input = 'Paragraph 1\n\nParagraph 2'
      const output = addExtraLineBreaks(input)

      expect(output).toContain(ZERO_WIDTH_SPACE)
      expect(output).toContain('\n')
    })
  })

  describe('整合測試', () => {
    it('應該能夠轉換後再還原', () => {
      const original = 'Test  text\n\nwith  formatting'
      const converted = convertWhitespace(original)
      const restored = removeZeroWidthSpaces(converted)

      expect(restored).toBe(original)
    })

    it('應該處理複雜的 Facebook 貼文格式', () => {
      const fbPost = `標題

這是第一段內容

這是第二段  內容

• 項目 1
• 項目 2
• 項目 3`

      const converted = convertWhitespace(fbPost)

      expect(hasZeroWidthSpaces(converted)).toBe(true)
      expect(converted).toContain('\n')

      // 清理後應該等於原始內容
      const cleaned = removeZeroWidthSpaces(converted)
      expect(cleaned).toBe(fbPost)
    })

    it('應該處理極端情況：大量空白', () => {
      const input = '     多個空格     \n\n\n\n多個換行'
      const converted = convertWhitespace(input)

      expect(hasZeroWidthSpaces(converted)).toBe(true)

      // 驗證所有空白都被保留
      const cleaned = removeZeroWidthSpaces(converted)
      expect(cleaned).toBe(input)
    })
  })
})
