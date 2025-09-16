import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import './Invoice.css';
import axiosClient from '../axiosClient';
import logo from '../assets/logo.png';

function Invoice({ show, onClose, selectedPayment }) {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const invoiceRef = useRef();

  useEffect(() => {
    if (show && selectedPayment) {
      axiosClient
        .get(`/payments/${selectedPayment}`)
        .then(res => setPaymentDetails(res.data.payment))
        .catch(err => {
          console.error(err);
          Swal.fire('Error', 'Could not load invoice.', 'error');
        });
    }
  }, [show, selectedPayment]);

  const handlePrint = () => {
    window.print();
  };

  if (!show) return null;
  if (!paymentDetails) return <div className="modal-overlay">Loading invoice...</div>;

  return (
    <div className="modal-overlay">
      <div className="modal add-food-modal">
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="invoice-content" ref={invoiceRef}>
          <div className="invoice-header">
            <img src={logo} alt="Ollinati Catering" className="company-logo" />
            <div className="company-contact">
              <div>📞 0919-3745-162 / 0933-3960-877</div>
              <div>📍 Ron Pavilion Bunsuran 1st Pandi, Bulacan</div>
            </div>
          </div>

          <div className="invoice-details">
            <div className="invoice-row">
              <span>Invoice No.: R-{String(paymentDetails.payment_id).padStart(5, '0')}</span>
              <span className="invoice-divider">|</span>
              <span>Date: {new Date(paymentDetails.payment_date).toLocaleDateString()}</span>
            </div>
            <div className="customer-row">
              Customer Name: {paymentDetails.booking.customer.customer_firstname}{' '}
              {paymentDetails.booking.customer.customer_middlename
                ? paymentDetails.booking.customer.customer_middlename + ' '
                : ''}
              {paymentDetails.booking.customer.customer_lastname}
            </div>
          </div>

          <div className="invoice-table">
            <div className="invoice-table-header">
              <span>Description</span>
              <span>Price</span>
            </div>
            <div className="invoice-table-row">
              <span>{paymentDetails.remarks}</span>
              <span>
                {parseFloat(paymentDetails.amount_paid).toLocaleString('en-PH', {
                  style: 'currency',
                  currency: 'PHP',
                })}
              </span>
            </div>
          </div>

          <div className="invoice-total">
            <div className="total-row">
              <span className="total-label">Total</span>
              <span>
                {parseFloat(paymentDetails.amount_paid).toLocaleString('en-PH', {
                  style: 'currency',
                  currency: 'PHP',
                })}
              </span>
            </div>
            <div className="payment-details">
              <div className="payment-row">
                <span>Cash</span>
                <span>
                  {parseFloat(paymentDetails.cash_given).toLocaleString('en-PH', {
                    style: 'currency',
                    currency: 'PHP',
                  })}
                </span>
              </div>
              <div className="payment-row">
                <span>Change</span>
                <span>
                  {parseFloat(paymentDetails.change_given).toLocaleString('en-PH', {
                    style: 'currency',
                    currency: 'PHP',
                  })}
                </span>
              </div>
            </div>
          </div>

          {paymentDetails.proof_image && (
            <div className="proof-section">
              <center>
                <h4>Proof of Payment</h4>
                <img
                  src={`http://localhost:8000/storage/${paymentDetails.proof_image}`}
                  alt="Proof of Payment"
                  style={{
                    maxWidth: '50%',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                />
              </center>
            </div>
          )}

          <div className="thank-you">
            ***** THANK YOU *****
          </div>
          <center><button onClick={handlePrint} className="edit-btn print-btn">🖨️ Print Invoice</button></center>
        </div>
      </div>
    </div>
  );
}

export default Invoice;
