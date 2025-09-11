import React from "react";
import "./TermsAndConditions.css";

function TermsAndConditions({ show, onClose, onConfirm, agreed, onToggleAgree }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Terms and Conditions</h3>

        <div className="terms-box">
            <p>
                By booking our catering services, you agree to the terms outlined
                in this contract, including cancellation policies, payment terms,
                and service conditions:
            </p>

            <ul>
                <li>ONLY 2 BASIN of any kind of food is allowed to bring inside.</li>
                <li>
                Bringing of Lechon is allowed provided that there will be a Php500.00
                charge for each Lechon brought inside the premises of Ron Pavilion.
                An additional Php300.00 will be charged if the management assigns
                one of its staff to chop the Lechon.
                </li>
                <li>
                Any kinds of LIQUORS/ALCOHOLIC BEVERAGES are not allowed. However,
                corkage will be charged per bottle or per case if liquor is brought in.
                The corkage amount depends on the type of liquor.
                </li>
                <li>
                OUTSOURCED BALLOONS AND FLOWER arrangements must be done outside the pavilion.
                A penalty of Php 2,000.00 applies if done inside the venue.  
                Deposit for softdrinks case is Php 250.
                </li>
                <li>
                Four (4) hours is the maximum time allotted for any occasion.  
                Php 1,500.00 will be charged for every succeeding hour beyond the 4 hours.
                </li>
                <li>
                The management will provide the exact number of chairs and tables
                based on the guest count in the agreement. Additional tables and chairs
                cost Php 100.00 per set.
                </li>
                <li>
                Bringing any electrical equipment such as mobile sound systems, projector,
                photobooth, lights, etc. will incur Php 2,000.00 per equipment category.
                </li>
                <li>
                The Client agrees not to post negative information or discriminatory comments
                on social media, online forums, or websites. The management reserves the right
                to resolve any incidents directly with the party involved.
                </li>
                <li>
                The management is not responsible for any loss of belongings (due to negligence,
                theft, etc.) or damages to cars inside or outside the premises.
                </li>
                <li>
                Php 2,000.00 reservation fee is required to secure the date (NON-REFUNDABLE).
                </li>
                <li>
                Payment terms: 80% of the total must be paid 10 days prior to the event.
                The remaining 20% should be settled after the event.
                </li>
            </ul>
        </div>

        <div className="checkbox-row">
          <input
            type="checkbox"
            id="modal-agree"
            checked={agreed}
            onChange={onToggleAgree}
          />
          <label htmlFor="modal-agree">
            I have read and agree to the Terms and Conditions inside and outside of the premises of Ron Pavilion. That I will be held liable and responsible for any damages and loss of property to any given events of happenings.
          </label>
        </div>

        <div className="modal-buttons">
          <button onClick={onClose} className="user-cancel-btn">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="user-save-btn"
            disabled={!agreed}
          >
            Confirm & Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;