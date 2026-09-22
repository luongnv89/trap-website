(() => {
  const button = document.querySelector('#scan-toggle');
  const scene = document.querySelector('#trap-scene');
  const status = document.querySelector('#scan-status');

  if (!button || !scene || !status) return;

  const isVietnamese = document.documentElement.lang.toLowerCase().startsWith('vi');
  const copy = isVietnamese
    ? {
        on: 'Đang quét — các mối nguy ẩn đã được đánh dấu màu xanh.',
        off: 'Bản xem trước tùy chọn: các mối nguy đang im lặng.',
      }
    : {
        on: 'Scan active — hidden hazards are marked in cyan.',
        off: 'Optional preview: the hazards are quiet.',
      };

  button.addEventListener('click', () => {
    const active = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(active));
    scene.classList.toggle('scan-revealed', active);
    status.textContent = active ? copy.on : copy.off;
  });
})();
