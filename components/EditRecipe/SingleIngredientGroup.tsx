import React, { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import TextInput from '../ui/text-input/text-input';
import Button from '../ui/button/button';
import { IngredientFormatted, IngredientGroup } from '../../lib/types';
import Icon from '../ui/icon/icon';

interface SingleIngredientGroupProps {
    group: IngredientGroup,
    ingredients: IngredientFormatted[],
    groups: IngredientGroup[],
    renameGroup: Function
}

export default function SingleIngredientGroup(props: SingleIngredientGroupProps) {

    const { group, ingredients, groups, renameGroup } = props

    const [editingGroup, setEditingGroup] = useState(false)
    const [newGroupName, setNewGroupName] = useState(null)
    const [isGroupNameAllowed, setIsGroupNameAllowed] = useState(false)


    const groupNameSchema = z.object({
        groupName: z.string({
            required_error: "Group name is required",
            invalid_type_error: "Group name must be a string",
        }).nonempty({ message: 'A group name is required' }).min(3)
    })

    const onSubmit = (data: any) => {
        console.log('Submit', data)

        let groupsLowercase = []
        groups.forEach(group => {
            groupsLowercase.push((group.name.toLowerCase()))
        })

        if (groupsLowercase.includes(data.groupName.toLowerCase()) && (data.groupName !== group.name)) {
            setError("groupName", {
                type: "manual",
                message: "A group with this name already exists",
            })
            return
        }

        renameGroup(group.name, data.groupName)
        setEditingGroup(false)

        // createGroup(data)
    }

    // Set the group name by default
    useEffect(() => {
        setValue("groupName", group.name)
    }, [group])

    const methods = useForm({ resolver: zodResolver(groupNameSchema), mode: 'onChange' });
    const { handleSubmit, formState: { errors, isValid }, setValue, clearErrors, setError } = methods

    return (
        <div className="bg-white p-4 rounded-md shadow-md">
            <div className="flex items-center justify-between">
                {/* Reorder icon & Group Name */}
                <div className="flex items-center space-x-2">
                    <Icon type="menu" />
                    {editingGroup ?
                        <div className="flex items-center">
                            <FormProvider {...methods}>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex items-center">
                                    <TextInput errorMessage={errors.groupName?.message} label="Group name" registerAs="groupName" type="text" />
                                    {isValid && <Button as="button" type="submit" background="primary-medium" disabled={!isValid} icon="check"></Button>
                                    }
                                </form>
                            </FormProvider>
                        </div>
                        :
                        <div className="flex">
                            <div>{group.name}</div>
                            <div onClick={() => setEditingGroup(true)} className="cursor-pointer">
                                <Icon type="edit" />
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}
