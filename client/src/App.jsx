import { useEffect, useState } from "react";

function App() {
  const [users, setUsers] = useState([]);
  const [forms, setForms] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [submitStatus, setSubmitStatus] = useState("");
  const [editingForm, setEditingForm] = useState(null);

  const API_BASE = "https://monjur.up.railway.app";

  useEffect(() => {
    fetchUsers();
    fetchForms();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchForms = async () => {
    try {
      const response = await fetch(`${API_BASE}/forms`);
      const data = await response.json();
      setForms(data);
    } catch (error) {
      console.error("Error fetching forms:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus("Submitting...");

    try {
      const url = editingForm ? `${API_BASE}/forms/${editingForm.id}` : `${API_BASE}/submit-form`;
      const method = editingForm ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus(editingForm ? "Form updated successfully!" : "Form submitted successfully!");
        setFormData({ name: "", email: "", message: "" });
        setEditingForm(null);
        fetchForms();
      } else {
        setSubmitStatus("Error: " + (result.details ? result.details.join(', ') : result.error));
      }
    } catch (error) {
      setSubmitStatus("Error submitting form");
      console.error("Submission error:", error);
    }
  };

  const handleEdit = (form) => {
    setFormData({
      name: form.name,
      email: form.email,
      message: form.message
    });
    setEditingForm(form);
    setSubmitStatus("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this form?")) {
      try {
        const response = await fetch(`${API_BASE}/forms/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.success) {
          setSubmitStatus("Form deleted successfully!");
          fetchForms();
        } else {
          setSubmitStatus("Error deleting form");
        }
      } catch (error) {
        setSubmitStatus("Error deleting form");
        console.error("Delete error:", error);
      }
    }
  };

  const cancelEdit = () => {
    setFormData({ name: "", email: "", message: "" });
    setEditingForm(null);
    setSubmitStatus("");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1>Contact Form with Sequelize ORM</h1>
      
      {/* Contact Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "40px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h2>{editingForm ? "Edit Form" : "Submit New Form"}</h2>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
          />
        </div>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
          />
        </div>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Message:</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows="4"
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
          />
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            type="submit"
            style={{ 
              padding: "10px 20px", 
              backgroundColor: editingForm ? "#28a745" : "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {editingForm ? "Update Form" : "Submit Form"}
          </button>
          
          {editingForm && (
            <button 
              type="button"
              onClick={cancelEdit}
              style={{ 
                padding: "10px 20px", 
                backgroundColor: "#6c757d", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          )}
        </div>
        
        {submitStatus && (
          <p style={{ 
            marginTop: "10px", 
            color: submitStatus.includes("Error") ? "red" : "green" 
          }}>
            {submitStatus}
          </p>
        )}
      </form>

      {/* Display Submitted Forms */}
      <div style={{ marginBottom: "40px" }}>
        <h2>Submitted Forms ({forms.length})</h2>
        {forms.length === 0 ? (
          <p>No forms submitted yet.</p>
        ) : (
          forms.map((form) => (
            <div key={form.id} style={{ 
              border: "1px solid #ddd", 
              padding: "15px", 
              marginBottom: "10px", 
              borderRadius: "4px",
              backgroundColor: editingForm?.id === form.id ? "#f8f9fa" : "white"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 5px 0" }}>{form.name}</h4>
                  <p style={{ margin: "0 0 10px 0", color: "#666" }}>{form.email}</p>
                  <p style={{ margin: "0 0 10px 0" }}>{form.message}</p>
                  <small style={{ color: "#999" }}>
                    Submitted: {new Date(form.created_at).toLocaleString()}
                  </small>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    onClick={() => handleEdit(form)}
                    style={{ 
                      padding: "5px 10px", 
                      backgroundColor: "#ffc107", 
                      color: "black", 
                      border: "none", 
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(form.id)}
                    style={{ 
                      padding: "5px 10px", 
                      backgroundColor: "#dc3545", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Existing Users Display */}
      <div>
        <h2>Users from MySQL</h2>
        <ul>
          {users.map((u) => (
            <li key={u.id}>{u.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;