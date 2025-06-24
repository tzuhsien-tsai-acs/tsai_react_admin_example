import { useMediaQuery, Theme } from "@mui/material";
import { List, SimpleList, DataTable, EmailField, Show, SimpleShowLayout, TextField, UrlField } from "react-admin";

export const UserShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="username" />
            <EmailField source="email" />
            <TextField source="address.street" />
            <TextField source="phone" />
            <TextField source="website" />
            <TextField source="company.name" />
        </SimpleShowLayout>
    </Show>
);

export const UserList = () => {
    const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
    return (
        <List>
            {isSmall ? (
                <SimpleList
                    primaryText={(record) => record.name}
                    secondaryText={(record) => record.username}
                    tertiaryText={(record) => record.email}
                />
            ) : (
                <DataTable>
                    <DataTable.Col source="id" />
                    <DataTable.Col source="name" />
                    <DataTable.Col source="username" />
                    <DataTable.Col source="email">
                        <EmailField source="email" />
                    </DataTable.Col>
                    <DataTable.Col source="address.street" />
                    <DataTable.Col source="phone" />
                    <DataTable.Col 
                        source="website" 
                        render={(record) => <UrlField record={record} source="website" />} 
                    />
                    <DataTable.Col source="company.name" />
                    <DataTable.Col source="address.zipcode" />
                </DataTable>
            )}
        </List>
    );
};