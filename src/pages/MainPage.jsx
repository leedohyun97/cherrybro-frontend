import React from 'react';

const MainPage = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Welcome to CherryBro!</h1>
            <p style={styles.description}>
            </p>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f9f9f9',
        color: '#333',
        fontFamily: 'Arial, sans-serif',
    },
    title: {
        fontSize: '2.5rem',
        marginBottom: '1rem',
    },
    description: {
        fontSize: '1.2rem',
        textAlign: 'center',
        maxWidth: '600px',
    },
};

export default MainPage;