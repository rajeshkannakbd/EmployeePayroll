import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";

const API_BASE_URL = "http://localhost:8080";

const initialForm = {
  departmentName: "",
};

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1.5 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

function DepartmentManagement() {

  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [fetching, setFetching] = useState(true);

  const [fieldError, setFieldError] = useState("");

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");


  // ----------------------------------------
  // FETCH DEPARTMENTS
  // ----------------------------------------

  useEffect(() => {
    fetchDepartments();
  }, []);


  const fetchDepartments = async () => {

    try {

      setFetching(true);
      setError("");

      const response = await axiosInstance.get(
        `${API_BASE_URL}/departments`
      );

      setDepartments(response.data || []);

    } catch (error) {

      console.error(
        "Failed to fetch departments:",
        error
      );

      setError("Failed to load departments.");

    } finally {

      setFetching(false);
    }
  };


  // ----------------------------------------
  // HANDLE INPUT
  // ----------------------------------------

  const handleChange = (event) => {

    const { value } = event.target;

    setForm({
      departmentName: value,
    });

    setFieldError("");
    setError("");
    setMessage("");
  };


  // ----------------------------------------
  // VALIDATION
  // ----------------------------------------

  const validateForm = () => {

    const name = form.departmentName.trim();

    if (!name) {

      setFieldError(
        "Department name is required."
      );

      return false;
    }

    if (name.length < 2) {

      setFieldError(
        "Department name must be at least 2 characters."
      );

      return false;
    }

    if (name.length > 100) {

      setFieldError(
        "Department name cannot exceed 100 characters."
      );

      return false;
    }

    return true;
  };


  // ----------------------------------------
  // CREATE / UPDATE
  // ----------------------------------------

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setMessage("");

    if (!validateForm()) {
      return;
    }

    try {

      setLoading(true);

      const payload = {
        departmentName:
          form.departmentName.trim(),
      };


      if (editingId) {

        await axiosInstance.put(
          `${API_BASE_URL}/departments/${editingId}`,
          payload
        );

        setMessage(
          "Department updated successfully."
        );

      } else {

        await axiosInstance.post(
          `${API_BASE_URL}/departments`,
          payload
        );

        setMessage(
          "Department created successfully."
        );
      }


      setForm(initialForm);
      setEditingId(null);
      setFieldError("");

      await fetchDepartments();

    } catch (error) {

      console.error(
        "Failed to save department:",
        error
      );

      const responseData =
        error.response?.data;


      if (responseData?.errors) {

        const departmentError =
          responseData.errors.departmentName;

        if (Array.isArray(departmentError)) {

          setFieldError(
            departmentError[0]
          );

        } else if (
          typeof departmentError === "string"
        ) {

          setFieldError(departmentError);

        } else {

          setError(
            responseData.message ||
            "Validation failed."
          );
        }

      } else if (responseData?.message) {

        setError(responseData.message);

      } else {

        setError(
          "Failed to save department."
        );
      }

    } finally {

      setLoading(false);
    }
  };


  // ----------------------------------------
  // EDIT
  // ----------------------------------------

  const handleEdit = (department) => {

    setEditingId(
      department.departmentId
    );

    setForm({
      departmentName:
        department.departmentName || "",
    });

    setFieldError("");
    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // ----------------------------------------
  // DELETE
  // ----------------------------------------

  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setError("");
      setMessage("");

      await axiosInstance.delete(
        `${API_BASE_URL}/departments/${id}`
      );

      setMessage(
        "Department deleted successfully."
      );

      await fetchDepartments();

    } catch (error) {

      console.error(
        "Failed to delete department:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to delete department."
      );
    }
  };


  // ----------------------------------------
  // CANCEL EDIT
  // ----------------------------------------

  const handleCancel = () => {

    setEditingId(null);

    setForm(initialForm);

    setFieldError("");
    setError("");
    setMessage("");
  };


  // ----------------------------------------
  // RENDER
  // ----------------------------------------

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>

        <h1 className="text-2xl font-bold text-slate-800">
          Department Management
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create, update and manage employee departments.
        </p>

      </div>


      {/* SUCCESS */}

      {message && (

        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4">

          <p className="text-sm font-medium text-green-700">
            {message}
          </p>

        </div>

      )}


      {/* ERROR */}

      {error && (

        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">

          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

        </div>

      )}


      {/* FORM */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-slate-800">

          {editingId
            ? "Edit Department"
            : "Add Department"}

        </h2>


        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-5"
        >

          <div className="max-w-xl">

            <label className="mb-2 block text-sm font-semibold text-slate-700">

              Department Name

              <span className="text-red-500">
                {" "}*
              </span>

            </label>


            <input
              type="text"
              name="departmentName"
              value={form.departmentName}
              onChange={handleChange}
              placeholder="Enter department name"
              disabled={loading}
              className={`w-full rounded-xl border ${
                fieldError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-green-600 focus:ring-green-100"
              } px-4 py-3 text-sm outline-none transition disabled:bg-slate-100`}
            />


            <FieldError
              message={fieldError}
            />


            <div className="mt-4 flex gap-3">
            
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#1BBD36] hover:bg-[#159A2C] px-5 py-3 text-sm font-semibold text-white transition  disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading
                  ? "Saving..."
                  : editingId
                    ? "Update Department"
                    : "Add Department"}

              </button>


              {editingId && (

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

              )}

            </div>

          </div>

        </form>

      </div>


      {/* DEPARTMENT TABLE */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 p-6">

          <h2 className="text-lg font-semibold text-slate-800">
            Departments
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage departments available in the system.
          </p>

        </div>


        {fetching ? (

          <div className="p-6 text-sm text-slate-500">
            Loading departments...
          </div>

        ) : departments.length === 0 ? (

          <div className="p-6 text-center text-sm text-slate-500">
            No departments found.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    ID
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Department Name
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {departments.map((department) => (

                  <tr
                    key={department.departmentId}
                    className="hover:bg-slate-50"
                  >

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {department.departmentId}
                    </td>

                    <td className="px-6 py-4">

                      <span className="font-medium text-slate-800">
                        {department.departmentName}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(department)
                          }
                          className="rounded-lg border border-green-200 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50"
                        >
                          Edit
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              department.departmentId
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default DepartmentManagement;