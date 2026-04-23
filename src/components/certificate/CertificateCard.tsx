import { CertificateTemplate } from '@/hooks/useCertificateTemplates';
import { Award } from 'lucide-react';

export interface CertificateCardData {
  learnerName?: string;
  courseTitle?: string;
  completionDate?: string;
  certificateNumber?: string;
}

interface CertificateCardProps {
  template: CertificateTemplate;
  data?: CertificateCardData;
  /** If true renders a compact preview with placeholder text */
  preview?: boolean;
  className?: string;
}

const PLACEHOLDER: Required<CertificateCardData> = {
  learnerName: 'Learner Name',
  courseTitle: 'Course Title',
  completionDate: 'January 1, 2026',
  certificateNumber: 'OWDA-PREVIEW-0000',
};

export function CertificateCard({
  template,
  data,
  preview = false,
  className = '',
}: CertificateCardProps) {
  const d: Required<CertificateCardData> = {
    learnerName: data?.learnerName || PLACEHOLDER.learnerName,
    courseTitle: data?.courseTitle || PLACEHOLDER.courseTitle,
    completionDate: data?.completionDate || PLACEHOLDER.completionDate,
    certificateNumber: data?.certificateNumber || PLACEHOLDER.certificateNumber,
  };

  const cfg = template.style_config || {};
  const align = cfg.textAlignment || 'center';
  const padding = cfg.padding ?? 24;
  const showBorder = cfg.showBorder ?? true;
  const borderColor = cfg.borderColor || '#16a34a';
  const showWatermark = cfg.showWatermark ?? true;
  const overlayOpacity = cfg.overlayOpacity ?? 0;
  const overlayColor = cfg.overlayColor || '#000000';
  const headerFontSize = cfg.headerFontSize ?? (preview ? 14 : 22);
  const fontFamily = cfg.fontFamily || 'inherit';

  const backgroundStyle: React.CSSProperties = template.background_url
    ? {
        backgroundImage: `url(${template.background_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundColor: template.background_color };

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-2xl select-none ${className}`}
      style={{ ...backgroundStyle, fontFamily }}
    >
      {/* Colour overlay */}
      {overlayOpacity > 0 && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayColor, opacity: overlayOpacity / 100 }}
        />
      )}

      {/* Decorative border */}
      {showBorder && (
        <div
          className="absolute inset-2 rounded-xl pointer-events-none"
          style={{ border: `2px solid ${borderColor}` }}
        />
      )}

      {/* Watermark */}
      {showWatermark && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0.05 }}
        >
          <Award
            className="w-3/4 h-3/4"
            style={{ color: borderColor }}
            strokeWidth={0.5}
          />
        </div>
      )}

      {/* Content */}
      <div
        className="absolute inset-0 flex flex-col"
        style={{ padding, textAlign: align }}
      >
        {/* Header bar */}
        <div
          className="flex items-center gap-2 mb-auto"
          style={{ justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}
        >
          {template.logo_url ? (
            <img
              src={template.logo_url}
              alt="Logo"
              className="object-contain"
              style={{ height: preview ? 24 : 40, maxWidth: preview ? 80 : 120 }}
            />
          ) : (
            <div
              className="rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: borderColor,
                width: preview ? 24 : 40,
                height: preview ? 24 : 40,
              }}
            >
              <Award className="text-white" style={{ width: preview ? 12 : 20, height: preview ? 12 : 20 }} />
            </div>
          )}
          {template.provider_name && (
            <span
              className="font-bold text-gray-700 truncate"
              style={{ fontSize: preview ? 9 : 14 }}
            >
              {template.provider_name}
            </span>
          )}
        </div>

        {/* Main content — vertically centred */}
        <div className="flex-1 flex flex-col justify-center gap-1">
          {/* Header text */}
          <p
            className="font-bold tracking-wide uppercase"
            style={{ fontSize: headerFontSize, color: borderColor }}
          >
            {template.header_text}
          </p>

          <p
            className="text-gray-500"
            style={{ fontSize: preview ? 7 : 11 }}
          >
            This is to certify that
          </p>

          {/* Learner name */}
          <p
            className="font-bold text-gray-800 leading-tight"
            style={{ fontSize: preview ? 16 : 28 }}
          >
            {d.learnerName}
          </p>

          <p
            className="text-gray-500"
            style={{ fontSize: preview ? 7 : 11 }}
          >
            has successfully completed
          </p>

          {/* Course title */}
          <p
            className="font-semibold"
            style={{ fontSize: preview ? 10 : 16, color: borderColor }}
          >
            {d.courseTitle}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto space-y-0.5">
          <p
            className="text-gray-500"
            style={{ fontSize: preview ? 6 : 9 }}
          >
            {d.completionDate}
          </p>
          <p
            className="font-mono text-gray-400"
            style={{ fontSize: preview ? 5 : 8 }}
          >
            {d.certificateNumber}
          </p>
        </div>
      </div>
    </div>
  );
}
