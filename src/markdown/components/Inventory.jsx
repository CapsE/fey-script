import {SimpleSchema2Bridge} from 'uniforms-bridge-simple-schema-2';
import SimpleSchema from 'simpl-schema';
import styles from './Inventory.module.css';
import {AutoField, AutoForm, ListDelField, ListField} from 'uniforms-semantic';
import {observer} from 'mobx-react';

const bridge = new SimpleSchema2Bridge(
    new SimpleSchema({
        'items': {type: Array, minCount: 1},
        'items.$': {type: Object},
        'items.$.amount': {type: SimpleSchema.Integer, defaultValue: 1},
        'items.$.name': {type: String},
    }),
);

const CustomItemField = ({name, ...props}) => (
    <tr className={styles.itemEntry}>
        <td>
            <ListDelField name={name}/>
        </td>
        <td>
            <AutoField name={`${name}.amount`} {...props} />
        </td>
        <td>
            <AutoField name={`${name}.name`} {...props} />
        </td>
    </tr>
);

export const Inventory = observer(({character}) => {
    const char = character;
    const inventory = char?.inventory;

    const onChange = (data) => {
        char.inventory = data.items;
    };

    return <div className={styles.inventory}>
        <h3>Inventory</h3>
        <AutoForm
            schema={bridge}
            model={{items: inventory || []}}
            onSubmit={onChange}
            autosaveDelay={500}
            autosave={true}
        >
            <ListField
                name="items"
            >
                <CustomItemField name="$"/>
            </ListField>

        </AutoForm>
    </div>;
});
