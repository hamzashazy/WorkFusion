import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CampusManagement = () => {
    const [campuses, setCampuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCampuses = async () => {
            try {
                const response = await axios.get('/api/campuses'); // Adjust the API endpoint as needed
                setCampuses(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCampuses();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/campuses/${id}`); // Adjust the API endpoint as needed
            setCampuses(campuses.filter(campus => campus.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Campus Management</h1>
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Campus Name</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {campuses.map(campus => (
                        <tr key={campus.id}>
                            <td className="py-2 px-4 border-b">{campus.name}</td>
                            <td className="py-2 px-4 border-b">
                                <button 
                                    className="text-blue-500 hover:underline"
                                    onClick={() => handleDelete(campus.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CampusManagement;