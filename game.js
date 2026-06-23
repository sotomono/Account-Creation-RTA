/* ===== game.js ===== */

// ── チェックポイントをランダム配置 ──
(function insertCheckpoints() {
  const NUM = 5;
  const allParagraphs = Array.from(document.querySelectorAll('#terms section ul > li'));

  // 最後の1個：同意ボタン直前に固定
  const lastWrapper = document.createElement('div');
  lastWrapper.className = 'checkpoint-wrapper';
  lastWrapper.innerHTML = `<label><input type="checkbox" class="checkpoint"> ここまで読みました（${NUM}）</label>`;
  document.getElementById('warning').insertAdjacentElement('beforebegin', lastWrapper);

  // 残り (NUM-1) 個をランダム抽出・DOM順ソート
  const chosen = allParagraphs
    .sort(() => Math.random() - 0.5)
    .slice(0, NUM - 1)
    .sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);

  chosen.forEach((paragraph, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'checkpoint-wrapper';
    wrapper.innerHTML = `<label><input type="checkbox" class="checkpoint"> ここまで読みました（${i + 1}）</label>`;
    paragraph.insertAdjacentElement('afterend', wrapper);
  });
})();

// ── スクロール復元無効化 ──
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ── チェックポイント監視 → シェルへスプリット通知 ──
let nextSplitIndex = 0;
document.addEventListener('change', (e) => {
  if (e.target.classList.contains('checkpoint') && e.target.checked) {
    window.parent.postMessage({ type: 'checkpoint', index: nextSplitIndex }, '*');
    nextSplitIndex++;
  }
});

// ── 同意ボタン ──
let gimmickCount = 0;

document.getElementById('agreeButton').addEventListener('click', () => {
  const checkboxes = document.querySelectorAll('.checkpoint');
  const unchecked  = Array.from(checkboxes).filter(cb => !cb.checked);
  const warning    = document.getElementById('warning');

  if (unchecked.length > 0) {
    warning.style.display = 'block';
    warning.textContent   = `読了確認ができていません（残り${unchecked.length}箇所）`;
    warning.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  warning.style.display = 'none';

  // 最終確認ダイアログを表示
  document.getElementById('confirmOverlay').classList.add('active');
});

// 「はい」→遷移
function confirmAgree() {
  document.getElementById('confirmOverlay').classList.remove('active');
  window.parent.postMessage({ type: 'navigate', to: 'verify', gimmick: gimmickCount }, '*');
}

// 「いいえ」→ダイアログを閉じるだけ
function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('active');
}

// ── レイアウトシフト対策 ──
const _initScroll = window.scrollY;
setTimeout(() => {
  if (Math.abs(window.scrollY - _initScroll) < 10) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }
}, 1000);

// ════════════════════════════
// ギミック関数
// ════════════════════════════

// ヒントポップアップ（第4条第2項）
function showHintPopup() {
  document.getElementById('hintOverlay').classList.add('active');
}
function hideHintPopup(e) {
  if (!e || e.target === document.getElementById('hintOverlay')) {
    document.getElementById('hintOverlay').classList.remove('active');
  }
}

// 全チェックON（第11条第2項）
function checkAllCheckboxes() {
  gimmickCount++;
  document.querySelectorAll('.checkpoint').forEach(cb => {
    if (!cb.checked) {
      cb.checked = true;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}
