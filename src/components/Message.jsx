import React from "react";
import { Alert } from "react-bootstrap";

// Sử dụng JavaScript default parameters thay vì defaultProps
const Message = ({ variant = "info", children }) => {
  return (
    <Alert variant={variant} className="my-3">
      {children}
    </Alert>
  );
};

export default Message;
