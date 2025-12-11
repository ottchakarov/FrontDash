import { useState } from 'react';

// This component acts as the bridge to your Java Backend
const AddMenuItem = () => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Prepare the data
        const menuItem = { name, price, description };

        try {
            // 2. Send it to the Backend (Port 8080)
            const response = await fetch('http://localhost:8080/api/menu/restaurant/rest-001', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(menuItem)
            });

            if (response.ok) {
                alert("Success! Backend received the item.");
                setName(""); setPrice(""); setDescription("");
            } else {
                alert("Backend rejected it.");
            }
        } catch (error) {
            console.error(error);
            alert("Connection Failed: Is the Java Backend running?");
        }
    };

    return (
        <div style={{ padding: "20px", border: "2px solid #007bff", margin: "20px", borderRadius: "8px" }}>
            <h3>Create New Menu Item</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input 
                    placeholder="Item Name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                />
                <input 
                    type="number" 
                    placeholder="Price" 
                    value={price} 
                    onChange={e => setPrice(e.target.value)} 
                    required 
                />
                <textarea 
                    placeholder="Description" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                />
                <button type="submit" style={{ background: "#007bff", color: "white", padding: "10px" }}>
                    Send to Database
                </button>
            </form>
        </div>
    );
};

export default AddMenuItem;