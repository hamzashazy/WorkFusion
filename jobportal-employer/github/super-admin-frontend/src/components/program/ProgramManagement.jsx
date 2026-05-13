import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProgramManagement = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const response = await axios.get('/api/programs'); // Adjust the API endpoint as needed
                setPrograms(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPrograms();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this program?')) {
            try {
                await axios.delete(`/api/programs/${id}`); // Adjust the API endpoint as needed
                setPrograms(programs.filter(program => program.id !== id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Program Management</h1>
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Program Name</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {programs.map(program => (
                        <tr key={program.id}>
                            <td className="py-2 px-4 border-b">{program.name}</td>
                            <td className="py-2 px-4 border-b">
                                <button 
                                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                                    onClick={() => {/* Navigate to edit page */}}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                    onClick={() => handleDelete(program.id)}
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

export default ProgramManagement;