import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);

    useEffect(() => {
        // Fetch the list of admins from the backend
        const fetchAdmins = async () => {
            try {
                const response = await fetch('/api/admins'); // Adjust the API endpoint as necessary
                const data = await response.json();
                setAdmins(data);
            } catch (error) {
                console.error('Error fetching admin data:', error);
            }
        };

        fetchAdmins();
    }, []);

    const handleDelete = async (id) => {
        // Delete admin by ID
        try {
            await fetch(`/api/admins/${id}`, {
                method: 'DELETE',
            });
            setAdmins(admins.filter(admin => admin.id !== id));
        } catch (error) {
            console.error('Error deleting admin:', error);
        }
    };

    return (
        <div className="p-6 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Admin Management</h1>
            <Link to="/admin/create" className="mb-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
                Create New Admin
            </Link>
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Name</th>
                        <th className="py-2 px-4 border-b">Email</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {admins.map(admin => (
                        <tr key={admin.id}>
                            <td className="py-2 px-4 border-b">{admin.id}</td>
                            <td className="py-2 px-4 border-b">{admin.name}</td>
                            <td className="py-2 px-4 border-b">{admin.email}</td>
                            <td className="py-2 px-4 border-b">
                                <Link to={`/admin/edit/${admin.id}`} className="text-blue-500 hover:underline">Edit</Link>
                                <button onClick={() => handleDelete(admin.id)} className="text-red-500 hover:underline ml-4">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminManagement;