import React, { useEffect, useMemo, useState } from "react";
import { useDiagnostics } from "@/diagnostics/DiagnosticsContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURE_FLAG_KEY = "diagnosticsEnabled";

const AdminDiagnostics: React.FC = () => {
  const { grouped, clear, traceId } = useDiagnostics();
  const { isAdmin } = useUserRoles();
  const [level, setLevel] = useState<string>("all");
  const [q, setQ] = useState("");

  const enabled = import.meta.env.DEV || window.localStorage.getItem(FEATURE_FLAG_KEY) === "1";

  useEffect(() => {
    document.title = "Admin Diagnostics | Production-safe logging";

    // Robots noindex
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);

    // Canonical
    const link = document.createElement("link");
    link.rel = "canonical";
    link.href = window.location.origin + "/admin/diagnostics";
    document.head.appendChild(link);

    // Meta description
    const desc = document.createElement("meta");
    desc.name = "description";
    desc.content = "Grouped diagnostics of client-side errors and warnings (admin-only).";
    document.head.appendChild(desc);

    return () => {
      document.head.removeChild(robots);
      document.head.removeChild(link);
      document.head.removeChild(desc);
    };
  }, []);

  const data = useMemo(() => {
    return grouped
      .filter((e) => (level === "all" ? true : e.level === level))
      .filter((e) => (q ? (e.message + e.route + e.source).toLowerCase().includes(q.toLowerCase()) : true));
  }, [grouped, level, q]);

  const exportCsv = () => {
    const rows = [
      ["level", "count", "route", "source", "message", "last_ts", "owner", "trace_id"],
      ...data.map((e) => [
        e.level,
        String(e.count || 1),
        e.route,
        e.source,
        e.message.replace(/,/g, " "),
        new Date(e.ts).toISOString(),
        e.owner || "",
        traceId || "",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagnostics.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <main className="container mx-auto max-w-5xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>Admin role required.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (!enabled) {
    return (
      <main className="container mx-auto max-w-5xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Diagnostics disabled</CardTitle>
            <CardDescription>
              Enable by setting localStorage.setItem('{FEATURE_FLAG_KEY}', '1') and refresh. Dev captures by default.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-6xl p-6">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Diagnostics</h1>
        <p className="text-muted-foreground">Grouped top offenders with counts; CSV export available.</p>
      </header>

      <section className="mb-4 flex gap-3 items-center">
        <div className="w-48">
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger aria-label="Filter by level">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search route/source/message"
          className="max-w-md"
        />
        <Button onClick={exportCsv} variant="secondary">Export CSV</Button>
        <Button onClick={clear} variant="outline">Clear</Button>
        <div className="ml-auto text-sm text-muted-foreground">Trace: <Badge variant="secondary">{traceId.slice(0,8)}</Badge></div>
      </section>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Last seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((e, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Badge variant={e.level === 'error' ? 'destructive' : e.level === 'warn' ? 'secondary' : 'outline'}>
                      {e.level}
                    </Badge>
                  </TableCell>
                  <TableCell>{e.count || 1}</TableCell>
                  <TableCell>{e.owner || '—'}</TableCell>
                  <TableCell className="font-mono text-xs">{e.route}</TableCell>
                  <TableCell className="font-mono text-xs">{e.source}</TableCell>
                  <TableCell className="text-sm">{e.message}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(e.ts).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No diagnostics captured yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
};

export default AdminDiagnostics;
