import React, { useEffect, useState } from 'react';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('/api/students'); // Adjust the API endpoint as needed
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error('Error fetching students:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await fetch(`/api/students/${id}`, {
                    method: 'DELETE',
                });
                setStudents(students.filter(student => student.id !== id));
            } catch (error) {
                console.error('Error deleting student:', error);
            }
        }
    };

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Student Management</h1>
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
                    {students.map(student => (
                        <tr key={student.id}>
                            <td className="py-2 px-4 border-b">{student.id}</td>
                            <td className="py-2 px-4 border-b">{student.name}</td>
                            <td className="py-2 px-4 border-b">{student.email}</td>
                            <td className="py-2 px-4 border-b">
                                <button 
                                    className="text-blue-500 hover:underline"
                                    onClick={() => {/* Navigate to edit page */}}>
                                    Edit
                                </button>
                                <button 
                                    className="text-red-500 hover:underline ml-4"
                                    onClick={() => handleDelete(student.id)}>
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

export default StudentManagement;