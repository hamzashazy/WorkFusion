import React, { useState } from 'react';

const AdminCreate = () => {
    const [adminData, setAdminData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdminData({
            ...adminData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add logic to handle form submission, e.g., API call to create admin
        console.log('Admin created:', adminData);
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-5">Create New Admin</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={adminData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={adminData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={adminData.password}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    Create Admin
                </button>
            </form>
        </div>
    );
};

export default AdminCreate;