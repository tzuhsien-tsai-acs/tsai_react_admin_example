import {
    DataTable,
    List,
    ReferenceField,
    UrlField,
    Edit,
    ReferenceInput,
    SimpleForm,
    TextInput,
    EditButton,
    SimpleShowLayout,
    Show,
    TextField,
    ShowButton,
    usePermissions // 导入 usePermissions hook
} from 'react-admin';

// PhotoEdit 和 PhotoShow 组件保持不变
export const PhotoEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" InputProps={{ disabled: true }} />
            <ReferenceInput source="albumId" reference="albums" />
            <TextInput source="title" />
            <TextInput source="url" />
            <TextInput source="thumbnailUrl" />
            <TextInput source="body" multiline rows={5} />
        </SimpleForm>
    </Edit>
);

export const PhotoShow = () => (
    <Show>
        <SimpleShowLayout>
            <ReferenceField source="albumId" reference="albums" />
            <TextField source="id" />
            <TextField source="title" />
            <UrlField source="url" />
            <TextField source="thumbnailUrl" />
        </SimpleShowLayout>
    </Show>
);

export const PhotoList = () => {
    const { permissions } = usePermissions(); // 获取当前用户的权限

    return (
        <List>
            <DataTable rowClick={false}>
                <DataTable.Col source="id" />
                <DataTable.Col source="albumId">
                    <ReferenceField source="albumId" reference="albums" />
                </DataTable.Col>
                <DataTable.Col source="title" />
                <DataTable.Col source="url">
                    <UrlField source="url" />
                </DataTable.Col>
                <DataTable.Col source="thumbnailUrl" />
                {/* 只有当 permissions 为 'admin' 时才渲染 EditButton */}
                {permissions === 'admin' && (
                    <DataTable.Col source="actions"> {/* 建议为操作列取一个更有意义的 source 名称 */}
                        <EditButton />
                    </DataTable.Col>
                )}
                {/* ShowButton 总是显示 */}
                <DataTable.Col source="show"> {/* 建议为操作列取一个更有意义的 source 名称 */}
                    <ShowButton />
                </DataTable.Col>
            </DataTable>
        </List>
    );
};