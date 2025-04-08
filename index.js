import React from "react";
import ReactDOM from "react-dom";
import PostForm from "./PostForm";

function App() {
  return (
    <div>
      <h1>Social Media Content Generator</h1>
      <PostForm />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
