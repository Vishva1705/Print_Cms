import React, { useState } from 'react';
import '../Styles/ArticleEditor.css';
import Lottie from "lottie-react";
import Loading from '../Assest/Loading.json'

export default function Testing() {

    const [showMessage, setShowMessage] = useState(false);
    const handleOpenMessage = () => {
        setShowMessage(true);
    };

    const handleCloseMessage = () => {
        setShowMessage(false);
    };

    const MessageBox = ({ message, onClose }) => {
        return (
            <div className="message-box-overlay">
                <div className="message-box">
                    <p>{message}</p>
                    <button onClick={onClose} className="btn btn-primary">
                        OK
                    </button>
                </div>
            </div>
        );
    };


    const data = [
        { Page_id: 'Front_Pg', Zone_id: 'Chennai', Active: 1 },
        { Page_id: 'National_01', Zone_id: 'Chennai', Active: 1 },
        { Page_id: 'Sports_Pg', Zone_id: 'Chennai', Active: 1 },
        { Page_id: 'Back_Pg', Zone_id: 'Chennai', Active: 1 },
        { Page_id: 'Calendar_Pg', Zone_id: 'Chennai', Active: 1 },
        { Page_id: 'Regional_01', Zone_id: 'Chennai', Active: 1 },
        { Page_id: 'Regional_02', Zone_id: 'Chennai', Active: 1 },
        { Page_id: 'Regional_03', Zone_id: 'Chennai', Active: 1 },
        { Page_id: 'Edit_01', Zone_id: 'Chennai', Active: 1 },
        { Page_id: 'MainSub_Maya_01', Zone_id: 'Chennai', Active: 1 },
        { Page_id: 'TNadu_01', Zone_id: 'Chennai', Active: 1 },
        { Page_id: 'TNadu_02', Zone_id: 'Chennai', Active: 1 },
    ];

    const [checkboxes, setCheckboxes] = useState(data);
    console.log(checkboxes);

    const handleCheckboxChange = (index) => {
        const newCheckboxes = [...checkboxes];
        newCheckboxes[index].Active = newCheckboxes[index].Active === 1 ? 2 : 1;
        setCheckboxes(newCheckboxes);
    };

    return (

        <div className="main-content">
            <div>
                {checkboxes.map((item, index) => (
                    <div key={item.Page_id}>
                        <label>
                            <input
                                type="checkbox"
                                checked={item.Active === 1}
                                onChange={() => handleCheckboxChange(index)}
                            />
                            {item.Page_id}
                        </label>
                    </div>
                ))}
            </div>
        </div>
        
    );


}
