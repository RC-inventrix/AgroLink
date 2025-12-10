import React, { useState, useEffect } from 'react';

// Project Colors
const theme = {
    primaryYellow: '#EEC044',
    darkGreen: '#03230F',
    white: '#FFFFFF',
    lightText: '#666666',
    borderColor: '#E0E0E0',
    bgGray: '#F9F9F9'
};

const OrderHistory = () => {
    // 1. STATE: Popup එක සහ Order List එක පාලනය කරන්න
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]); // මුලින්ම ලිස්ට් එක හිස්ව තියනවා

    // 2. USE EFFECT: Page එක Load වෙනකොටම Backend එකෙන් Data ඉල්ලනවා
    useEffect(() => {
        fetch('http://localhost:8080/api/orders') // Spring Boot URL එක
            .then(response => response.json())
            .then(data => {
                console.log("Data received form Backend:", data); // හරිගියාද බලන්න Log එකක්
                setOrders(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                // Error එකක් ආවොත් Console එකේ පෙන්නනවා
            });
    }, []);

    // Popup එක Open කරන Function එක
    const handleViewClick = (order) => {
        setSelectedOrder(order);
    };

    // Popup එක Close කරන Function එක
    const closePopup = () => {
        setSelectedOrder(null);
    };

    return (
        <div style={styles.pageContainer}>

            {/* Header Section */}
            <div style={styles.headerSection}>
                <h1 style={styles.mainTitle}>Order History</h1>
                <p style={styles.breadcrumb}>Home / My Account / Orders</p>
            </div>

            <div style={styles.contentWrapper}>
                <div style={styles.tableContainer}>

                    {/* Table Header (Yellow Bar) */}
                    <div style={styles.tableHeader}>
                        <div style={{...styles.col, flex: 2}}>Product / Order</div>
                        <div style={{...styles.col, flex: 1}}>Date</div>
                        <div style={{...styles.col, flex: 1}}>Status</div>
                        <div style={{...styles.col, flex: 1}}>Total</div>
                        <div style={{...styles.col, flex: 1, textAlign: 'right'}}>Action</div>
                    </div>

                    {/* List Rows - Backend එකෙන් ආපු Data තමයි මෙතන පෙන්නන්නේ */}
                    {orders.length > 0 ? (
                        orders.map((order) => (
                            <div key={order.id} style={styles.tableRow}>
                                <div style={{...styles.col, flex: 2, display: 'flex', alignItems: 'center', gap: '15px'}}>
                                    {/* Image එක පෙන්නන තැන */}
                                    <img
                                        src={order.image ? order.image : "https://via.placeholder.com/60"}
                                        alt="product"
                                        style={styles.productImage}
                                        onError={(e) => {e.target.src = 'https://via.placeholder.com/60'}} // Image එක අවුල් නම් Placeholder එකක්
                                    />
                                    <div>
                                        <span style={styles.orderIdText}>Order #{order.id}</span>
                                        <div style={styles.subText}>{order.items}</div>
                                    </div>
                                </div>
                                <div style={{...styles.col, flex: 1}}>{order.date}</div>
                                <div style={{...styles.col, flex: 1}}>
                  <span style={{
                      ...styles.statusBadge,
                      backgroundColor: order.status === 'Pending' ? '#FFF4E5' : (order.status === 'Shipped' ? '#E3F2FD' : '#E8F5E9'),
                      color: order.status === 'Pending' ? '#FF9800' : (order.status === 'Shipped' ? '#2196F3' : 'green')
                  }}>
                    {order.status}
                  </span>
                                </div>
                                <div style={{...styles.col, flex: 1, fontWeight: 'bold'}}>Rs. {order.total}</div>
                                <div style={{...styles.col, flex: 1, textAlign: 'right'}}>
                                    <button
                                        style={styles.viewBtn}
                                        onClick={() => handleViewClick(order)}
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Data තාම ආවේ නැත්නම් හෝ ලිස්ට් එක හිස් නම් මේක පේනවා
                        <div style={{padding: '20px', textAlign: 'center', color: '#888'}}>
                            Loading orders... (Make sure Spring Boot is running!)
                        </div>
                    )}

                </div>
            </div>

            {/* POPUP SECTION (MODAL) */}
            {selectedOrder && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>

                        <div style={styles.modalHeader}>
                            <h2 style={{margin: 0}}>Order Details</h2>
                            <button onClick={closePopup} style={styles.closeBtn}>X</button>
                        </div>

                        <div style={styles.modalBody}>
                            <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                            <p><strong>Status:</strong> {selectedOrder.status}</p>
                            <p><strong>Date:</strong> {selectedOrder.date}</p>

                            <hr style={{borderColor: '#eee', margin: '20px 0'}}/>

                            <h4 style={{marginTop: 0}}>Item Summary:</h4>
                            <p>{selectedOrder.items}</p>
                            {/* Note: Java Backend එකෙන් තාම 'details' array එක එවන විදිය අපි හදලා නෑ.
                  ඒ නිසා දැනට items summary එක විතරක් පෙන්නමු. Error එන එක නවතින්න. */}

                            <div style={styles.summaryBox}>
                                <div style={{...styles.summaryRow, fontWeight: 'bold', fontSize: '18px', marginTop: '10px'}}>
                                    <span>Total Paid:</span>
                                    <span>Rs. {selectedOrder.total}</span>
                                </div>
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button onClick={closePopup} style={styles.closeActionBtn}>Close</button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

// CSS Styles (වෙනසක් නෑ, කලින් වගේමයි)
const styles = {
    pageContainer: { fontFamily: "'Poppins', sans-serif", backgroundColor: theme.white, minHeight: '100vh', paddingBottom: '50px' },
    headerSection: { backgroundColor: '#f8f9fa', padding: '60px 20px', textAlign: 'center', marginBottom: '40px', backgroundImage: 'radial-gradient(#e0e0e0 1px, transparent 1px)', backgroundSize: '20px 20px' },
    mainTitle: { fontSize: '36px', color: theme.darkBlack, margin: '0 0 10px 0', fontWeight: '600' },
    breadcrumb: { color: theme.lightText, fontSize: '14px' },
    contentWrapper: { maxWidth: '1000px', margin: '0 auto', padding: '0 20px' },
    tableContainer: { width: '100%' },
    tableHeader: { display: 'flex', backgroundColor: theme.primaryYellow, padding: '15px 20px', fontWeight: 'bold', color: theme.darkGreen, borderRadius: '4px 4px 0 0' },
    tableRow: { display: 'flex', alignItems: 'center', padding: '20px', borderBottom: `1px solid ${theme.borderColor}`, backgroundColor: theme.white },
    col: { fontSize: '15px', color: theme.darkGreen },
    productImage: { width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', backgroundColor: '#eee' },
    orderIdText: { fontWeight: 'bold', display: 'block', marginBottom: '4px' },
    subText: { fontSize: '13px', color: '#888' },
    statusBadge: { padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
    viewBtn: { backgroundColor: theme.darkGreen, color: theme.primaryYellow, border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },

    // Modal Styles
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: theme.white, width: '500px', maxWidth: '90%', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', animation: 'fadeIn 0.3s' },
    modalHeader: { backgroundColor: theme.primaryYellow, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: theme.darkGreen },
    closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: theme.darkGreen, fontWeight: 'bold' },
    modalBody: { padding: '20px', color: theme.darkGreen },
    summaryBox: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginTop: '20px' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
    modalFooter: { padding: '15px 20px', borderTop: '1px solid #eee', textAlign: 'right' },
    closeActionBtn: { backgroundColor: theme.darkGreen, color: theme.white, border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }
};

export default OrderHistory;