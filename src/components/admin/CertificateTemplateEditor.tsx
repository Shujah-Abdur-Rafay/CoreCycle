import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Save, X, Upload, Image } from 'lucide-react';
import { useCertificateTemplates, CertificateTemplate, CertificateTemplateInput, StyleConfig } from '@/hooks/useCertificateTemplates';
import { CertificateCard } from '@/components/certificate/CertificateCard';
import { supabase } from '@/integrations/supabase/client';

interface CertificateTemplateEditorProps {
  editingTemplate?: CertificateTemplate | null;
  onSaved: () => void;
  onCancel: () => void;
}

const defaultStyle: StyleConfig = {
  fontFamily: 'inherit',
  headerFontSize: 22,
  textAlignment: 'center',
  padding: 24,
  overlayOpacity: 0,
  overlayColor: '#000000',
  showBorder: true,
  borderColor: '#16a34a',
  showWatermark: true,
};

const defaultInput: CertificateTemplateInput = {
  name: '',
  header_text: 'Certificate of Completion',
  provider_name: '',
  background_color: '#f0fdf4',
  background_url: null,
  logo_url: null,
  style_config: defaultStyle,
};

export function CertificateTemplateEditor({
  editingTemplate,
  onSaved,
  onCancel,
}: CertificateTemplateEditorProps) {
  const { createTemplate, updateTemplate } = useCertificateTemplates();
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const bgInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CertificateTemplateInput>(() => {
    if (editingTemplate) {
      return {
        name: editingTemplate.name,
        header_text: editingTemplate.header_text,
        provider_name: editingTemplate.provider_name || '',
        background_color: editingTemplate.background_color,
        background_url: editingTemplate.background_url,
        logo_url: editingTemplate.logo_url,
        style_config: { ...defaultStyle, ...editingTemplate.style_config },
      };
    }
    return { ...defaultInput };
  });

  const setStyle = (key: keyof StyleConfig, value: unknown) => {
    setForm(prev => ({
      ...prev,
      style_config: { ...prev.style_config, [key]: value },
    }));
  };

  const uploadFile = async (
    file: File,
    bucket: string,
    folder: string
  ): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { console.error(error); return null; }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBg(true);
    const url = await uploadFile(file, 'certificate-assets', 'backgrounds');
    if (url) setForm(prev => ({ ...prev, background_url: url }));
    else toast.error('Failed to upload background image');
    setUploadingBg(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const url = await uploadFile(file, 'certificate-assets', 'logos');
    if (url) setForm(prev => ({ ...prev, logo_url: url }));
    else toast.error('Failed to upload logo');
    setUploadingLogo(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Template name is required'); return; }
    if (!form.header_text.trim()) { toast.error('Header text is required'); return; }

    setSaving(true);
    try {
      const result = editingTemplate
        ? await updateTemplate(editingTemplate.id, form)
        : await createTemplate(form);

      if (result) {
        toast.success(editingTemplate ? 'Template updated' : 'Template created');
        onSaved();
      } else {
        toast.error('Failed to save template');
      }
    } finally {
      setSaving(false);
    }
  };

  const previewTemplate: CertificateTemplate = {
    id: 'preview',
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...form,
    style_config: form.style_config as StyleConfig,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ── LEFT: Controls ── */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Template Name *</Label>
              <Input
                placeholder="e.g. Green Achievement Card"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Certificate Header *</Label>
              <Input
                placeholder="Certificate of Completion"
                value={form.header_text}
                onChange={e => setForm(prev => ({ ...prev, header_text: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Provider / Organisation Name</Label>
              <Input
                placeholder="e.g. CoreCycle Ontario"
                value={form.provider_name || ''}
                onChange={e => setForm(prev => ({ ...prev, provider_name: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Background Colour</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.background_color}
                  onChange={e => setForm(prev => ({ ...prev, background_color: e.target.value, background_url: null }))}
                  className="h-9 w-16 rounded cursor-pointer border border-input"
                />
                <span className="text-sm text-muted-foreground font-mono">{form.background_color}</span>
                {form.background_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive h-8"
                    onClick={() => setForm(prev => ({ ...prev, background_url: null }))}
                  >
                    Remove image
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Background Image (overrides colour)</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploadingBg}
                  onClick={() => bgInputRef.current?.click()}
                >
                  {uploadingBg ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                  {form.background_url ? 'Replace' : 'Upload'}
                </Button>
                {form.background_url && (
                  <span className="text-xs text-muted-foreground truncate max-w-[180px]">Image set</span>
                )}
              </div>
              <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              {form.logo_url ? (
                <img src={form.logo_url} alt="logo preview" className="h-10 w-auto rounded border border-border object-contain" />
              ) : (
                <div className="h-10 w-10 rounded border border-dashed border-muted-foreground flex items-center justify-center">
                  <Image className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={uploadingLogo}
                onClick={() => logoInputRef.current?.click()}
              >
                {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                {form.logo_url ? 'Replace Logo' : 'Upload Logo'}
              </Button>
              {form.logo_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive h-8"
                  onClick={() => setForm(prev => ({ ...prev, logo_url: null }))}
                >
                  Remove
                </Button>
              )}
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label>Accent / Border Colour</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.style_config.borderColor || '#16a34a'}
                  onChange={e => setStyle('borderColor', e.target.value)}
                  className="h-9 w-16 rounded cursor-pointer border border-input"
                />
                <span className="text-sm text-muted-foreground font-mono">{form.style_config.borderColor}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Text Alignment</Label>
              <Select
                value={form.style_config.textAlignment || 'center'}
                onValueChange={v => setStyle('textAlignment', v)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Header Font Size: {form.style_config.headerFontSize ?? 22}px</Label>
              <Slider
                min={14}
                max={36}
                step={1}
                value={[form.style_config.headerFontSize ?? 22]}
                onValueChange={([v]) => setStyle('headerFontSize', v)}
              />
            </div>

            <div className="space-y-2">
              <Label>Padding: {form.style_config.padding ?? 24}px</Label>
              <Slider
                min={12}
                max={48}
                step={4}
                value={[form.style_config.padding ?? 24]}
                onValueChange={([v]) => setStyle('padding', v)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Overlay Opacity: {form.style_config.overlayOpacity ?? 0}%</Label>
              <Slider
                min={0}
                max={80}
                step={5}
                value={[form.style_config.overlayOpacity ?? 0]}
                onValueChange={([v]) => setStyle('overlayOpacity', v)}
              />
            </div>

            {(form.style_config.overlayOpacity ?? 0) > 0 && (
              <div className="space-y-1.5">
                <Label>Overlay Colour</Label>
                <input
                  type="color"
                  value={form.style_config.overlayColor || '#000000'}
                  onChange={e => setStyle('overlayColor', e.target.value)}
                  className="h-9 w-16 rounded cursor-pointer border border-input"
                />
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <Label>Show Border</Label>
              <Switch
                checked={form.style_config.showBorder ?? true}
                onCheckedChange={v => setStyle('showBorder', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Watermark</Label>
              <Switch
                checked={form.style_config.showWatermark ?? true}
                onCheckedChange={v => setStyle('showWatermark', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving} variant="forest" className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editingTemplate ? 'Update Template' : 'Create Template'}
          </Button>
          <Button variant="outline" onClick={onCancel} className="gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>

      {/* ── RIGHT: Live Preview ── */}
      <div className="space-y-4 lg:sticky lg:top-24 self-start">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Live Preview</p>
        <CertificateCard template={previewTemplate} preview={false} className="w-full max-w-sm mx-auto shadow-xl" />
        <p className="text-xs text-center text-muted-foreground">Square 1:1 aspect ratio · actual learner data replaces placeholders</p>
      </div>
    </div>
  );
}
