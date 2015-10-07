Ext.define('dinoContacts.controller.MainController', {
    extend : 'Ext.app.Controller',
    filter: "",
    config: {
        stores : ['contactStore'],
        models : ['contactModel'],

        refs: {
            mainView : 'container[itemId=mainView]'
            ,authView : 'container[itemId=authView]'
            ,titlebar : 'titlebar'
            ,contactsList : 'list[itemId=contactsList]'
            ,nameFilter : 'textfield[itemId=nameFilter]'
            ,login : 'textfield[itemId=login]'
            ,titlebar : 'titlebar[itemId=titlebar]'
            ,password : 'passwordfield[itemId=password]'
            ,btnAuth : 'button[itemId=btnAuth]'
            ,btnCloseAuth : 'button[itemId=btnCloseAuth]'
            ,menuBtnUpdate : 'button[itemId=menuUpdate]'
            ,btnShowSettingsMenu : 'button[itemId=showSettingsMenu]'
        },

        control: {
            mainView: {
                show: function () {
                    createMenu();
                    this.getNameFilter().focus();
                }
            },
            contactsList : {
                initialize : 'contactsListInit'
                ,disclose : 'contactsListDisclose'
                ,itemdoubletap : 'contactsListItemtap'
            }
            ,nameFilter : {
                keyup : 'onFilterKeyup'
                ,change : 'onFilterChange'
            }
            ,btnAuth: {
                tap: 'onAuth'
            }
            ,btnCloseAuth: {
                tap: function(){
                    this.getAuthView().destroy();
                }
            }
            ,menuBtnUpdate: {
                tap: function () {
                    Ext.Viewport.toggleMenu('left');
                    this.loadContacts();
                }
            }
            ,btnShowSettingsMenu: {
                tab: 'onShowSettingsMenu'
            }
        }

    }

    ,onFilterKeyup: function(field) {
        return this.nameFilter(field.getValue());
    }

    ,onFilterChange: function(field, newValue) {
        return this.nameFilter(newValue);
    }

    ,nameFilter : function(newValue) {
        var me = this;

        var oldValue = me.filter || "";
        var filterValue = (newValue || "").toLowerCase().trim();
        var contactStore = Ext.getStore('contactStore');

        if (filterValue.indexOf(oldValue) !== 0) {
            contactStore.clearFilter();
        }
        me.filter = newValue;
        contactStore.filter(function (item) {
                function find(property) {
                    var propValue = item.get(property).toLowerCase();
                    if (propValue) {
                        return propValue.indexOf(filterValue) > -1;
                    }
                }

                return find('FirstName') || find('LastName') || find('GroupAndDept') || find('Name') || find('Title');
            }
        );

        location.hash = filterValue;

        var autoDiscloseMobile = 3;
        var autoDiscloseDesktop = 5;
        var fewAmount = Ext.os.deviceType == 'Phone' ? autoDiscloseMobile : autoDiscloseDesktop;

        var count = contactStore.getCount();

        if (count <= fewAmount) {
            this.discloseContactsAll();
        }
    },

    contactsListInit : function(list){
        /*
        hack
        because show event doesn't work

        @todo try to find proper fix
         */
        var me = this;

        setTimeout(function () {
            var height = me.getMainView().element.getHeight() - me.getTitlebar().element.getHeight();

            Ext.Animator.run({
                element: list.element,
                duration: 500,
                easing: 'ease-in',
                preserveEndState: true,
                from: {
                    height: list.getHeight()
                },
                to: {
                    height: height
                }
            });
        }, 1000);
    }

    ,discloseContactsAll : function() {
        var me = this
            ,list = me.getContactsList()
            ,viewItems = list.getViewItems()
            ,item
        ;

        for(var i=0; i< viewItems.length; i++) {
            item = viewItems[i];
            var element = item.element.dom;
            var record = list.getStore().getAt(i);
            me.discloseContactsItem(element, record);
        }
    }

    ,contactsListDisclose: function(list, record, dataItem, index, e, eOpts){
        var target = e.getTarget();
        this.discloseContactsItem(target.parentElement, record);
    }

    ,contactsListItemtap: function(list, index, dataItem, record, e, eOpts){
        var target = e.getTarget();
        this.discloseContactsItem(target, record);
    }

    ,discloseContactsItem : function(element, record) {
        var detailedInfo = element.getElementsByClassName('detailed_info');
        detailedInfo = detailedInfo.length && detailedInfo[0];

        detailedInfo.style.display = '';

        var fotoContainer = detailedInfo.getElementsByClassName("foto")[0];
        if (!fotoContainer.innerHTML){
            var fotoPath = '/foto/'
                , foto = '<img src="' + fotoPath + record.get('Foto') + '" />';
            fotoContainer.innerHTML = foto;
        }
    }

    ,launch: function() {
        var me = this
            ,msg = 'Loading data...'
            ,contactStore = Ext.getStore('contactStore');

        var preloadedContacts = me.getContacts();

        if (!preloadedContacts || !preloadedContacts.data.length) {
            me.loadContacts();
        }
        else{
            Ext.Viewport.setMasked({xtype: 'loadmask',
                message: msg});

            contactStore.setData(preloadedContacts.data);

            me.setTitlebarDatetime(preloadedContacts.time);
            me.setDefaultFilter();

            Ext.Viewport.setMasked(false);
        }
    }

    ,setTitlebarDatetime: function(timestamp){
        var me = this
            , titleBar = me.getTitlebar()
            , dateTime = (new Date(timestamp)).toLocaleString()
            , dateTime = '<sup style="color:#999">on ' + dateTime + '</sup>';

        titleBar.setTitle('DINO Contacts ' + dateTime);
    }

    ,init: function() {
    }

    , showAuth: function (closable) {
        var authView = Ext.Viewport.add([ { 'xtype': 'authView', closable: true } ]);
        authView.show();
    }

    //any objections for this function - send to http://diveintohtml5.info/storage.html )))
    ,supports_html5_storage : function() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }

    ,saveContacts : function(contacts){
        var me = this;

        if (me.supports_html5_storage()) {
            try {
                localStorage["contacts"] = contacts;
            } catch (e) {
                console && console.error && console.error("Can not save contacts to storage.");
            }
        }
    }

    ,getContacts : function(){
        var me = this;

        if (me.supports_html5_storage()) {
            var contacts = localStorage["contacts"];
            if (contacts) {
                try {
                    contacts = JSON.parse(contacts);
                } catch (e) {
                    contacts = {data: []};
                }
            }
            else{
                contacts = {data: []};
            }
            return contacts;
        }
    }

    ,onAuth: function(){
        var me = this
            , password = me.getPassword()
            , login = me.getLogin()
            , passwordValue = password.getValue()
            , loginValue = login.getValue();

        if (!passwordValue || !loginValue) {
            alert("Login and password are required!");
            return;
        }

        me.loadContacts(loginValue, passwordValue);
    }

    ,loadContacts: function(){
        var me = this
            , msg = 'Loading data...'
            , contactStore = Ext.getStore('contactStore');

        Ext.Viewport.setMasked({xtype: 'loadmask',
            message: msg});

        Ext.Ajax.request({
            url: '/api/',
            params: {},
            success: function(response){
                var json = JSON.parse(response.responseText);
                Ext.Viewport.setMasked(false);

                if (json.data && json.data.length) {
                    me.saveContacts(response.responseText);
                    contactStore.setData(json.data);
                    me.setTitlebarDatetime(json.time);
                    me.setDefaultFilter();
                } else {
                    alert("Please, check username and password.")
                }
            },
            failure: function(response){
                Ext.Viewport.setMasked(false);
                alert('Server error. Please, contact skype: denis.obydennykh\n' +
                    'Response status code ' + response.status);
            }
        });
    }

    ,setDefaultFilter: function () {
        var me = this
            ,defaultFilter = document.location.hash.substr(1);

        if (defaultFilter) {
            me.getNameFilter().setValue(defaultFilter);
        }
    }
});