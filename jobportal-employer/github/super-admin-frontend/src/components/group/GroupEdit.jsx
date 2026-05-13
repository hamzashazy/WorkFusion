import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';

const GroupEdit = () => {
    const { id } = useParams();
    const history = useHistory();
    const [groupData, setGroupData] = useState({
        name: '',
        description: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const response = await axios.get(`/api/groups/${id}`);
                setGroupData(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching group data');
                setLoading(false);
            }
        };
        fetchGroupData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGroupData({ ...groupData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/groups/${id}`, groupData);
            history.push('/groups');
        } catch (err) {
            setError('Error updating group data');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Edit Group</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Group Name</label>
                    <input
                        type="text"
                        name="name"
                        value={groupData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={groupData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600"
                >
                    Update Group
                </button>
            </form>
        </div>
    );
};

export default GroupEdit;