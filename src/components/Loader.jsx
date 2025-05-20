import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = () => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
      <Spinner 
        animation="border" 
        role="status" 
        style={{ width: '100px', height: '100px' }}
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default Loader;
