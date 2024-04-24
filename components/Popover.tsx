import React from 'react';

interface PopoverProps {
    message: string;
    onAccept: () => void; // Callback for accept action
    onReject: () => void; // Callback for reject action
}

const Popover: React.FC<PopoverProps> = ({ message, onAccept, onReject }) => {
    return (
        <div className="absolute">
            <p>{message}</p>
            <button onClick={onAccept}>Accept</button>
            <button onClick={onReject}>Reject</button>
        </div>
    );
};

export default Popover;