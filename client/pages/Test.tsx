import { useState } from "react";
import React, { useEffect } from "react";

export default function TestConnection() {
  const [message, setMessage] = useState('Connecting...');

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;

    console.log("Fetching from:", `${apiUrl}/api/health/`);

    fetch(`${apiUrl}/api/health/`)
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => {
        console.error(err);
        setMessage('Error connecting to backend');
      });
  }, []);

  return (
    <div className="p-10 border border-red-500">
      <h2 className="text-xl font-bold">Статус Backend:</h2>
      <p>{message}</p>
    </div>
  );
}
