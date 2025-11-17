// 測試當前的實現
const ZERO_WIDTH_SPACE = '\u200B';

function convertWhitespaceCurrent(text) {
  if (!text) return '';
  let result = text;
  result = result.replace(/ {2,}/g, (match) => {
    return match.split('').join(ZERO_WIDTH_SPACE);
  });
  result = result.replace(/\n{2,}/g, (match) => {
    return match.split('').join(ZERO_WIDTH_SPACE);
  });
  return result;
}

// PiliApp 的實現應該是這樣
function convertWhitespacePiliApp(text) {
  if (!text) return '';
  let result = text;
  // 在所有空格後面加上零寬度空格
  result = result.replace(/ /g, ` ${ZERO_WIDTH_SPACE}`);
  // 在所有換行後面加上零寬度空格
  result = result.replace(/\n/g, `\n${ZERO_WIDTH_SPACE}`);
  return result;
}

// 測試
const testText = "Hello  World\n\nTest";
console.log("原始文字:", testText);
console.log("原始長度:", testText.length);
console.log("\n當前實現:");
const current = convertWhitespaceCurrent(testText);
console.log("轉換後長度:", current.length);
console.log("零寬度空格數量:", (current.match(/\u200B/g) || []).length);

console.log("\nPiliApp 實現:");
const piliapp = convertWhitespacePiliApp(testText);
console.log("轉換後長度:", piliapp.length);
console.log("零寬度空格數量:", (piliapp.match(/\u200B/g) || []).length);

// 單一空格測試
const single = "Hello World";
console.log("\n單一空格測試:", single);
console.log("當前實現會改變嗎?", convertWhitespaceCurrent(single) !== single);
console.log("PiliApp 實現會改變嗎?", convertWhitespacePiliApp(single) !== single);
