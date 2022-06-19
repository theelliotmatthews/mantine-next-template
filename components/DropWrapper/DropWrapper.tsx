import React from 'react';
import { useDrop } from 'react-dnd';
import { ITEM_TYPE } from '../../lib/types';

const DropWrapper = ({ onDrop, children, status, visibleWeek }) => {
    const [{ isOver }, drop] = useDrop({
        accept: ITEM_TYPE,
        canDrop: (item, monitor) => {
            const itemIndex = visibleWeek.findIndex(si => si.status === item.status);
            const statusIndex = visibleWeek.findIndex(si => si.status === status);
            return [itemIndex + 1, itemIndex - 1, itemIndex].includes(statusIndex);
        },
        drop: (item, monitor) => {
            onDrop(item, monitor, status);
        },
        collect: monitor => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <div ref={drop} className="drop-wrapper">
            {React.cloneElement(children, { isOver })}
        </div>
    );
};

export default DropWrapper;
