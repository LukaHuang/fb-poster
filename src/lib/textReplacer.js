/**
 * 文字替換功能
 * 允許用戶自定義替換規則
 */

/**
 * 執行文字替換
 * @param {string} text - 原始文本
 * @param {Array<{from: string, to: string}>} rules - 替換規則陣列
 * @returns {string} - 替換後的文本
 */
export function replaceText(text, rules) {
  if (!text || !rules || rules.length === 0) return text;

  let result = text;

  // 依序執行每個替換規則
  rules.forEach(rule => {
    if (rule.from && rule.to !== undefined) {
      // 使用全局替換
      const regex = new RegExp(escapeRegExp(rule.from), 'g');
      result = result.replace(regex, rule.to);
    }
  });

  return result;
}

/**
 * 轉義正則表達式特殊字符
 * @param {string} string - 要轉義的字串
 * @returns {string} - 轉義後的字串
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 驗證替換規則
 * @param {Array<{from: string, to: string}>} rules - 替換規則陣列
 * @returns {{valid: boolean, errors: Array<string>}} - 驗證結果
 */
export function validateRules(rules) {
  const errors = [];

  if (!Array.isArray(rules)) {
    errors.push('規則必須是陣列');
    return { valid: false, errors };
  }

  rules.forEach((rule, index) => {
    if (!rule.from) {
      errors.push(`規則 ${index + 1}: 缺少 "from" 欄位`);
    }
    if (rule.to === undefined) {
      errors.push(`規則 ${index + 1}: 缺少 "to" 欄位`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 預設替換規則範例
 */
export const DEFAULT_RULES = [
  { from: ', ', to: '，' },  // 英文逗號+空白轉中文逗號
  { from: '.', to: '。' },  // 英文句號轉中文句號
  { from: '!', to: '！' },  // 英文驚嘆號轉中文驚嘆號
  { from: '?', to: '？' },  // 英文問號轉中文問號
  { from: '-', to: '•' },   // 連字號轉項目符號
];
