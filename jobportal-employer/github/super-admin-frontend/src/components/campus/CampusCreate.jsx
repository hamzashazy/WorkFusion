import React, { useState } from 'react';

const CampusCreate = () => {
    const [campusName, setCampusName] = useState('');
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!campusName || !location) {
            setError('All fields are required');
            return;
        }
        // Add logic to handle campus creation (e.g., API call)
        console.log('Campus Created:', { campusName, location });
        setCampusName('');
        setLocation('');
        setError('');
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Create New Campus</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700" htmlFor="campusName">Campus Name</label>
                    <input
                        type="text"
                        id="campusName"
                        value={campusName}
                        onChange={(e) => setCampusName(e.target.value)}
                        className="mt-1 block w-full border rounded p-2"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700" htmlFor="location">Location</label>
                    <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="mt-1 block w-full border rounded p-2"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600"
                >
                    Create Campus
                </button>
            </form>
        </div>
    );
};

export default CampusCreate;