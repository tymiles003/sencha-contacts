Ext.define('dinoContacts.store.contactStore', {
    extend: 'Ext.data.Store',
    requires: [
        'dinoContacts.model.contactModel',
        'Ext.data.proxy.LocalStorage'
    ],
    config : {
        model: 'dinoContacts.model.contactModel'
        , autoLoad: true
        , grouper: {
            groupFn: function(record) {
                return record.get('GroupAndDept');
            }
        }
        , proxy: {
            type: 'localstorage',
            id  : 'contacts'
        }
/*
        data: [
            { //may be used for debug }
        ]
*/
    }
});
