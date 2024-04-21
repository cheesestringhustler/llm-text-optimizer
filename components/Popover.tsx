import React from 'react';
import styles from './Popover.module.scss'; // Assume you have some basic styling for the popover

interface PopoverProps {
    message: string;
    onAccept: () => void; // Callback for accept action
    onReject: () => void; // Callback for reject action
}

const Popover: React.FC<PopoverProps> = ({ message, onAccept, onReject }) => {
    return (
        <div className={styles.popover}>
            <p>{message}</p>
            <button onClick={onAccept}>Accept</button>
            <button onClick={onReject}>Reject</button>
        </div>
    );
};

export default Popover;