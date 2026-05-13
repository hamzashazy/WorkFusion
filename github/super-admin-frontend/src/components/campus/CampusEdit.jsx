import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';

const CampusEdit = () => {
    const { id } = useParams();
    const history = useHistory();
    const [campusData, setCampusData] = useState({
        name: '',
        location: '',
        description: ''
    });

    useEffect(() => {
        // Fetch the campus data from the backend using the id
        const fetchCampusData = async () => {
            const response = await fetch(`/api/campuses/${id}`);
            const data = await response.json();
            setCampusData(data);
        };
        fetchCampusData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCampusData({ ...campusData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Update the campus data in the backend
        await fetch(`/api/campuses/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(campusData),
        });
        history.push('/campus-management');
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Edit Campus</h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Campus Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={campusData.name}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                        Location
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={campusData.location}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={campusData.description}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Update Campus
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CampusEdit;