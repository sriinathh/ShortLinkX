import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Palette } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface QRModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  shortCode: string;
}

const PRESET_COLORS = [
  { fg: '#000000', bg: '#FFFFFF', name: 'Classic' },
  { fg: '#3366ff', bg: '#FFFFFF', name: 'Blue' },
  { fg: '#06b6d4', bg: '#FFFFFF', name: 'Cyan' },
  { fg: '#10b981', bg: '#FFFFFF', name: 'Emerald' },
  { fg: '#f43f5e', bg: '#FFFFFF', name: 'Rose' },
  { fg: '#FFFFFF', bg: '#1e293b', name: 'Dark' },
];

export function QRModal({ open, onClose, url, shortCode }: QRModalProps) {
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const svgRef = useRef<HTMLDivElement>(null);

  const downloadPNG = () => {
    const svg = svgRef.current?.querySelector('svg');
    if (!svg) return;
    const svgString = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url2 = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url2);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.download = `qr-${shortCode}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    };
    img.src = url2;
  };

  const downloadSVG = () => {
    const svg = svgRef.current?.querySelector('svg');
    if (!svg) return;
    const svgString = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = `qr-${shortCode}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  return (
    <Modal open={open} onClose={onClose} title="QR Code" size="sm">
      <div className="flex flex-col items-center gap-5">
        <div
          ref={svgRef}
          className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700"
          style={{ backgroundColor: bgColor }}
        >
          <QRCodeSVG
            value={url}
            size={200}
            fgColor={fgColor}
            bgColor={bgColor}
            level="M"
            marginSize={0}
          />
        </div>

        <div className="w-full">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Palette className="w-4 h-4" />
            Color Presets
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setFgColor(preset.fg);
                  setBgColor(preset.bg);
                }}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition text-xs"
              >
                <div
                  className="w-4 h-4 rounded border border-slate-300"
                  style={{ backgroundColor: preset.fg }}
                />
                <span className="text-slate-600 dark:text-slate-300">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <Button onClick={downloadPNG} variant="primary" className="flex-1">
            <Download className="w-4 h-4" />
            PNG
          </Button>
          <Button onClick={downloadSVG} variant="outline" className="flex-1">
            <Download className="w-4 h-4" />
            SVG
          </Button>
        </div>
      </div>
    </Modal>
  );
}
