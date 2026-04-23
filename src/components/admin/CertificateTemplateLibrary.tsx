import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { useCertificateTemplates, CertificateTemplate } from '@/hooks/useCertificateTemplates';
import { CertificateCard } from '@/components/certificate/CertificateCard';

interface CertificateTemplateLibraryProps {
  onEdit: (template: CertificateTemplate) => void;
  onCreateNew: () => void;
}

export function CertificateTemplateLibrary({ onEdit, onCreateNew }: CertificateTemplateLibraryProps) {
  const { templates, loading, deleteTemplate } = useCertificateTemplates();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const ok = await deleteTemplate(id);
    if (ok) toast.success('Template deleted');
    else toast.error('Failed to delete template');
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Certificate Templates
          </h3>
          <p className="text-sm text-muted-foreground">
            {templates.length} template{templates.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Button variant="forest" onClick={onCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium text-foreground mb-1">No templates yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first certificate template to get started.
            </p>
            <Button variant="forest" onClick={onCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map(template => (
            <div key={template.id} className="group space-y-3">
              {/* Square preview card */}
              <div className="relative">
                <CertificateCard
                  template={template}
                  preview
                  className="w-full shadow-md group-hover:shadow-lg transition-shadow"
                />
                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onEdit(template)}
                    className="gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={deletingId === template.id}
                    onClick={() => setConfirmDeleteId(template.id)}
                    className="gap-1.5"
                  >
                    {deletingId === template.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                    Delete
                  </Button>
                </div>
              </div>

              {/* Template meta */}
              <div className="px-1 space-y-1">
                <p className="font-medium text-sm text-foreground truncate">{template.name}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {template.header_text}
                  </Badge>
                  {template.provider_name && (
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {template.provider_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={open => { if (!open) setConfirmDeleteId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Any courses linked to this template will lose their certificate design (courses will be unaffected, but won't have a certificate template until you assign a new one).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
