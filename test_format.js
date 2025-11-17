// 測試格式轉換邏輯
const ZERO_WIDTH_SPACE = '\u200B';

function replaceText(text, rules) {
  let result = text;
  rules.forEach(rule => {
    if (rule.from && rule.to !== undefined) {
      const regex = new RegExp(rule.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(regex, rule.to);
    }
  });
  return result;
}

function convertWhitespace(text) {
  if (!text) return '';
  let result = text;
  result = result.replace(/ /g, ` ${ZERO_WIDTH_SPACE}`);
  result = result.replace(/\n/g, `\n${ZERO_WIDTH_SPACE}`);
  return result;
}

const rules = [
  { from: ', ', to: '，' },
  { from: '.', to: '。' },
];

const testText = "Hello, World.\nNew line.";

console.log("原始文字:", testText);
console.log("\n=== 純文字模式 ===");
const plainResult = replaceText(testText, rules);
console.log("結果:", plainResult);
console.log("長度:", plainResult.length);

console.log("\n=== FB 發文格式 ===");
const fbResult = convertWhitespace(replaceText(testText, rules));
console.log("結果:", fbResult);
console.log("長度:", fbResult.length);
console.log("零寬度空格數量:", (fbResult.match(/\u200B/g) || []).length);
