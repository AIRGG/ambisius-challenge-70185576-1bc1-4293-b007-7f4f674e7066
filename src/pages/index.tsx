import React, { useEffect, useState } from "react";
import CustomButton from "@/components/CustomButton";
import "@/app/globals.css";

export default function Index() {
    interface Row {
        firstName: string;
        lastName: string;
        position: string;
        phone: string;
        email: string;
      }
    type SortOrder = 'asc' | 'desc' | 'none';
    const tmpRow = {
        firstName: "",
        lastName: "",
        position: "",
        phone: "",
        email: "",
      } as Row;
  const [rows, setRows] = useState<Row[]>([]);

  const url = 'http://localhost:3005/employee'; // API endpoint

  const [editIndex, setEditIndex] = useState<{
    row: number;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Row | null, order: SortOrder }>({
    key: null,
    order: 'none'
  });

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const addRow = () => {
    setRows([{...tmpRow}, ...rows]);
  };

   // Function to handle double click and enable editing
   const handleDoubleClick = (rowIndex: number, field: keyof Row, value: string) => {
    setEditIndex({ row: rowIndex, field });
    setEditValue(value);
  };

  // Function to handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  // Function to check if email already exists in the rows
  const isEmailTaken = (email: string, rowIndex: number): boolean => {
    return rows.some((row, index) => row.email === email && index !== rowIndex);
  };

  // Function to save the value when input loses focus
  const handleBlur = (rowIndex: number, field: keyof Row) => {
    setErrorMessage('')
    if (field === 'email') {
      // Check if the email format is correct
      if (!emailPattern.test(editValue)) {
        setErrorMessage('Invalid email format');
        return;
      }

      // Check if email already exists in the table
      if (isEmailTaken(editValue, rowIndex)) {
        setErrorMessage('Email is already taken');
        return;
      }
    }

    // Update the row with the new value
    const updatedRows = [...rows];
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], [field]: editValue };
    setRows(updatedRows);
    setEditIndex(null); // Exit edit mode
  };

  // Function to handle sorting
  const handleSort = (column: keyof Row) => {
    let newOrder: SortOrder = 'asc';
    if (sortConfig.key === column && sortConfig.order === 'asc') {
      newOrder = 'desc';
    } else if (sortConfig.key === column && sortConfig.order === 'desc') {
      newOrder = 'none';
    }

    setSortConfig({ key: column, order: newOrder });

    if (newOrder === 'none') {
      // If sorting is reset, return to the original order (this assumes rows are initially in original order)
      return;
    }

    const sortedRows = [...rows].sort((a, b) => {
      if (a[column] < b[column]) {
        return newOrder === 'asc' ? -1 : 1;
      }
      if (a[column] > b[column]) {
        return newOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setRows(sortedRows);
  };

  // Function to render sort indicator
  const renderSortIndicator = (column: keyof Row) => {
    if (sortConfig.key === column) {
      if (sortConfig.order === 'asc') return ' 🔼'; // Ascending arrow
      if (sortConfig.order === 'desc') return ' 🔽'; // Descending arrow
    }
    return ''; // No indicator for 'none'
  };

  const saveData = async () => {
    // Data to be sent in the request body
    const data = {
      data: [...rows]
    };
  
    try {
      const response = await fetch(url, {
        method: 'PUT', // Specify the HTTP method
        headers: {
          'Content-Type': 'application/json', // Content-Type header
        },
        body: JSON.stringify(data), // Convert the data object to a JSON string
      });
  
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // Parse the JSON response
      const responseData = await response.json();
      setRows([...responseData])
      alert('Success Save data..!')
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const init = async () => {
    try {
        const response = await fetch(url, {
          method: 'GET', // Specify the HTTP method
        });
    
        // Check if the response is successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Parse the JSON response
        const responseData = await response.json();
        setRows([...responseData])
      } catch (error) {
        console.error('Error saving data:', error);
      }
  }

  useEffect( () => { 
    init()
  }, [])

  return (
    <>
      <div className="d-flex">
        <CustomButton onClick={addRow}>
          <span>Add Row</span>
        </CustomButton>
        <CustomButton onClick={saveData}>
          <span>Save</span>
        </CustomButton>
      </div>
      <div className="d-flex">
        <table className="border-collapse border border-slate-500">
        <thead>
            <tr>
              <th className="border border-slate-600" onClick={() => handleSort('firstName')}>
                First Name {renderSortIndicator('firstName')}
              </th>
              <th className="border border-slate-600" onClick={() => handleSort('lastName')}>
                Last Name {renderSortIndicator('lastName')}
              </th>
              <th className="border border-slate-600" onClick={() => handleSort('position')}>
                Position {renderSortIndicator('position')}
              </th>
              <th className="border border-slate-600" onClick={() => handleSort('phone')}>
                Phone {renderSortIndicator('phone')}
              </th>
              <th className="border border-slate-600" onClick={() => handleSort('email')}>
                Email {renderSortIndicator('email')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="h-10">
                {(Object.keys(tmpRow) as Array<keyof Row>).map((field) => (
                  <td
                    key={field}
                    className="border border-slate-700"
                    onDoubleClick={() => handleDoubleClick(rowIndex, field, row[field])}
                  >
                    {editIndex?.row === rowIndex && editIndex.field === field ? (
                      <>
                        <input
                          type="text"
                          value={editValue}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur(rowIndex, field)}
                          autoFocus
                        />
                        {/* Show error message for email field */}
                        {field === 'email' && errorMessage && (
                          <div className="text-red-600 text-xs">{errorMessage}</div>
                        )}
                      </>
                    ) : (
                      row[field]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
