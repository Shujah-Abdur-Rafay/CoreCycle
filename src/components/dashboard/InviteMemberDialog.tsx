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
import { Mail, Copy, Check, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { sendTeamInvitationEmail } from "@/lib/emailWorkflows";

interface InviteMemberDialogProps {
  children?: React.ReactNode;
}

export function InviteMemberDialog({ children }: InviteMemberDialogProps) {
  const { profile } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const inviteLink = `${window.location.origin}/auth?invite=${profile?.sme_id || 'team'}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSending(true);
    try {
      const result = await sendTeamInvitationEmail({
        email,
        inviteeName: name || email,
        inviterName: profile?.full_name || 'Your Administrator',
        companyName: profile?.company_name || 'Corecycle',
        role: 'Learner',
        inviteCode: profile?.sme_id || 'team',
        expiryDays: 7,
      });

      if (result.success) {
        toast.success(`Invitation sent to ${email}`);
        setEmail("");
        setName("");
        setIsOpen(false);
      } else {
        toast.error(`Failed to send invite: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      toast.error("Failed to send invitation email");
    } finally {
      setIsSending(false);
    }
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
            Share this link with your staff or send an email invitation directly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Invite link */}
          <div className="space-y-2">
            <Label htmlFor="link">Invite Link</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="link"
                defaultValue={inviteLink}
                readOnly
                className="h-9 text-xs font-mono bg-muted"
              />
              <Button size="sm" className="px-3 shrink-0" onClick={copyToClipboard}>
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
            <div className="space-y-2">
              <Label htmlFor="invite-name">Name (optional)</Label>
              <Input
                id="invite-name"
                placeholder="Staff member's name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="invite-email"
                  placeholder="staff@company.com"
                  className="pl-10 h-10"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="forest"
              className="w-full"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email Invite
                </>
              )}
            </Button>
          </form>
        </div>

        <DialogFooter className="sm:justify-start">
          <p className="text-[10px] text-muted-foreground">
            Invited members will automatically be linked to your organisation upon registration.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
