import React, { useState, useEffect } from 'react';

const AdminEdit = ({ match }) => {
    const [adminData, setAdminData] = useState({
        name: '',
        email: '',
        role: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            const response = await fetch(`/api/admins/${match.params.id}`);
            const data = await response.json();
            setAdminData(data);
            setLoading(false);
        };

        fetchAdminData();
    }, [match.params.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdminData({ ...adminData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch(`/api/admins/${match.params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(adminData),
        });
        // Redirect or show success message
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Edit Admin</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={adminData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={adminData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                        name="role"
                        value={adminData.role}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default AdminEdit;