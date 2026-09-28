import React, { useEffect, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import axiosInstance from "../services/axiosInstance";

const Settings = () => {
  // =========================================================
  // ROLES + PERMISSIONS
  // =========================================================

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] =
    useState([]);

  // =========================================================
  // LOADING STATES
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // MESSAGES
  // =========================================================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // ROLE MODAL
  // =========================================================

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [roleForm, setRoleForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [rolesResponse, permissionsResponse] =
        await Promise.all([
          axiosInstance.get("/roles"),
          axiosInstance.get("/permissions"),
        ]);

      const loadedRoles = rolesResponse.data;
      const loadedPermissions = permissionsResponse.data;

      setRoles(loadedRoles);
      setPermissions(loadedPermissions);

      // Select first role
      if (loadedRoles.length > 0) {
        await selectRole(loadedRoles[0]);
      }
    } catch (err) {
      console.error(
        "Failed to load roles and permissions:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load roles and permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SELECT ROLE
  // =========================================================

  const selectRole = async (role) => {
    try {
      setRoleLoading(true);
      setSelectedRole(role);

      setMessage("");
      setError("");

      const response = await axiosInstance.get(
        `/roles/${role.id}`
      );

      /*
       * Backend must return:
       *
       * permissions: [
       *   { id: 1, ... },
       *   { id: 9, ... }
       * ]
       */

      const rolePermissions =
        response.data.permissions || [];

      const existingPermissionIds =
        rolePermissions.map(
          (permission) => permission.id
        );

      setSelectedPermissionIds(
        existingPermissionIds
      );
    } catch (err) {
      console.error(
        "Failed to load role permissions:",
        err
      );

      setSelectedPermissionIds([]);

      setError(
        err.response?.data?.message ||
          "Unable to load permissions for this role."
      );
    } finally {
      setRoleLoading(false);
    }
  };

  // =========================================================
  // PERMISSION CHECKBOX
  // =========================================================

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissionIds((currentIds) => {
      // Already selected → remove
      if (currentIds.includes(permissionId)) {
        return currentIds.filter(
          (id) => id !== permissionId
        );
      }

      // Not selected → add
      return [...currentIds, permissionId];
    });

    setMessage("");
  };

  // =========================================================
  // SAVE PERMISSIONS
  // =========================================================

  const handleSavePermissions = async () => {
    if (!selectedRole) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await axiosInstance.put(
        `/roles/${selectedRole.id}/permissions`,
        {
          permissionIds: selectedPermissionIds,
        }
      );

      /*
       * Backend returns updated role.
       * Use returned permissions as the final state.
       */

      const savedPermissions =
        response.data.permissions || [];

      const savedPermissionIds =
        savedPermissions.map(
          (permission) => permission.id
        );

      setSelectedPermissionIds(
        savedPermissionIds
      );

      setSelectedRole(response.data);

      setMessage(
        "Permissions updated successfully."
      );

      // Refresh role list
      const rolesResponse =
        await axiosInstance.get("/roles");

      setRoles(rolesResponse.data);
    } catch (err) {
      console.error(
        "Failed to save permissions:",
        err
      );

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to manage permissions."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to update permissions."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // ADD ROLE
  // =========================================================

  const handleAddRole = () => {
    setEditingRole(null);

    setRoleForm({
      name: "",
      code: "",
      description: "",
    });

    setMessage("");
    setError("");

    setShowRoleModal(true);
  };

  // =========================================================
  // EDIT ROLE
  // =========================================================

  const handleEditRole = (role, event) => {
    /*
     * Prevent the role button from also
     * selecting the role.
     */
    event.stopPropagation();

    setEditingRole(role);

    setRoleForm({
      name: role.name || "",
      code: role.code || "",
      description: role.description || "",
    });

    setMessage("");
    setError("");

    setShowRoleModal(true);
  };

  // =========================================================
  // ROLE FORM CHANGE
  // =========================================================

  const handleRoleFormChange = (event) => {
    const { name, value } = event.target;

    setRoleForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =========================================================
  // SAVE ROLE
  // =========================================================

  const handleSaveRole = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      // Validation
      if (!roleForm.name.trim()) {
        setError("Role name is required.");
        return;
      }

      if (!roleForm.code.trim()) {
        setError("Role code is required.");
        return;
      }

      let response;

      // =====================================================
      // EDIT
      // =====================================================

      if (editingRole) {
        response = await axiosInstance.put(
          `/roles/${editingRole.id}`,
          {
            name: roleForm.name.trim(),
            code: roleForm.code.trim(),
            description:
              roleForm.description.trim(),
          }
        );
      }

      // =====================================================
      // CREATE
      // =====================================================

      else {
        response = await axiosInstance.post(
          "/roles",
          {
            name: roleForm.name.trim(),
            code: roleForm.code.trim(),
            description:
              roleForm.description.trim(),
          }
        );
      }

      const savedRole = response.data;

      // Refresh roles
      const rolesResponse =
        await axiosInstance.get("/roles");

      setRoles(rolesResponse.data);

      // Close modal
      setShowRoleModal(false);

      setMessage(
        editingRole
          ? "Role updated successfully."
          : "Role created successfully."
      );

      /*
       * Select the role that was just
       * created / edited.
       */
      await selectRole(savedRole);
    } catch (err) {
      console.error(
        "Failed to save role:",
        err
      );

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to manage roles."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to save role."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading roles and permissions...
        </p>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="shrink-0 px-4 pb-3 pt-1 ">

        <h1 className="text-xl font-bold text-slate-800">
          Roles & Permissions
        </h1>

      </div>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (
        <div className="mx-4 mb-3 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700 sm:mx-5 lg:mx-6">
          {error}
        </div>
      )}

      {message && (
        <div className="mx-4 mb-3 shrink-0 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-xs text-green-700 sm:mx-5 lg:mx-6">
          {message}
        </div>
      )}

      {/* =====================================================
          MAIN SETTINGS AREA
      ===================================================== */}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 pb-3 lg:grid-cols-[220px_minmax(0,1fr)] px-1">

        {/* ===================================================
            ROLES PANEL
        =================================================== */}

        <div className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white">

          {/* ROLES HEADER */}

          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">

            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Roles
              </h2>

              <p className="mt-0.5 text-[11px] text-slate-400">
                Select a role
              </p>
            </div>

            {/* ADD ROLE */}

            <button
              type="button"
              onClick={handleAddRole}
              title="Add Role"
              className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 transition hover:bg-indigo-100"
            >
              <Plus size={15} />
            </button>

          </div>

          {/* ROLE LIST */}

          <div className="p-2">

            {roles.map((role) => {
              const isSelected =
                selectedRole?.id === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => selectRole(role)}
                  className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left transition ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >

                  {/* ROLE NAME */}

                  <div className="flex items-center justify-between gap-2">

                    <div className="flex min-w-0 items-center gap-1.5">

                      <span className="truncate text-sm font-medium">
                        {role.name}
                      </span>

                      {/* EDIT PEN */}

                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) =>
                          handleEditRole(
                            role,
                            event
                          )
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            handleEditRole(
                              role,
                              event
                            );
                          }
                        }}
                        title={`Edit ${role.name}`}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 transition hover:bg-indigo-100 hover:text-indigo-600"
                      >
                        <Pencil size={12} />
                      </span>

                    </div>

                    {/* STATUS */}

                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium ${
                        role.active
                          ? "bg-green-50 text-green-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {role.active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                  {/* ROLE CODE */}

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {role.code}
                  </p>

                </button>
              );
            })}

          </div>
        </div>

        {/* ===================================================
            PERMISSIONS PANEL
        =================================================== */}

        <div className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white">

          {/* PERMISSION HEADER */}

          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-3">

            <div className="min-w-0">

              <h2 className="truncate text-sm font-semibold text-slate-800">
                {selectedRole
                  ? `${selectedRole.name} Permissions`
                  : "Permissions"}
              </h2>

              <p className="mt-0.5 text-[11px] text-slate-400">
                Select the permissions this role should
                have.
              </p>

            </div>

            {/* SELECTED COUNT */}

            <span className="ml-3 shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-medium text-indigo-600">
              {selectedPermissionIds.length} selected
            </span>

          </div>

          {/* PERMISSION CONTENT */}

          <div className="flex min-h-0 flex-1 flex-col p-4">

            {roleLoading ? (

              <div className="flex flex-1 items-center justify-center">
                <p className="text-xs text-slate-400">
                  Loading permissions...
                </p>
              </div>

            ) : permissions.length === 0 ? (

              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-slate-500">
                  No permissions found.
                </p>
              </div>

            ) : (

              <>

                {/* PERMISSION GRID */}

                <div className="grid min-h-0 flex-1 content-start grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">

                  {permissions.map((permission) => {

                    const checked =
                      selectedPermissionIds.includes(
                        permission.id
                      );

                    return (
                      <label
                        key={permission.id}
                        className={`flex min-w-0 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 transition ${
                          checked
                            ? "border-indigo-200 bg-indigo-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >

                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            handlePermissionChange(
                              permission.id
                            )
                          }
                          className="h-4 w-4 shrink-0"
                        />

                        <div className="min-w-0">

                          <p className="truncate text-xs font-medium text-slate-700">
                            {permission.name}
                          </p>

                          <p className="truncate text-[10px] text-slate-400">
                            {permission.code}
                          </p>

                        </div>

                      </label>
                    );
                  })}

                </div>

                {/* SAVE BAR */}

                <div className="mt-3 flex shrink-0 items-center justify-between border-t border-slate-100 pt-3">

                  <p className="text-[10px] text-slate-400">
                    {selectedPermissionIds.length}{" "}
                    permission
                    {selectedPermissionIds.length !==
                    1
                      ? "s"
                      : ""}{" "}
                    selected
                  </p>

                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    disabled={
                      !selectedRole || saving
                    }
                    className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Permissions"}
                  </button>

                </div>

              </>
            )}

          </div>
        </div>

      </div>

      {/* =====================================================
          ADD / EDIT ROLE MODAL
      ===================================================== */}

      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">

          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  {editingRole
                    ? "Edit Role"
                    : "Add Role"}
                </h2>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {editingRole
                    ? "Update the role details."
                    : "Create a new role."}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowRoleModal(false)
                }
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} />
              </button>

            </div>

            {/* FORM */}

            <div className="space-y-4 p-5">

              {/* ROLE NAME */}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Role Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={roleForm.name}
                  onChange={handleRoleFormChange}
                  placeholder="Example: Payroll Manager"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* ROLE CODE */}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Role Code
                </label>

                <input
                  type="text"
                  name="code"
                  value={roleForm.code}
                  onChange={handleRoleFormChange}
                  placeholder="Example: PAYROLL_MANAGER"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Description
                </label>

                <textarea
                  name="description"
                  value={roleForm.description}
                  onChange={handleRoleFormChange}
                  rows={3}
                  placeholder="Describe what this role is used for..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">

              <button
                type="button"
                onClick={() =>
                  setShowRoleModal(false)
                }
                className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveRole}
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingRole
                  ? "Update Role"
                  : "Create Role"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;