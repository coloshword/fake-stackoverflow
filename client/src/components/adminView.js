import React, { useEffect, useState, useContext } from 'react';


const AdminView = ({ onUserClick }) => {
    const [users, setUsers] = useState([]);
    const [adminInfo, setAdminInfo] = useState({ membershipDuration: '', reputation: '' });

    useEffect(() => {
        // Fetch admin details (membership duration, reputation)
        // Fetch users
        const fetchAdminAndUsers = async () => {
            try {
                // Replace with actual API requests
                const adminResponse = await fetch('http://localhost:8000/api/admin/details');
                const adminData = await adminResponse.json();
                setAdminInfo({ membershipDuration: adminData.user_date_time });

                const userResponse = await fetch('http://localhost:8000/api/admin/users');
                const userData = await userResponse.json();
                if (userData && userData.users) {
                    setUsers(userData.users);
                } else {
                    setUsers([]);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchAdminAndUsers();
    }, []);

    const handleUserClick = (user) => {
        onUserClick(user.username); // Call the passed callback function
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            // Perform the delete operation
            try {
                await fetch(`http://localhost:8000/api/admin/users/${userId}`, { method: 'DELETE' });
                // Update the state to reflect the deletion
                setUsers(users.filter(user => user._id !== userId));
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

            return (
                <div>
                    <div style={{ 
                        textAlign: 'center', 
                        border: '1px solid #ccc', 
                        padding: '10px', 
                        margin: '10px 0' 
                    }}>
                        <h2>Admin Details</h2>  
                        <p>Membership Duration: {adminInfo.membershipDuration}</p>
                        {/* Admin details here */}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {users.map(user => (
                            <div key={user._id} style={{ 
                                border: '1px dashed black', 
                                padding: '10px', 
                                margin: '10px', 
                                borderRadius: '5px',
                                width: '100%'
                            }}>
                            <li key={user._id}>
                            <a href="#" onClick={() => handleUserClick(user)}>{user.username}</a> - Reputation: {user.reputation}
                                <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                            </li>
                            </div>
                        ))}
                    </div>
                </div>
            );
};

export default AdminView;
