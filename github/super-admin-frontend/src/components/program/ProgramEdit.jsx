import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';

const ProgramEdit = () => {
    const { id } = useParams();
    const history = useHistory();
    const [program, setProgram] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                const response = await axios.get(`/api/programs/${id}`);
                setProgram(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching program details');
                setLoading(false);
            }
        };
        fetchProgram();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProgram({ ...program, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/programs/${id}`, program);
            history.push('/programs');
        } catch (err) {
            setError('Error updating program');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="max-w-md mx-auto p-4 bg-white rounded shadow-md">
            <h2 className="text-2xl font-bold mb-4">Edit Program</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Program Name</label>
                    <input
                        type="text"
                        name="name"
                        value={program.name}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={program.description}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600"
                >
                    Update Program
                </button>
            </form>
        </div>
    );
};

export default ProgramEdit;