Ext.define('dinoContacts.view.Auth', {
    extend: 'Ext.Container',
    alias: 'widget.authView',
    requires: [
        'Ext.TitleBar'
    ],
    config: {
        scrollable: true,
        itemId: 'authView',
        title: 'DINO Contacts: authorization'

        , defaults: {
            style: {
                margin: '10px'
            }
        }

        , items: [
            {
                xtype: 'image',
                src: 'http://www.dins.ru/wp-content/uploads/2011/03/dins-logo1.jpg',
                width: 132,
                height: 71,
                style: {
                    margin: '0 auto'
                    , display: 'block'
                }
            },
            {
                itemId: 'label'
                , html: 'Please, enter you credentials to download contacts information' +
                    ' from corporate wiki'
            },
            {
                xtype: 'textfield',
                itemId: 'login',
                style: 'margin: 5px',
                placeHolder: 'Wiki login'
            },
            {
                xtype: 'passwordfield',
                itemId: 'password',
                style: 'margin: 5px',
                placeHolder: 'Wiki password'
            },
            {
                xtype: 'button',
                text: 'Authorize',
                itemId: 'btnAuth'
            },
            {
                xtype: 'button',
                style: 'margin: 40px 10px 0',
                text: 'Close',
                itemId: 'btnCloseAuth',
                hidden: true
            }
        ]
        ,listeners: {
            show: function () {
                var isClosable = !!this.getInitialConfig().closable
                    , btnCloseAuth = this.getComponent('btnCloseAuth');

                if (isClosable) {
                    btnCloseAuth.show();
                }
            }
        }
    }});
