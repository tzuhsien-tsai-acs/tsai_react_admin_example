import { DataTable, EmailField, List, ReferenceField } from 'react-admin';

export const CommentList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="postId">
                <ReferenceField source="postId" reference="posts" />
            </DataTable.Col>
            <DataTable.Col source="id" />
            <DataTable.Col source="name" />
            <DataTable.Col source="email">
                <EmailField source="email" />
            </DataTable.Col>
            <DataTable.Col source="body" />
        </DataTable>
    </List>
);