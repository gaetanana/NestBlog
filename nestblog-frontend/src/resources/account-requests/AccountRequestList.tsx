// src/resources/account-requests/AccountRequestList.tsx - Corrigé
import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EmailField,
    DateField,
    FunctionField,
    Button,
    useNotify,
    useRecordContext,
    useDataProvider,
    useRefresh
} from 'react-admin';
import { Chip, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';

interface StatusFieldProps {
    source: string;
}

const StatusField = (props: StatusFieldProps) => {
    const record = useRecordContext();
    if (!record) return null;

    let color: 'success' | 'warning' | 'error' | 'default' = 'default';
    if (record.status === 'approved') color = 'success';
    if (record.status === 'rejected') color = 'error';
    if (record.status === 'pending') color = 'warning';

    return <Chip label={record.status} color={color} size="small" />;
};

const ApproveButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const dataProvider = useDataProvider() as any; // Cast to any to access custom methods
    const refresh = useRefresh();

    if (!record || record.status !== 'pending') return null;

    const handleApprove = async () => {
        try {
            await dataProvider.approveAccountRequest(record.id);
            notify('Account request approved', { type: 'success' });
            refresh();
        } catch (error: any) {
            notify(`Error: ${error.message}`, { type: 'error' });
        }
    };

    return (
        <Button
            label="Approve"
            onClick={handleApprove}
            color="primary"
            startIcon={<CheckCircleOutlineIcon />}
        />
    );
};

const RejectButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const dataProvider = useDataProvider() as any; // Cast to any to access custom methods
    const refresh = useRefresh();

    if (!record || record.status !== 'pending') return null;

    const handleReject = async () => {
        try {
            await dataProvider.rejectAccountRequest(record.id);
            notify('Account request rejected', { type: 'success' });
            refresh();
        } catch (error: any) {
            notify(`Error: ${error.message}`, { type: 'error' });
        }
    };

    return (
        <Button
            label="Reject"
            onClick={handleReject}
            color="error"
            startIcon={<CancelIcon />}
        />
    );
};

const AccountRequestList = () => (
    <List>
        <Datagrid>
            <TextField source="username" />
            <EmailField source="email" />
            <TextField source="firstName" />
            <TextField source="lastName" />
            <TextField source="reason" />
            <StatusField source="status" />
            <DateField source="createdAt" />
            <FunctionField
                label="Actions"
                render={record => (
                    <Box>
                        <ApproveButton />
                        <RejectButton />
                    </Box>
                )}
            />
        </Datagrid>
    </List>
);

export default AccountRequestList;