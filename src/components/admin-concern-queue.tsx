"use client";

import { useMemo, useState } from "react";
import type { Concern } from "@/lib/types";
import { categoryLabels, concernCategories, statusLabels } from "@/lib/types";
import { ActivityRow } from "@/components/ui";

export function AdminConcernQueue({ concerns }: { concerns: Concern[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const filtered = useMemo(() => concerns.filter((concern) => {
    const haystack = `${concern.reference} ${concern.title} ${concern.residentName} ${concern.locationText}`.toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) && (status === "all" || concern.status === status) && (category === "all" || concern.category === category);
  }), [concerns, search, status, category]);
  return <><div className="inline-form" style={{ marginBottom: 18 }}><div className="field"><label htmlFor="search">Search by reference, title, or resident</label><input id="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="CON-2026-0001" /></div><div className="field"><label htmlFor="status">Status</label><select id="status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="field"><label htmlFor="category">Category</label><select id="category" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{concernCategories.map((value) => <option key={value} value={value}>{categoryLabels[value]}</option>)}</select></div></div>{filtered.length ? <div className="activity-list">{filtered.map((concern) => <ActivityRow key={concern.id} concern={concern} />)}</div> : <div className="empty-state"><h3>No matching concerns</h3><p>Try a different search term or filter.</p></div>}</>;
}
