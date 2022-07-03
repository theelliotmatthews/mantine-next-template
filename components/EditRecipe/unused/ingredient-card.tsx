import { FC, useEffect, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import type { XYCoord, Identifier } from 'dnd-core'
import { ItemTypes } from '../../lib/drop-types'
import { IngredientFormatted, IngredientGroup } from '../../../lib/types'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from "zod";
import Icon from '../ui/icon/icon'
import TextInput from '../ui/text-input/text-input'
import Button from '../ui/button/button'


const style = {
    border: '2px dashed green',
    padding: '0.5rem 1rem',
    marginBottom: '.5rem',
    backgroundColor: 'white',
    cursor: 'move',
}

export interface IngredientCardProps {
    id: any
    text: string
    index: number
    moveCard: (dragIndex: number, hoverIndex: number, id: number, text: string) => void,
    // group: IngredientGroup,
    // ingredients: IngredientFormatted[],
    // groups: IngredientGroup[],
    // renameGroup: Function
}

interface DragItem {
    index: number
    id: string
    type: string
}

export const IngredientCard: FC<IngredientCardProps> = ({ id, text, index, moveCard }) => {
    const ref = useRef<HTMLDivElement>(null)
    const [{ handlerId }, drop] = useDrop<
        DragItem,
        void,
        { handlerId: Identifier | null }
    >({
        accept: ItemTypes.INGREDIENT,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            }
        },
        hover(item: DragItem, monitor) {
            if (!ref.current) {
                return
            }
            const dragIndex = item.index
            const hoverIndex = index

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return
            }

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect()

            // Get vertical middle
            const hoverMiddleY =
                (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

            // Determine mouse position
            const clientOffset = monitor.getClientOffset()

            // Get pixels to the top
            const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return
            }

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return
            }

            // Time to actually perform the action
            moveCard(dragIndex, hoverIndex, id, text)

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex
        },
    })

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.INGREDIENT,
        item: () => {
            return { id, index }
        },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    const opacity = isDragging ? 0 : 1
    drag(drop(ref))


    return (
        <div ref={ref} style={{ ...style, opacity }} data-handler-id={handlerId}>
            <div>{text}</div>

        </div>
    )
}
