import React from 'react';
import 한국원종 from '../images/한국원종_1024x700.jpg';

const MainPage = () => {
    return (
        <img src={한국원종} alt="Main" style={{ width: '100%', height: 'auto', maxWidth: '800px', borderRadius: '10px' }} />
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