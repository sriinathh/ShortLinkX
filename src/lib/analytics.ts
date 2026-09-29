export function detectDeviceInfo() {
  if (typeof navigator === 'undefined') {
    return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
  }
  const ua = navigator.userAgent;

  const device = /iPad|Tablet/i.test(ua)
    ? 'Tablet'
    : /Mobile|Android|iPhone/i.test(ua)
      ? 'Mobile'
      : 'Desktop';

  let browser = 'Other';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';

  let os = 'Other';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { device, browser, os };
}

export function detectCountry(): string {
  const lang = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  const region = lang.split('-')[1];
  return region || 'US';
}

export function getReferrer(): string {
  if (typeof document === 'undefined') return 'direct';
  return document.referrer || 'direct';
}
