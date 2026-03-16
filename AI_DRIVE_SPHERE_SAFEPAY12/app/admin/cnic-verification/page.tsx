import React from 'react';

const CNICVerificationDashboard = () => {
    const [cnicDocs, setCnicDocs] = React.useState([]);
    const [userDetails, setUserDetails] = React.useState({});

    const handleApproval = (cnic) => {
        // Logic for approval
    };

    const handleRejection = (cnic) => {
        // Logic for rejection
    };

    return (
        <div>
            <h1>Admin CNIC Verification Dashboard</h1>
            <h2>User Details</h2>
            {/* Display user details here */}
            <p>Name: {userDetails.name}</p>
            <p>Email: {userDetails.email}</p>

            <h2>CNIC Documents List</h2>
            <ul>
                {cnicDocs.map((doc) => (
                    <li key={doc.cnic}> 
                        CNIC: {doc.cnic} 
                        <button onClick={() => handleApproval(doc.cnic)}>Approve</button>
                        <button onClick={() => handleRejection(doc.cnic)}>Reject</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CNICVerificationDashboard;