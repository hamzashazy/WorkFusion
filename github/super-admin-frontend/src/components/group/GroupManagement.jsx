import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const GroupManagement = () => {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        // Fetch groups from the backend API
        const fetchGroups = async () => {
            try {
                const response = await fetch('/api/groups');
                const data = await response.json();
                setGroups(data);
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        };

        fetchGroups();
    }, []);

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/groups/${id}`, {
                method: 'DELETE',
            });
            setGroups(groups.filter(group => group.id !== id));
        } catch (error) {
            console.error('Error deleting group:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Group Management</h1>
            <Link to="/groups/create" className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">
                Create New Group
            </Link>
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Group Name</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {groups.map(group => (
                        <tr key={group.id}>
                            <td className="py-2 px-4 border-b">{group.name}</td>
                            <td className="py-2 px-4 border-b">
                                <Link to={`/groups/edit/${group.id}`} className="text-blue-500 hover:underline">Edit</Link>
                                <button onClick={() => handleDelete(group.id)} className="text-red-500 hover:underline ml-4">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default GroupManagement;