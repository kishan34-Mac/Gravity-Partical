export function takeScreenshot(canvas) {
  const link = document.createElement('a');
  link.download = `gravity-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
