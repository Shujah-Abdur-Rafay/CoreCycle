import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Copy, Check, UserPlus, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface InviteMemberDialogProps {
  children?: React.ReactNode;
}

export function InviteMemberDialog({ children }: InviteMemberDialogProps) {
  const { profile } = useAuth();
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const inviteLink = `${window.location.origin}/auth?invite=${profile?.sme_id || 'team'}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    // Since we don't have a backend email service yet, 
    // we'll use a mailto link as a fallback or just simulate it.
    const subject = encodeURIComponent("Invitation to join Corecycle Training");
    const body = encodeURIComponent(`Hello,\n\nYou have been invited to join the training program at ${profile?.company_name || 'Corecycle'}.\n\nPlease use the following link to create your account:\n\n${inviteLink}\n\nRegards,\nTeam ${profile?.company_name || 'Corecycle'}`);
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    
    toast.success(`Invite draft created for ${email}`);
    setEmail("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="forest" className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Share this link with your staff or send an email invitation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="link">Invite Link</Label>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input
                  id="link"
                  defaultValue={inviteLink}
                  readOnly
                  className="h-9 text-xs font-mono bg-muted"
                />
              </div>
              <Button size="sm" className="px-3" onClick={copyToClipboard}>
                <span className="sr-only">Copy</span>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or send via email
              </span>
            </div>
          </div>

          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="staff@company.com"
                  className="pl-10 h-10"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" variant="forest" className="w-full">
              Send Email Invite
            </Button>
          </form>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <p className="text-[10px] text-muted-foreground">
            Invited members will automatically be linked to your organization system upon registration.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
