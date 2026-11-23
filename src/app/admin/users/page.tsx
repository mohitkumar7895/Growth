"use client";

import React, { useEffect, useState } from "react";
import { Plus, Save, Trash2, Shield, CheckCircle2 } from "lucide-react";

interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
  phone: string | null;
  is_active: number;
  last_login_at: string | null;
}

interface RoleRow {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface PermRow {
  id: number;
  name: string;
  slug: string;
  module: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<PermRow[]>([]);
  const [rolePermMap, setRolePermMap] = useState<Record<number, number[]>>({});
  const [selectedRoleId, setSelectedRoleId] = useState<number>(2);
  const [form, setForm] = useState({
    id: 0,
    name: "",
    email: "",
    password: "",
    role_id: 3,
    phone: "",
    is_active: true,
  });
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.users || []);
    setRoles(data.roles || []);
    setPermissions(data.permissions || []);
    const map: Record<number, number[]> = {};
    for (const rp of data.rolePerms || []) {
      map[rp.role_id] = [...(map[rp.role_id] || []), rp.permission_id];
    }
    setRolePermMap(map);
  };

  useEffect(() => {
    load();
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    if (res.ok) {
      flash(form.id ? "Admin user updated!" : "New admin user created!");
      setForm({ id: 0, name: "", email: "", password: "", role_id: 3, phone: "", is_active: true });
      load();
    } else {
      flash(d.error || "Failed to save user");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Delete this admin user?")) return;
    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  const togglePerm = (pid: number) => {
    if (selectedRoleId === 1) return;
    const curr = rolePermMap[selectedRoleId] || [];
    const next = curr.includes(pid) ? curr.filter((x) => x !== pid) : [...curr, pid];
    setRolePermMap((prev) => ({ ...prev, [selectedRoleId]: next }));
  };

  const saveRolePerms = async () => {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        updateRolePermissions: true,
        role_id: selectedRoleId,
        permission_ids: rolePermMap[selectedRoleId] || [],
      }),
    });
    if (res.ok) flash("Role permissions updated!");
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Create/Edit User */}
        <form
          onSubmit={handleSaveUser}
          className="space-y-3.5 rounded-xl border border-[#164B34]/12 bg-white p-6 shadow-sm lg:col-span-5"
        >
          <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
            {form.id ? "Edit Admin Account" : "Create Admin / Staff User"}
          </h3>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Full Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">
              Password {form.id ? "(leave blank to keep current)" : "* (min 8 chars)"}
            </label>
            <input
              type="password"
              required={!form.id}
              minLength={form.id ? 0 : 8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Role</label>
            <select
              value={form.role_id}
              onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="accent-[#164B34]"
            />
            Account Active
          </label>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#164B34] px-4 py-2.5 text-xs font-semibold text-white"
          >
            {form.id ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {form.id ? "Update User" : "Create User"}
          </button>
        </form>

        {/* Users Table */}
        <div className="overflow-hidden rounded-xl border border-[#164B34]/12 bg-white shadow-sm lg:col-span-7">
          <div className="border-b px-6 py-4">
            <h3 className="font-editorial text-xl font-semibold text-[#0C3323]">
              Authorized Team Members
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F7F2] text-[11px] uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#0C3323]">{u.name}</p>
                      <p className="text-gray-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#164B34]">{u.role_name}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${u.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"}`}>
                        {u.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            id: u.id,
                            name: u.name,
                            email: u.email,
                            password: "",
                            role_id: u.role_id,
                            phone: u.phone || "",
                            is_active: Boolean(u.is_active),
                          })
                        }
                        className="mr-1.5 rounded bg-[#F6F7F2] px-2.5 py-1 font-semibold text-[#164B34]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id)}
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role-Based Permissions Matrix */}
      <div className="rounded-xl border border-[#164B34]/12 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#C6A66C]" />
            <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
              Role-Based Permissions Matrix
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRoleId(r.id)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${
                  selectedRoleId === r.id
                    ? "bg-[#0C3323] text-[#E0C796]"
                    : "bg-[#F6F7F2] text-gray-700"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {permissions.map((perm) => {
            const checked =
              selectedRoleId === 1 || (rolePermMap[selectedRoleId] || []).includes(perm.id);
            return (
              <label
                key={perm.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-100 bg-[#F6F7F2] p-3 text-xs"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={selectedRoleId === 1}
                  onChange={() => togglePerm(perm.id)}
                  className="h-4 w-4 accent-[#164B34]"
                />
                <span>
                  <strong className="text-[#0C3323]">{perm.name}</strong>
                  <span className="block text-[10px] text-gray-500">{perm.slug}</span>
                </span>
              </label>
            );
          })}
        </div>

        {selectedRoleId !== 1 && (
          <button
            type="button"
            onClick={saveRolePerms}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#164B34] px-5 py-2.5 text-xs font-semibold text-white"
          >
            <Save className="h-4 w-4 text-[#E0C796]" /> Save Role Permissions
          </button>
        )}
      </div>
    </div>
  );
}
