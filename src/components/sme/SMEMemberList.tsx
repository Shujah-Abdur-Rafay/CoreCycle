import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CheckCircle2, XCircle } from "lucide-react";

interface SMEMember {
  user_id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  role: string;
  is_approved: boolean;
}

interface SMEMemberListProps {
  smeId: string;
}

export function SMEMemberList({ smeId }: SMEMemberListProps) {
  const [members, setMembers] = useState<SMEMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!smeId) return;

    const fetchMembers = async () => {
      try {
        const { data: profiles, error: pErr } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, company_name")
          .eq("sme_id", smeId);

        if (pErr) throw pErr;

        if (!profiles || profiles.length === 0) {
          setMembers([]);
          return;
        }

        const userIds = profiles.map((p) => p.user_id);
        const { data: roles, error: rErr } = await supabase
          .from("user_roles")
          .select("user_id, role, is_approved")
          .in("user_id", userIds);

        if (rErr) throw rErr;

        const roleMap = new Map(
          (roles || []).map((r) => [r.user_id, r])
        );

        setMembers(
          profiles.map((p) => ({
            user_id: p.user_id,
            full_name: p.full_name,
            email: p.email,
            company_name: p.company_name,
            role: roleMap.get(p.user_id)?.role ?? "learner",
            is_approved: roleMap.get(p.user_id)?.is_approved ?? false,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch SME members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [smeId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Team Members
          {!loading && (
            <Badge variant="secondary" className="ml-auto">
              {members.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No members found for your organisation.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {members.map((m) => (
              <div key={m.user_id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {m.full_name || "No name"}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {m.role.replace(/_/g, " ")}
                  </Badge>
                  {m.is_approved ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
