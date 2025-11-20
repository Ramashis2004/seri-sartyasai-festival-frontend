import React from "react";

export default function UserManagement({ data, roles, roleLabels, onApprove, onReset }) {
  const [query, setQuery] = React.useState("");
  const [role, setRole] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [sortKey, setSortKey] = React.useState("name");
  const [sortDir, setSortDir] = React.useState("asc");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const filtered = React.useMemo(() => {
    let rows = data || [];
    if (role) rows = rows.filter((r) => r._role === role);
    if (status) rows = rows.filter((r) => (r.approved ? "Approved" : "Pending") === status);
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter((r) => (r.name || r.schoolName || "").toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q));
    }
    rows = [...rows].sort((a,b) => {
      const av = (a[sortKey] || "").toString().toLowerCase();
      const bv = (b[sortKey] || "").toString().toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [data, role, status, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  const hdr = (key, label) => (
    <th
      style={{ cursor: 'pointer' }}
      onClick={() => {
        if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else { setSortKey(key); setSortDir('asc'); }
      }}
    >
      {label} {sortKey === key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
    </th>
  );

  return (
    <section>
      <h3>User Management</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <select className="input" value={role} onChange={(e)=>{ setPage(1); setRole(e.target.value); }} style={{ maxWidth: 180 }}>
          <option value="">Role: All</option>
          {roles.map((r)=> (<option key={r} value={r}>{roleLabels[r]}</option>))}
        </select>
        <select className="input" value={status} onChange={(e)=>{ setPage(1); setStatus(e.target.value); }} style={{ maxWidth: 160 }}>
          <option value="">Status: All</option>
          <option>Approved</option>
          <option>Pending</option>
        </select>
        <input className="input" placeholder="Search" value={query} onChange={(e)=>{ setPage(1); setQuery(e.target.value); }} style={{ maxWidth: 220 }} />
        <div style={{ flex: 1 }} />
        <button className="btn primary">+ Add New User</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              {hdr('name','Name')}
              {hdr('email','Email')}
              {hdr('mobile','Mobile')}
              <th>Role</th>
              {hdr('approved','Status')}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((u) => (
              <UserRow key={u._id} u={u} roleLabels={roleLabels} onApprove={onApprove} onReset={onReset} />
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button className="btn" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <div style={{ padding: '6px 10px' }}>Page {page} of {totalPages}</div>
        <button className="btn" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>
    </section>
  );
}

function UserRow({ u, roleLabels, onApprove, onReset }) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  const btnRef = React.useRef(null);
  React.useEffect(()=>{
    const onDoc = (e) => {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return (
    <tr>
      <td>{u.name || u.schoolName || '-'}</td>
      <td>{u.email}</td>
      <td>{u.mobile || '-'}</td>
      <td>{roleLabels[u._role]}</td>
      <td>{typeof u.approved === 'boolean' ? (u.approved ? 'Approved' : 'Pending') : '-'}</td>
      <td style={{ position: 'relative' }}>
        {typeof u.approved === 'boolean' && (
          <>
            {!u.approved ? (
              <button className="btn" onClick={() => onApprove(u._role, u._id, true)}>Approve</button>
            ) : (
              <button className="btn" onClick={() => onApprove(u._role, u._id, false)}>Reject</button>
            )}
          </>
        )}
        <button ref={btnRef} className="btn" style={{ marginLeft: 8 }} onClick={()=>setOpen(v=>!v)}>⋮</button>
        {open && (
          <div ref={menuRef} style={{ position: 'absolute', right: 0, top: 30, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }}>
            <button className="btn" style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 0 }} onClick={()=>{ setOpen(false); /* TODO */ }}>Edit User</button>
            <button className="btn" style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 0 }} onClick={()=>{ setOpen(false); onReset(u._role, u._id); }}>Reset Password</button>
            <button className="btn" style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 0, color: '#ef4444' }} onClick={()=>{ setOpen(false); /* TODO */ }}>Deactivate User</button>
          </div>
        )}
      </td>
    </tr>
  );
}
