import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './Invoice.css';
import axiosClient from '../axiosClient';
import logo from '../assets/logo.png'

function Invoice({ show, onClose, selectedPayment }) {

    const [paymentDetails, setPaymentDetails] = useState(null);

    useEffect(() => {
        if (show && selectedPayment) {
        axiosClient.get(`/payments/${selectedPayment}`)
            .then(res => setPaymentDetails(res.data.payment))
            .catch(err => {
            console.error(err);
            Swal.fire('Error', 'Could not load invoice.', 'error');
            });
        }
    }, [show, selectedPayment]);

  if (!show) return null;
  if (!paymentDetails) return <div className="modal-overlay">Loading invoice...</div>;

  return (
    <div className="modal-overlay">
      <div className="modal add-food-modal">
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="invoice-header">
              <img src={logo} alt="Ollinati Catering" className="company-logo" />
              <div className="company-contact">
                <div>📞 0919-3745-162 / 0933-3960-877</div>
                <div>📍 Ron Pavilion Bunsuran 1st Pandi, Bulacan</div>
              </div>
            </div>
            
            <div className="invoice-details">
              <div className="invoice-row">
                <span>Invoice No.: R-{String(paymentDetails?.payment_id).padStart(5, '0')}</span>
                <span className="invoice-divider">|</span>
                <span>Date: {new Date(paymentDetails?.payment_date).toLocaleDateString()}</span>
              </div>
              <div className="customer-row">
                Customer: {[
                    paymentDetails?.booking?.customer?.customer_firstname,
                    paymentDetails?.booking?.customer?.customer_middlename,
                    paymentDetails?.booking?.customer?.customer_lastname
                ].filter(Boolean).join(' ')}
              </div>
            </div>
            
            <div className="invoice-table">
              <div className="invoice-table-header">
                <span>Description</span>
                <span>Price</span>
              </div>
              <div className="invoice-table-row">
                <span>{paymentDetails?.remarks}</span>
                <span>Php {parseFloat(paymentDetails?.amount_paid).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="invoice-total">
              <div className="total-row">
                <span className="total-label">Total</span>
                <span className="total-amount">Php {parseFloat(paymentDetails?.amount_paid).toLocaleString()}</span>
              </div>
              <div className="payment-details">
                <div className="payment-row">
                  <span>Cash</span>
                  <span>Php {parseFloat(paymentDetails?.cash_given).toLocaleString()}</span>
                </div>
                <div className="payment-row">
                  <span>Change</span>
                  <span>Php {parseFloat(paymentDetails?.change_given).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="thank-you">
              ***** THANK YOU *****
            </div>
      </div>
    </div>
  );
}

export default Invoice;
