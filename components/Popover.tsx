import React from 'react';
import styles from './Popover.module.scss'; // Assume you have some basic styling for the popover

interface PopoverProps {
    message: string;
    // onAccept: () => void;
}

const Popover: React.FC<PopoverProps> = ({ message }) => {
    return (
        <div className={styles.popover}>
            <p>{message}</p>
            {/* <button onClick={onAccept}>Accept</button> */}
        </div>
    );
};

export default Popover;