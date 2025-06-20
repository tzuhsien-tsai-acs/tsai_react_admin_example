import { DataTable, List, ReferenceField, UrlField } from 'react-admin';

export const PhotoList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="albumId">
                <ReferenceField source="albumId" reference="albums" />
            </DataTable.Col>
            <DataTable.Col source="id" />
            <DataTable.Col source="title" />
            <DataTable.Col source="url">
                <UrlField source="url" />
            </DataTable.Col>
            <DataTable.Col source="thumbnailUrl" />
        </DataTable>
    </List>
);