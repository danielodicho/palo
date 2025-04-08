import React, { useState } from "react";
import axios from "axios";

const PostForm = () => {
  // Local state for form data
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    platform: "",
  });

  // Endpoint to post data
  const ZAPIER_ENDPOINT =
    "https://hooks.zapier.com/hooks/catch/22402606/202waxr/";

  // Handle changes in form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send a POST request to the Zapier endpoint
      await axios.post(ZAPIER_ENDPOINT, formData);

      // Simple success message — you could show a toast or something fancier
      alert("Content posted successfully!");
      // Reset the form, if desired
      setFormData({
        title: "",
        message: "",
        platform: "",
      });
    } catch (error) {
      console.error("Error posting to Zapier: ", error);
      alert("There was an error posting your content. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Post to Social Media</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Title Field */}
        <label style={styles.label}>
          Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={styles.input}
            placeholder="Enter your title..."
            required
          />
        </label>

        {/* Message Field */}
        <label style={styles.label}>
          Message:
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            style={{ ...styles.input, height: "80px" }}
            placeholder="Enter your post content..."
            required
          />
        </label>

        {/* Platform Select */}
        <label style={styles.label}>
          Platform:
          <select
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            style={styles.input}
            required
          >
            <option value="">-- Select Platform --</option>
            <option value="twitter">Twitter</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
          </select>
        </label>

        <button type="submit" style={styles.button}>
          Post
        </button>
      </form>
    </div>
  );
};

// A few inline styles for simplicity
const styles = {
  container: {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontFamily: "sans-serif",
    background: "#f9f9f9",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "16px",
    fontWeight: "bold",
  },
  input: {
    marginTop: "8px",
    width: "100%",
    padding: "8px",
    boxSizing: "border-box",
  },
  button: {
    marginTop: "20px",
    padding: "10px",
    background: "blue",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default PostForm;
