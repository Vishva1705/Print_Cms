import React from 'react';

const PressFTPs = () => {
  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        {/* Sidebar content goes here */}
        <p>Sidebar Content</p>
      </div>
      <div style={styles.page}>
        <div style={styles.iframeContainer}>
          <iframe
            src="http://192.168.90.33:7156/PressFtp"
            title="FTP Viewer"
            style={styles.iframe}
          ></iframe>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',  // Full viewport height
  },
  sidebar: {
    width: '250px',  // Set width for the sidebar
    backgroundColor: '#333',
    color: 'white',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  page: {
    flex: 1,  // Take the remaining space after the sidebar
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  iframeContainer: {
    width: '100%',
    height: '100%',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
};

export default PressFTPs;
